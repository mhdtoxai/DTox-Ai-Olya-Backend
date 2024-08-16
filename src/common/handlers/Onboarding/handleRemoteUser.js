const schedule = require('node-schedule');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const userService = require('../../services/userService'); // Asegúrate de importar el servicio de usuario
const dia1 = require('../Dias/dia1'); // Asegúrate de exportar la función dia1

const handleRemoteUser = async (senderId) => {
    try {
        // Obtener la información del usuario, incluyendo el idioma, estado, nombre y zona horaria
        const { idioma, estado, nombre, timezone } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado}, nombre: ${nombre}, timezone: ${timezone}`);

        // Mensaje de ánimo
        // Mensaje de ánimo
        const encouragementMessage = idioma === 'ingles'
            ? `Hello, I know how difficult it is to make the decision to quit vaping.\n\nI want to congratulate you for taking this important step towards a healthier life.\n\nIt’s not an easy path, but I know you can achieve it too.\n\nEvery day without vaping is a victory, and I want you to know that you are not alone in this struggle.\n\nKeep going, YOU ARE DOING THE RIGHT THING, and Olya will be with you every step of the way.\n\nCongratulations on your courage and determination!" - Lucía Ospina. Colombia`
            : `Hola, sé lo difícil que es tomar la decisión de dejar de vapear.\n\nQuiero felicitarte por dar este paso tan importante hacia una vida más saludable.\n\nNo es un camino fácil, pero sé que tú también puedes lograrlo.\n\nCada día sin vapeo es una victoria, y quiero que sepas que no estás solo en esta lucha.\n\nSigue adelante, ESTÁS HACIENDO LO CORRECTO, y Olya estará contigo en cada paso del camino.\n\n¡Felicidades por tu valentía y determinación!". - Lucía Ospina. Colombia`;

        // Programar el envío del mensaje de ánimo para 30 minutos después
        const sendTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos después de la hora actual

        schedule.scheduleJob(sendTime, async () => {
            await sendMessage(senderId, encouragementMessage);
        });

        console.log(`*Mensaje programado para enviarse en 30 minutos*`);

        // Imprimir todo el contexto del usuario en la consola
        console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);

        // Crear objeto de momento para la hora de actualización en la zona horaria del usuario
        const now = moment.tz(timezone);
        const updateTimeInUserTimezone = now.clone().set({ hour: 23, minute: 58, second: 0, millisecond: 0 });
        console.log(`Hora de actualización en la zona horaria del usuario: ${updateTimeInUserTimezone.format('YYYY-MM-DD HH:mm:ss')}`);

        // Convertir la hora de actualización a la hora del servidor
        const updateTimeInServerTimezone = updateTimeInUserTimezone.clone().tz(moment.tz.guess());
        console.log(`Hora de actualización en la zona horaria del servidor: ${updateTimeInServerTimezone.format('YYYY-MM-DD HH:mm:ss')}`);

        // Programar la actualización del estado a las 11:58 PM en la zona horaria del usuario
        schedule.scheduleJob(updateTimeInServerTimezone.toDate(), async () => {
            try {
                // Actualizar el estado del usuario en la base de datos y en el contexto
                await userService.updateUser(senderId, { estado: 'planejecutando' });
                userContext[senderId].estado = 'planejecutando';

                // Llamar a la función dia1
                await dia1(senderId);

                console.log(`*Estado del usuario ${senderId} actualizado a 'planejecutando' y función dia1 llamada*`);
            } catch (error) {
                console.error(`Error al actualizar el estado del usuario ${senderId} y llamar a la función dia1:`, error);
            }
        });

    } catch (error) {
        console.error(`Error al manejar la confirmación del usuario remoto para el usuario ${senderId}:`, error);
    }
};

module.exports = handleRemoteUser;

