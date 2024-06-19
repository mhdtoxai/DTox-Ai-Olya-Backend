const express = require('express');
const router = express.Router();
const { getUserInfo } = require('../controllers/userController');
const { updateUser } = require('../controllers/userupdateController');


// Ruta para obtener información del usuario por ID usando POST
router.post('/get', getUserInfo);


// Ruta para actualizar información del usuario por ID
router.post('/update', updateUser);


module.exports = router;