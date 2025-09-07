# RID176780_Desafio01_DNCommerce

Projeto de exemplo para o desafio — substitua `RID176780` pelo seu RID.

## Como executar

1. Copie `.env.example` para `.env` e preencha as credenciais do Postgres.
2. Crie o banco Postgres (ex: `dncommerce_dev`).
3. Rode o script SQL `src/db/migrations.sql` para criar as tabelas:

```bash
psql -U seu_usuario -d dncommerce_dev -f src/db/migrations.sql
```

4. Instale as dependências:

```
npm install
```

5. Inicie o servidor:

```
npm start
```

## Endpoints

- `POST /produtos` — cadastra produto
- `GET /produtos` — lista produtos
- `GET /produtos/:id` — busca produto
- `PUT /produtos/:id` — atualiza produto
- `DELETE /produtos/:id` — remove produto
- `POST /vendas` — cria venda
- `GET /vendas` — lista vendas
- `GET /vendas/:id` — detalhes da venda

## Observações

- UUIDs podem ser gerados no Postgres com extensão ou no Node (o projeto gera com `uuid`).
- Para ambiente real, recomendo usar migrations via `knex`/`sequelize`/`typeorm` e adicionar validações com `Joi`.
