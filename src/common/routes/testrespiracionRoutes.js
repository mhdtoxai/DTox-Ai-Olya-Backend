const express = require('express');
const router = express.Router();
const testrespiracionController = require('../controllers/testrespiracionController');

// Endpoint para registrar una nueva prueba de vapeo
router.post('/testrespiracion/registrar', testrespiracionController.registerTest);
// Endpoint para obtener todas las pruebas de vapeo de un usuario
router.post('/testrespiracion/obtenerpruebas', testrespiracionController.getTests);

router.post('/testrespiracion/contarpruebas', testrespiracionController.getTestCount);


module.exports = router;
