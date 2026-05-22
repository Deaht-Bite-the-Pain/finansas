const pool = require('../config/db');

exports.createAccount = async (req, res) => {
  const { nombre, tipo } = req.body; // Ej: { nombre: "Ahorros", tipo: "Banco" }
  const usuario_id = req.user.id;
  
  try {
    const newAccount = await pool.query(
      'INSERT INTO cuentas (nombre, tipo, saldo, usuario_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, tipo, 0.00, usuario_id] // El saldo arranca en 0
    );
    res.status(201).json(newAccount.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la cuenta' });
  }
};

exports.getAccounts = async (req, res) => {
  const usuario_id = req.user.id;
  
  try {
    const accounts = await pool.query('SELECT * FROM cuentas WHERE usuario_id = $1', [usuario_id]);
    res.json(accounts.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las cuentas' });
  }
};