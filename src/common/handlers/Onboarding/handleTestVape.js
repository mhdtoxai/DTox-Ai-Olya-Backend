const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');

const handleTestVape = async (senderId) => {
    try {
        // Obtener la información del usuario incluyendo el nombre y idioma
        const { idioma, estado, nombre } = await getUserInfo(senderId);

        // Generar la URL única con senderId, nombre y testId
        const uniqueUrl = `https://jjhvjvui.top/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=1`;

        // Enviar el mensaje con el enlace único
        const url = idioma === 'ingles'
            ? `Click here to start your trial: ${uniqueUrl}`
            : `Da clic aquí para comenzar tu prueba: ${uniqueUrl}`;
        await sendMessage(senderId, url);

    } catch (error) {
        console.error('Error al manejar test completado:', error);
        throw error; // Propagar el error para manejarlo en el controlador o en la lógica superior
    }
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleTestVape;
