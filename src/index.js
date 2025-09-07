const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para habilitar o servidor a ler requisições JSON
app.use(express.json());

// Importa e usa as rotas de clientes
const clientesRoutes = require('./routes/clientesRoutes');
app.use('/clientes', clientesRoutes);

// Importa e usa as rotas de produtos
const produtosRoutes = require('./routes/produtosRoutes');
app.use('/produtos', produtosRoutes);

// Importa e usa as rotas de vendas
const vendasRoutes = require('./routes/vendasRoutes');
app.use('/vendas', vendasRoutes);

// Rota inicial
app.get('/', (req, res) => {
  res.send('A API está funcionando!');
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});