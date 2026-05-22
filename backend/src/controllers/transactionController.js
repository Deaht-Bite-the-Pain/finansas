const pool = require('../config/db');
const {
  verifyAccountOwnership,
  verifyCategoryOwnership,
  adjustAccountBalance,
} = require('../utils/ownership');

const TRANSACTION_SELECT = `
  SELECT t.*, c.nombre AS cuenta_nombre, cat.nombre AS categoria_nombre
  FROM transacciones t
  JOIN cuentas c ON c.id = t.cuenta_id
  JOIN categorias cat ON cat.id = t.categoria_id
`;

exports.getTransactions = async (req, res) => {
  const usuario_id = req.user.id;
  const { cuenta_id, categoria_id, tipo, mes, anio } = req.query;

  try {
    let query = `${TRANSACTION_SELECT} WHERE t.usuario_id = $1`;
    const params = [usuario_id];
    let paramIndex = 2;

    if (cuenta_id) {
      query += ` AND t.cuenta_id = $${paramIndex++}`;
      params.push(cuenta_id);
    }
    if (categoria_id) {
      query += ` AND t.categoria_id = $${paramIndex++}`;
      params.push(categoria_id);
    }
    if (tipo && ['ingreso', 'gasto'].includes(tipo)) {
      query += ` AND t.tipo = $${paramIndex++}`;
      params.push(tipo);
    }
    if (mes && anio) {
      query += ` AND EXTRACT(MONTH FROM t.fecha) = $${paramIndex++}`;
      params.push(mes);
      query += ` AND EXTRACT(YEAR FROM t.fecha) = $${paramIndex++}`;
      params.push(anio);
    }

    query += ' ORDER BY t.fecha DESC, t.id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
};

exports.getTransactionById = async (req, res) => {
  const usuario_id = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `${TRANSACTION_SELECT} WHERE t.id = $1 AND t.usuario_id = $2`,
      [id, usuario_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la transacción' });
  }
};

exports.createTransaction = async (req, res) => {
  const usuario_id = req.user.id;
  const { monto, tipo, descripcion, fecha, cuenta_id, categoria_id } = req.body;

  if (!monto || monto <= 0 || !['ingreso', 'gasto'].includes(tipo) || !cuenta_id || !categoria_id) {
    return res.status(400).json({
      error: 'Monto positivo, tipo (ingreso/gasto), cuenta_id y categoria_id son obligatorios',
    });
  }

  const client = await pool.connect();
  try {
    const ownsAccount = await verifyAccountOwnership(cuenta_id, usuario_id);
    if (!ownsAccount) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const category = await verifyCategoryOwnership(categoria_id, usuario_id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    if (category.tipo !== tipo) {
      return res.status(400).json({ error: 'El tipo de transacción debe coincidir con el de la categoría' });
    }

    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO transacciones (monto, tipo, descripcion, fecha, cuenta_id, categoria_id, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [monto, tipo, descripcion || null, fecha || new Date().toISOString().slice(0, 10), cuenta_id, categoria_id, usuario_id]
    );
    await adjustAccountBalance(client, cuenta_id, tipo, monto);
    await client.query('COMMIT');

    const full = await pool.query(`${TRANSACTION_SELECT} WHERE t.id = $1`, [inserted.rows[0].id]);
    res.status(201).json(full.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al crear la transacción' });
  } finally {
    client.release();
  }
};

exports.updateTransaction = async (req, res) => {
  const usuario_id = req.user.id;
  const { id } = req.params;
  const { monto, tipo, descripcion, fecha, cuenta_id, categoria_id } = req.body;

  const client = await pool.connect();
  try {
    const existing = await pool.query(
      'SELECT * FROM transacciones WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    const oldTx = existing.rows[0];

    const newMonto = monto ?? oldTx.monto;
    const newTipo = tipo ?? oldTx.tipo;
    const newCuentaId = cuenta_id ?? oldTx.cuenta_id;
    const newCategoriaId = categoria_id ?? oldTx.categoria_id;
    const newFecha = fecha ?? oldTx.fecha;
    const newDescripcion = descripcion !== undefined ? descripcion : oldTx.descripcion;

    if (newMonto <= 0) {
      return res.status(400).json({ error: 'El monto debe ser positivo' });
    }

    const ownsAccount = await verifyAccountOwnership(newCuentaId, usuario_id);
    if (!ownsAccount) return res.status(404).json({ error: 'Cuenta no encontrada' });

    const category = await verifyCategoryOwnership(newCategoriaId, usuario_id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    if (category.tipo !== newTipo) {
      return res.status(400).json({ error: 'El tipo debe coincidir con el de la categoría' });
    }

    await client.query('BEGIN');
    await adjustAccountBalance(client, oldTx.cuenta_id, oldTx.tipo, oldTx.monto, true);
    await client.query(
      `UPDATE transacciones SET monto=$1, tipo=$2, descripcion=$3, fecha=$4, cuenta_id=$5, categoria_id=$6
       WHERE id=$7 AND usuario_id=$8`,
      [newMonto, newTipo, newDescripcion, newFecha, newCuentaId, newCategoriaId, id, usuario_id]
    );
    await adjustAccountBalance(client, newCuentaId, newTipo, newMonto);
    await client.query('COMMIT');

    const full = await pool.query(`${TRANSACTION_SELECT} WHERE t.id = $1`, [id]);
    res.json(full.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al actualizar la transacción' });
  } finally {
    client.release();
  }
};

exports.deleteTransaction = async (req, res) => {
  const usuario_id = req.user.id;
  const { id } = req.params;
  const client = await pool.connect();

  try {
    const existing = await pool.query(
      'SELECT * FROM transacciones WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    const tx = existing.rows[0];

    await client.query('BEGIN');
    await adjustAccountBalance(client, tx.cuenta_id, tx.tipo, tx.monto, true);
    await client.query('DELETE FROM transacciones WHERE id = $1 AND usuario_id = $2', [id, usuario_id]);
    await client.query('COMMIT');
    res.json({ message: 'Transacción eliminada' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al eliminar la transacción' });
  } finally {
    client.release();
  }
};
