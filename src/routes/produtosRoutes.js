const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

// POST /produtos
router.post('/', async (req, res) => {
  const { sku, nome_produto, descricao, preco, peso, categoria, quantidade, localizacao } = req.body;
  if (!sku || !nome_produto || preco == null) return res.status(400).json({ error: 'sku, nome_produto e preco são obrigatórios' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const prodId = uuidv4();
    await client.query(
      `INSERT INTO produtos (id, sku, nome_produto, descricao, preco, peso, categoria) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [prodId, sku, nome_produto, descricao, preco, peso, categoria]
    );

    if (quantidade != null) {
      await client.query(
        `INSERT INTO estoque (produto_id, quantidade, localizacao) VALUES ($1,$2,$3)`,
        [prodId, quantidade, localizacao || null]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id: prodId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao inserir produto' });
  } finally {
    client.release();
  }
});

// GET /produtos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT p.*, e.quantidade, e.localizacao FROM produtos p LEFT JOIN estoque e ON p.id = e.produto_id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// GET /produtos/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT p.*, e.quantidade, e.localizacao FROM produtos p LEFT JOIN estoque e ON p.id = e.produto_id WHERE p.id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar produto' });
  }
});

// PUT /produtos/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_produto, descricao, preco, peso, categoria, quantidade, localizacao } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE produtos SET nome_produto=$1, descricao=$2, preco=$3, peso=$4, categoria=$5 WHERE id=$6`,
      [nome_produto, descricao, preco, peso, categoria, id]
    );

    if (quantidade != null) {
      const resEst = await client.query('SELECT id FROM estoque WHERE produto_id = $1', [id]);
      if (resEst.rows.length) {
        await client.query('UPDATE estoque SET quantidade=$1, localizacao=$2, atualizado_em=now() WHERE produto_id=$3', [quantidade, localizacao || null, id]);
      } else {
        await client.query('INSERT INTO estoque (produto_id, quantidade, localizacao) VALUES ($1,$2,$3)', [id, quantidade, localizacao || null]);
      }
    }

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  } finally {
    client.release();
  }
});

// DELETE /produtos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

module.exports = router;
