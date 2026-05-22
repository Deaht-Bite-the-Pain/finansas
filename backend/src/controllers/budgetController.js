const pool = require('../config/db');
const { verifyCategoryOwnership } = require('../utils/ownership');

const getAlertLevel = (porcentaje) => {
  if (porcentaje >= 100) return 'excedido';
  if (porcentaje >= 80) return 'advertencia';
  return 'ok';
};

const getSpentForCategory = async (usuarioId, categoriaId, mes, anio) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(monto), 0) AS gastado
     FROM transacciones
     WHERE usuario_id = $1 AND categoria_id = $2 AND tipo = 'gasto'
       AND EXTRACT(MONTH FROM fecha) = $3 AND EXTRACT(YEAR FROM fecha) = $4`,
    [usuarioId, categoriaId, mes, anio]
  );
  return parseFloat(result.rows[0].gastado);
};

exports.getBudgets = async (req, res) => {
  const usuario_id = req.user.id;
  const mes = parseInt(req.query.mes, 10) || new Date().getMonth() + 1;
  const anio = parseInt(req.query.anio, 10) || new Date().getFullYear();

  try {
    const result = await pool.query(
      `SELECT p.*, c.nombre AS categoria_nombre
       FROM presupuestos p
       JOIN categorias c ON c.id = p.categoria_id
       WHERE p.usuario_id = $1 AND p.mes = $2 AND p.anio = $3
       ORDER BY c.nombre`,
      [usuario_id, mes, anio]
    );

    const withStatus = await Promise.all(
      result.rows.map(async (budget) => {
        const gastado = await getSpentForCategory(usuario_id, budget.categoria_id, mes, anio);
        const limite = parseFloat(budget.limite);
        const porcentaje = limite > 0 ? Math.round((gastado / limite) * 100) : 0;
        return {
          ...budget,
          limite,
          gastado,
          porcentaje,
          nivel_alerta: getAlertLevel(porcentaje),
        };
      })
    );

    res.json(withStatus);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener presupuestos' });
  }
};

exports.createBudget = async (req, res) => {
  const usuario_id = req.user.id;
  const { categoria_id, mes, anio, limite } = req.body;

  if (!categoria_id || !limite || limite <= 0) {
    return res.status(400).json({ error: 'categoria_id y limite positivo son obligatorios' });
  }

  const budgetMes = mes || new Date().getMonth() + 1;
  const budgetAnio = anio || new Date().getFullYear();

  try {
    const category = await verifyCategoryOwnership(categoria_id, usuario_id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    if (category.tipo !== 'gasto') {
      return res.status(400).json({ error: 'Solo se pueden presupuestar categorías de gasto' });
    }

    const result = await pool.query(
      `INSERT INTO presupuestos (categoria_id, mes, anio, limite, usuario_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [categoria_id, budgetMes, budgetAnio, limite, usuario_id]
    );

    const budget = result.rows[0];
    const gastado = await getSpentForCategory(usuario_id, categoria_id, budgetMes, budgetAnio);
    const limiteNum = parseFloat(budget.limite);
    const porcentaje = limiteNum > 0 ? Math.round((gastado / limiteNum) * 100) : 0;

    res.status(201).json({
      ...budget,
      categoria_nombre: category.nombre,
      gastado,
      porcentaje,
      nivel_alerta: getAlertLevel(porcentaje),
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un presupuesto para esta categoría en el periodo' });
    }
    res.status(500).json({ error: 'Error al crear el presupuesto' });
  }
};

exports.updateBudget = async (req, res) => {
  const usuario_id = req.user.id;
  const { id } = req.params;
  const { limite } = req.body;

  if (!limite || limite <= 0) {
    return res.status(400).json({ error: 'limite positivo es obligatorio' });
  }

  try {
    const result = await pool.query(
      `UPDATE presupuestos SET limite = $1
       WHERE id = $2 AND usuario_id = $3 RETURNING *`,
      [limite, id, usuario_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }

    const budget = result.rows[0];
    const cat = await pool.query('SELECT nombre FROM categorias WHERE id = $1', [budget.categoria_id]);
    const gastado = await getSpentForCategory(usuario_id, budget.categoria_id, budget.mes, budget.anio);
    const limiteNum = parseFloat(budget.limite);
    const porcentaje = limiteNum > 0 ? Math.round((gastado / limiteNum) * 100) : 0;

    res.json({
      ...budget,
      categoria_nombre: cat.rows[0]?.nombre,
      gastado,
      porcentaje,
      nivel_alerta: getAlertLevel(porcentaje),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el presupuesto' });
  }
};

exports.deleteBudget = async (req, res) => {
  const usuario_id = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM presupuestos WHERE id = $1 AND usuario_id = $2 RETURNING id',
      [id, usuario_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    res.json({ message: 'Presupuesto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el presupuesto' });
  }
};
