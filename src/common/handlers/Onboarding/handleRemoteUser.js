const schedule = require('node-schedule');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const userService = require('../../services/userService'); // Asegúrate de importar el servicio de usuario
const dia1  = require('../Dias/dia1'); // Asegúrate de exportar la función dia1

const handleRemoteUser = async (senderId) => {
    try {
        // Obtener la información del usuario, incluyendo el idioma, estado, nombre y zona horaria
        const { idioma, estado, nombre, timezone } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado}, nombre: ${nombre}, timezone: ${timezone}`);

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

        // Crear objeto de momento para la hora de actualización en la zona horaria del usuario
        const now = moment.tz(timezone);
        const updateTimeInUserTimezone = now.clone().set({ hour: 22, minute: 30, second: 0, millisecond: 0 });
        console.log(`Hora de actualización en la zona horaria del usuario: ${updateTimeInUserTimezone.format('YYYY-MM-DD HH:mm:ss')}`);

        // Convertir la hora de actualización a la hora del servidor
        const updateTimeInServerTimezone = updateTimeInUserTimezone.clone().tz(moment.tz.guess());
        console.log(`Hora de actualización en la zona horaria del servidor: ${updateTimeInServerTimezone.format('YYYY-MM-DD HH:mm:ss')}`);

        // Programar la actualización del estado a las 10:00 PM en la zona horaria del usuario
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

