const schedule = require('node-schedule');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');

const handleRemoteUser = async (senderId) => {
    try {
        // Obtener la información del usuario, incluyendo el idioma, estado y nombre
        const { idioma, estado, nombre } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado}, y nombre: ${nombre}`);

        // Mensaje de ánimo
        const encouragementMessage = idioma === 'ingles'
            ? `A user has sent you an encouragement message as you start your journey:\n\n"Keep going, you can do it!" - Mario H. México`
            : `Mira, un usuario te ha enviado un mensaje de ánimo ahora que inicias tu viaje:\n\n"Ánimo, tú puedes. Échale ganas." - Mario H. México`;

         // Programar el envío del mensaje de ánimo para 30 minutos después
         const sendTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos después de la hora actual

        schedule.scheduleJob(sendTime, async () => {
            await sendMessage(senderId, encouragementMessage);
        });

        console.log(`*Mensaje programado para enviarse en 30 minutos*`);

        // Imprimir todo el contexto del usuario en la consola
        console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);

    } catch (error) {
        console.error(`Error al manejar la confirmación del usuario remoto para el usuario ${senderId}:`, error);
    }
};

module.exports = handleRemoteUser;
