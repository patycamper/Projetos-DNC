const pool = require('../db/pool');

async function ajustarEstoque(produtoId, delta) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query('SELECT quantidade FROM estoque WHERE produto_id = $1 FOR UPDATE', [produtoId]);
    if (r.rows.length) {
      await client.query('UPDATE estoque SET quantidade = quantidade + $1 WHERE produto_id = $2', [delta, produtoId]);
    } else {
      await client.query('INSERT INTO estoque (produto_id, quantidade) VALUES ($1,$2)', [produtoId, delta]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { ajustarEstoque };
