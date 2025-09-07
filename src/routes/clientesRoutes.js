const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Rota para listar clientes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        res.status(500).send('Erro ao buscar clientes');
    }
});

// Rota para criar um novo cliente
router.post('/', async (req, res) => {
    const { nome, email, telefone, endereco } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO clientes (nome, email, telefone, endereco) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, email, telefone, endereco]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar cliente:', err);
        res.status(500).send('Erro ao criar cliente');
    }
});

module.exports = router;