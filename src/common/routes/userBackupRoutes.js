const express = require('express');
const router = express.Router();
const { eliminarUsuario } = require('../controllers/userBackupController');

// Ruta para eliminar un usuario y crear un backup
router.post('/user', eliminarUsuario);

module.exports = router;

