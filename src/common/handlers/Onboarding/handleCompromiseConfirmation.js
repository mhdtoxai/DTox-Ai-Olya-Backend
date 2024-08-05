const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');


const handleCompromiseConfirmation = async (senderId, userResponse) => {
    try {
        // Obtener la información del usuario incluyendo el idioma
        const { idioma, estado, nombre } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

        // Respuestas válidas
        const validResponses = idioma === 'ingles' ? ['yes'] : ['si'];

        // Convertir la respuesta del usuario a minúsculas
        const lowerCaseResponse = userResponse.toLowerCase();

        // Verificar si la respuesta del usuario es válida
        const isValidResponse = validResponses.includes(lowerCaseResponse);

        if (!isValidResponse) {
            const errorMessage = idioma === 'ingles'
                ? 'Please choose "Yes" from the options provided.'
                : 'Por favor elige "Sí" de las opciones proporcionadas.';
            await sendMessage(senderId, errorMessage);

            // Volver a enviar las tarjetas
            const buttons = idioma === 'ingles'
                ? [
                    { id: 'yes', title: 'Yes' }
                  ]
                : [
                    { id: 'si', title: 'Sí' }
                  ];

            const message = idioma === 'ingles'
                ? 'Does everything make sense?'
                : '¿De acuerdo?';

            await sendMessageTarget(senderId, message, buttons);
            return;
        }

        // Actualizar el estado del usuario
        await userService.updateUser(senderId, { estado: 'compromisoconfirmado' });
        userContext[senderId].estado = 'compromisoconfirmado';

        // Mensaje adicional
        const additionalMessage = idioma === 'ingles'
            ? '🤗 Perfect. Take the rest of the day off. Relax, enjoy, and vape as you normally do.'
            : '🤗 Perfecto. Tómate el resto del día libre. Relájate, disfruta y vapea como lo haces normalmente.';
        await sendMessage(senderId, additionalMessage);

         // Nuevo mensaje con la palabra "antojo" en negritas
         const reminderMessage = idioma === 'ingles'
         ? 'Remember: I will be here for you. The keyword for when you have a craving to vape will be **CRAVING**.'
         : 'Recuerda: aquí estaré para tí. La palabra clave para cuando tengas un antojo de vapear será **ANTOJO**.';
     await sendMessage(senderId, reminderMessage);

     

    } catch (error) {
        console.error('Error al manejar la confirmación del compromiso:', error);
    }
    // Imprimir todo el contexto del usuario en la consola
    console.log(`Contexto del usuario ${senderId} después de la confirmación del compromiso:`, userContext[senderId]);
};

module.exports = handleCompromiseConfirmation;
