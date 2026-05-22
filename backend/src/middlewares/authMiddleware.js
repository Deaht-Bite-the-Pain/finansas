const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Inyecta el ID del usuario en la request
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token inválido o expirado.' });
  }
};