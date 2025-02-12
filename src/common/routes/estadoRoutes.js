const express = require('express');
const updateEstado = require('../controllers/updateEstadoController');

const router = express.Router();

// Ruta para actualizar el estado
router.post('/update-estado', updateEstado);

module.exports = router;
