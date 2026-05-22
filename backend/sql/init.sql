-- Script inicial: ejecutar una sola vez al crear la base de datos

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS cuentas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  saldo DECIMAL(12, 2) DEFAULT 0.00,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);
