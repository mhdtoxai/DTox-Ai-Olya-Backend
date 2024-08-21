const schedule = require('node-schedule');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const userService = require('../../services/userService');
const dia1 = require('../Dias/dia1');
const moment = require('moment-timezone'); // Asegúrate de tener esta biblioteca instalada

const handleRemoteUser = async (senderId) => {
    try {
        // Obtener la información del usuario
        const { idioma, estado, nombre, timezone } = await getUserInfo(senderId);

        // Mensaje de ánimo
        const encouragementMessage = idioma === 'ingles'
            ? `Hello, I know how difficult it is to make the decision to quit vaping.\n\nI want to congratulate you for taking this important step towards a healthier life.\n\nIt’s not an easy path, but I know you can achieve it too.\n\nEvery day without vaping is a victory, and I want you to know that you are not alone in this struggle.\n\nKeep going, YOU ARE DOING THE RIGHT THING, and Olya will be with you every step of the way.\n\nCongratulations on your courage and determination!" - Lucía Ospina. Colombia`
            : `Hola, sé lo difícil que es tomar la decisión de dejar de vapear.\n\nQuiero felicitarte por dar este paso tan importante hacia una vida más saludable.\n\nNo es un camino fácil, pero sé que tú también puedes lograrlo.\n\nCada día sin vapeo es una victoria, y quiero que sepas que no estás solo en esta lucha.\n\nSigue adelante, ESTÁS HACIENDO LO CORRECTO, y Olya estará contigo en cada paso del camino.\n\n¡Felicidades por tu valentía y determinación!". - Lucía Ospina. Colombia`;

        // Actualizar el estado del usuario en la base de datos inmediatamente
        await userService.updateUser(senderId, { estado: 'planejecutando' });

        console.log(`*Estado del usuario ${senderId} actualizado a 'planejecutando'*`);

        // Programar el envío del mensaje de ánimo para 30 minutos después
        const sendTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos después de la hora actual
        const sendJob = schedule.scheduleJob(sendTime, async () => {
            await sendMessage(senderId, encouragementMessage);
            console.log(`*Mensaje de ánimo enviado al usuario ${senderId}*`);
            // No es necesario cancelar el trabajo ya que se ejecuta solo una vez
        });

        console.log(`*Mensaje de ánimo programado para enviarse en 30 minutos*`);

        // Calcular el final del día en la zona horaria del usuario
        const userTime = moment().tz(timezone); // Hora actual en la zona horaria del usuario
        const endOfDay = userTime.clone().endOf('day'); // Final del día en la zona horaria del usuario
        
        // Mostrar el tiempo restante hasta el final del día
        const timeRemaining = endOfDay.diff(userTime); // Diferencia en milisegundos
        console.log(`*Tiempo restante hasta el final del día para el usuario ${senderId}: ${moment.duration(timeRemaining).humanize()}*`);

        // Mostrar la hora exacta en la que se programará la llamada a dia1
        console.log(`*La llamada a la función dia1 se programará para: ${endOfDay.format('YYYY-MM-DD HH:mm:ss')} en la zona horaria del usuario (${timezone})*`);

        // Programar la llamada a la función dia1 para el final del día
        const dia1Job = schedule.scheduleJob(endOfDay.toDate(), async () => {
            await dia1(senderId);
            console.log(`*Función dia1 llamada al final del día para el usuario ${senderId}*`);
            // No es necesario cancelar el trabajo ya que se ejecuta solo una vez
        });

        console.log(`*Función dia1 programada para llamarse al final del día*`);

    } catch (error) {
        console.error(`Error al manejar la confirmación del usuario remoto para el usuario ${senderId}:`, error);
    }
};

module.exports = handleRemoteUser;
