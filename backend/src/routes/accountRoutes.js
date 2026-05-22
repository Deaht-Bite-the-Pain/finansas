const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas de cuentas están protegidas por authMiddleware
router.post('/', authMiddleware, accountController.createAccount);
router.get('/', authMiddleware, accountController.getAccounts);

module.exports = router;