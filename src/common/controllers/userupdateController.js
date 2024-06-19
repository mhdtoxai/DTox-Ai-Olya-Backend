const admin = require('firebase-admin');
const db = admin.firestore();

// Controlador para actualizar información del usuario por ID
const updateUser = async (req, res) => {
    const { userId, ...userData } = req.body;

    try {
        const userRef = db.collection('usuarios').doc(userId);

        // Verificar si el usuario existe
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }

        // Actualizar los campos especificados en Firestore
        await userRef.update(userData);

        res.status(200).send({ message: 'Información del usuario actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar información del usuario:', error);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    updateUser
};
