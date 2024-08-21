const userService = require('../../services/userService');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const userContext = require('../../services/userContext');
const getUserInfo = require('../../services/getUserInfo');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const handleCompromise = async (senderId) => {
    try {
        // Obtener la información del usuario incluyendo el idioma
        const { idioma, estado, nombre } = await getUserInfo(senderId);

        // Enviar las tarjetas de confirmación
        const confirmButtons = idioma === 'ingles'
            ? [{ id: 'yes', title: 'Yes' }]
            : [{ id: 'si', title: 'Sí' }];

        const confirmMessage = idioma === 'ingles'
            ? 'Does everything make sense?'
            : '¿Todo está claro?';

        await sendMessageTarget(senderId, confirmMessage, confirmButtons);

        // Actualizar el estado del usuario después de enviar todos los mensajes
        await userService.updateUser(senderId, { estado: 'compromisopendiente' });
        userContext[senderId].estado = 'compromisopendiente';

    } catch (error) {
        console.error('Error al enviar el mensaje de compromiso:', error);
    }
    // Imprimir todo el contexto del usuario en la consola
    console.log(`Contexto del usuario ${senderId} después de enviar el mensaje de compromiso:`, userContext[senderId]);
};

module.exports = handleCompromise;
