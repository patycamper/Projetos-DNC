-- migrations.sql

-- Se usar gen_random_uuid(), habilite pgcrypto: CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  telefone VARCHAR(50),
  endereco TEXT,
  criado_em TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  nome_produto VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco NUMERIC(12,2) NOT NULL DEFAULT 0,
  peso NUMERIC(10,3),
  categoria VARCHAR(100),
  criado_em TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 0,
  localizacao VARCHAR(100),
  atualizado_em TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  forma_pagamento VARCHAR(50),
  data_venda TIMESTAMP DEFAULT now(),
  criado_em TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venda_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_produtos_sku ON produtos(sku);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda);
