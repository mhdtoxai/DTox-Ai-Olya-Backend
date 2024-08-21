const userService = require('../../services/userService');
const getUserInfo = require('../../services/getUserInfo');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');

const handleSelectModeLevel = async (senderId) => {
    try {
        // Obtener la información del usuario incluyendo el nombre y idioma
        const { idioma, estado, nombre } = await getUserInfo(senderId);

        // Definir botones y mensaje basado en el idioma del usuario
        const buttons = idioma === 'ingles'
            ? [
                { id: 'HIGH', title: 'High' },
                { id: 'MEDIUM', title: 'Medium' },
                { id: 'LOW', title: 'Low' }
              ]
            : [
                { id: 'ALTO', title: 'Alto' },
                { id: 'MEDIO', title: 'Medio' },
                { id: 'BAJO', title: 'Bajo' }
              ];

        const message = idioma === 'ingles'
            ? 'Please select the message intensity level according to your needs. You can adjust it later.'
            : 'Selecciona el nivel de intensidad de mensajes de acuerdo a tus necesidades. Lo puedes ajustar más adelante.';

        await sendMessageTarget(senderId, message, buttons);

        // Actualizar el estado después de enviar el mensaje de selección de nivel
        await userService.updateUser(senderId, { estado: 'seleccionnivel' });

    } catch (error) {
        console.error('Error al manejar selección de nivel:', error);
    }
};

module.exports = handleSelectModeLevel;
