const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

// POST /vendas
// body: { cliente_id: null | uuid, itens: [ { produto_id, quantidade } ], forma_pagamento }
router.post('/', async (req, res) => {
  const { cliente_id, itens, forma_pagamento } = req.body;
  if (!Array.isArray(itens) || itens.length === 0) return res.status(400).json({ error: 'Itens são obrigatórios' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // calcular total e validar estoque
    let total = 0;
    for (const item of itens) {
      const p = await client.query('SELECT preco FROM produtos WHERE id = $1', [item.produto_id]);
      if (!p.rows.length) throw new Error('Produto não encontrado: ' + item.produto_id);
      const preco = parseFloat(p.rows[0].preco);
      const subtotal = preco * item.quantidade;
      total += subtotal;

      // checar estoque
      const est = await client.query('SELECT quantidade FROM estoque WHERE produto_id = $1 FOR UPDATE', [item.produto_id]);
      const atual = est.rows.length ? parseInt(est.rows[0].quantidade, 10) : 0;
      if (atual < item.quantidade) throw new Error('Estoque insuficiente para produto ' + item.produto_id);
    }

    const vendaId = uuidv4();
    await client.query('INSERT INTO vendas (id, cliente_id, total, forma_pagamento) VALUES ($1,$2,$3,$4)', [vendaId, cliente_id || null, total, forma_pagamento || null]);

    for (const item of itens) {
      const p = await client.query('SELECT preco FROM produtos WHERE id = $1', [item.produto_id]);
      const preco = parseFloat(p.rows[0].preco);
      const subtotal = preco * item.quantidade;
      await client.query('INSERT INTO venda_itens (venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES ($1,$2,$3,$4,$5)', [vendaId, item.produto_id, item.quantidade, preco, subtotal]);

      // debitar estoque
      await client.query('UPDATE estoque SET quantidade = quantidade - $1, atualizado_em = now() WHERE produto_id = $2', [item.quantidade, item.produto_id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ id: vendaId, total });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /vendas
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM vendas ORDER BY data_venda DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar vendas' });
  }
});

// GET /vendas/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const venda = await pool.query('SELECT * FROM vendas WHERE id = $1', [id]);
    if (!venda.rows.length) return res.status(404).json({ error: 'Venda não encontrada' });
    const itens = await pool.query('SELECT vi.*, p.nome_produto FROM venda_itens vi LEFT JOIN produtos p ON vi.produto_id = p.id WHERE vi.venda_id = $1', [id]);
    res.json({ venda: venda.rows[0], itens: itens.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar venda' });
  }
});

module.exports = router;
