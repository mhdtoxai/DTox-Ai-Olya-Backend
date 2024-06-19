const db = require('../database/firebaseConfig');


// Controlador para obtener información del usuario por ID
const getUserInfo = async (req, res) => {
    const userId = req.body.userId; // Obtener userId del cuerpo de la solicitud

    try {
        const userDoc = await db.collection('usuarios').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }

        const userData = userDoc.data();
        res.status(200).send(userData);
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getUserInfo
};
