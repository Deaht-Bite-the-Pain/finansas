const pool = require('../config/db');

const DEFAULT_CATEGORIES = [
  { nombre: 'Salario', tipo: 'ingreso' },
  { nombre: 'Freelance', tipo: 'ingreso' },
  { nombre: 'Otros ingresos', tipo: 'ingreso' },
  { nombre: 'Alimentación', tipo: 'gasto' },
  { nombre: 'Transporte', tipo: 'gasto' },
  { nombre: 'Entretenimiento', tipo: 'gasto' },
  { nombre: 'Salud', tipo: 'gasto' },
  { nombre: 'Otros gastos', tipo: 'gasto' },
];

const seedDefaultCategories = async (usuarioId) => {
  for (const cat of DEFAULT_CATEGORIES) {
    await pool.query(
      'INSERT INTO categorias (nombre, tipo, usuario_id) VALUES ($1, $2, $3) ON CONFLICT (usuario_id, nombre, tipo) DO NOTHING',
      [cat.nombre, cat.tipo, usuarioId]
    );
  }
};

exports.getCategories = async (req, res) => {
  const usuario_id = req.user.id;
  const { tipo } = req.query;

  try {
    const count = await pool.query('SELECT COUNT(*) FROM categorias WHERE usuario_id = $1', [usuario_id]);
    if (parseInt(count.rows[0].count, 10) === 0) {
      await seedDefaultCategories(usuario_id);
    }

    let query = 'SELECT * FROM categorias WHERE usuario_id = $1';
    const params = [usuario_id];

    if (tipo && ['ingreso', 'gasto'].includes(tipo)) {
      query += ' AND tipo = $2';
      params.push(tipo);
    }

    query += ' ORDER BY tipo, nombre';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

exports.createCategory = async (req, res) => {
  const { nombre, tipo } = req.body;
  const usuario_id = req.user.id;

  if (!nombre || !['ingreso', 'gasto'].includes(tipo)) {
    return res.status(400).json({ error: 'Nombre y tipo (ingreso/gasto) son obligatorios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO categorias (nombre, tipo, usuario_id) VALUES ($1, $2, $3) RETURNING *',
      [nombre.trim(), tipo, usuario_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre y tipo' });
    }
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};
