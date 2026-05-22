const pool = require('../config/db');

exports.verifyAccountOwnership = async (cuentaId, usuarioId) => {
  const result = await pool.query(
    'SELECT id FROM cuentas WHERE id = $1 AND usuario_id = $2',
    [cuentaId, usuarioId]
  );
  return result.rows.length > 0;
};

exports.verifyCategoryOwnership = async (categoriaId, usuarioId) => {
  const result = await pool.query(
    'SELECT id, tipo FROM categorias WHERE id = $1 AND usuario_id = $2',
    [categoriaId, usuarioId]
  );
  return result.rows[0] || null;
};

exports.adjustAccountBalance = async (client, cuentaId, tipo, monto, reverse = false) => {
  const sign = tipo === 'ingreso' ? 1 : -1;
  const delta = reverse ? -sign * monto : sign * monto;
  await client.query('UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2', [delta, cuentaId]);
};
