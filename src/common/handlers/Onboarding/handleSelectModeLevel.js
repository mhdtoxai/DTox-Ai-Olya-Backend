const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');


const handleSelectModeLevel = async (senderId) => {
    try {
        // Obtener la información del usuario incluyendo el nombre y idioma
        const { idioma, estado, nombre } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    

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
            : 'Por favor selecciona el nivel de intensidad de mensajes de acuerdo a tus necesidades. Lo puedes ajustar más adelante.';

        await sendMessageTarget(senderId, message, buttons);

        
        // Actualizar el estado después de enviar el enlace del cuestionario
        await userService.updateUser(senderId, { estado: 'seleccionnivel' });
        userContext[senderId].estado = 'seleccionnivel';
    } catch (error) {
        console.error('Error al manejar seleccionnivel :', error);
    }
    // Imprimir todo el contexto del usuario en la consola
    console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleSelectModeLevel;
