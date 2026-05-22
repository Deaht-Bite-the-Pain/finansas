const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Prueba de conexión a la BD
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ ERROR DE CONEXIÓN A LA BASE DE DATOS:', err.message);
    console.error('   Verifica tu .env: DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT');
  } else {
    console.log('✅ CONEXIÓN A BASE DE DATOS EXITOSA');
    console.log('   BD:', process.env.DB_NAME);
    console.log('   Host:', process.env.DB_HOST);
    console.log('   Usuario:', process.env.DB_USER);
  }
});

module.exports = pool;