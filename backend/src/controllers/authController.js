const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = await pool.query(
      'INSERT INTO usuarios (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    res.status(201).json({ message: 'Usuario creado', user: newUser.rows[0] });
  } catch (error) {
    console.error('Error en register:', error.message);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }
    if (error.code === '42P01') {
      return res.status(500).json({ error: 'Falta la tabla usuarios. Ejecuta setup_completo.sql en pgAdmin' });
    }
    res.status(500).json({ error: 'Error al registrar usuario. Verifica si el email ya existe.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email } });
  } catch (error) {
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
};