require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const accountRoutes = require('./src/routes/accountRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Registro de rutas
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));