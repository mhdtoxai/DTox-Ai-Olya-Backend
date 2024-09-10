const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');

const handleTestVape = async (senderId) => {
    try {
        // Obtener la información del usuario incluyendo el nombre y idioma
        const { idioma, estado, nombre } = await getUserInfo(senderId);

        // Generar la URL única con senderId, nombre, testId e idioma
        const uniqueUrl = `https://jjhvjvui.top/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=1&language=${idioma}`;

        // Construir el mensaje en función del idioma
        const message = idioma === 'ingles'
            ? `Click here to start your test: ${uniqueUrl}`
            : `Da clic aquí para comenzar tu prueba: ${uniqueUrl}`;

        // Enviar el mensaje con el enlace único
        await sendMessage(senderId, message);

    } catch (error) {
        console.error('Error al manejar test completado:', error);
        throw error; // Propagar el error para manejarlo en el controlador o en la lógica superior
    }
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleTestVape;
