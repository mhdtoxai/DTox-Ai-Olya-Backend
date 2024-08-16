const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia5 = require('./dia5'); // Asegúrate de ajustar la ruta según tu estructura de archivos

const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia4 = async (senderId) => {
    try {
        console.log(`Iniciando programación de mensajes para el usuario ${senderId}`);

        // Verificar si ya hay trabajos programados para este usuario
        if (scheduledJobs[senderId]) {
            console.log(`Ya hay trabajos programados para el usuario ${senderId}`);
            const userJobs = scheduledJobs[senderId];
            for (const jobName in userJobs) {
                if (userJobs.hasOwnProperty(jobName)) {
                    console.log(`Trabajo programado: ${jobName} a las ${userJobs[jobName].nextInvocation().toString()}`);
                }
            }
            return; // Salir si ya hay trabajos programados
        }

        // Obtener la información del usuario incluyendo el nivel y la zona horaria
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, nombre: ${nombre}, nivel: ${nivel}, timezone: ${timezone}`);

        // Definir el código de idioma y el nombre de la plantilla
        const languageCode = idioma === 'ingles' ? 'en_US' : 'es_MX';
        const templateName = 'morning_day4'; // Nombre de la plantilla

        // Crear objetos de fecha y hora en la zona horaria del usuario para cada mensaje
        const times = {
            morning: moment.tz('07:00', 'HH:mm', timezone), // 7 AM - Plantilla
            first: moment.tz('10:00', 'HH:mm', timezone), // 10 AM
            second: moment.tz('12:00:', 'HH:mm', timezone), // 12 PM
            third: moment.tz('14:00', 'HH:mm', timezone), // 2 PM
            fourth: moment.tz('16:00', 'HH:mm', timezone), // 4 PM
            fifth: moment.tz('18:00', 'HH:mm', timezone), // 6 PM
            sixth: moment.tz('20:00', 'HH:mm', timezone), // 8 PM
            seventh: moment.tz('22:00', 'HH:mm', timezone) // 10 PM
        };


        console.log(`Horas del usuario convertidas a objetos de momento:`);
        Object.keys(times).forEach(key => {
            console.log(`Hora ${key}: ${times[key].format('YYYY-MM-DD HH:mm:ss')}`);
        });

        // Convertir las horas del usuario a la hora del servidor
        const serverTimes = {};
        Object.keys(times).forEach(key => {
            serverTimes[key] = times[key].clone().tz(moment.tz.guess());
            console.log(`Hora convertida servidor (${key}): ${serverTimes[key].format('YYYY-MM-DD HH:mm:ss')}`);
        });

        // Programar cada mensaje
        scheduledJobs[senderId] = {
            morning: schedule.scheduleJob(`MensajeBuenosDias ${senderId}`, { hour: serverTimes.morning.hours(), minute: serverTimes.morning.minutes() }, async () => {
                console.log(`Programado msj buenos días ${senderId} a las ${serverTimes.morning.format()}`);

                // Enviar el mensaje de plantilla de buenos días
                await sendTemplateMessage(senderId, templateName, languageCode);

                // Iniciar el envío del mensaje de consentimiento
                const messageText = "¿Estás de acuerdo?";
                const buttons = [
                    { id: 'yes', title: 'Sí' },];
                // Enviar el mensaje interactivo con botones
                await sendMessageTarget(senderId, messageText, buttons);
                console.log(`Mensaje de confirmacion enviado para el usuario ${senderId}`);
            }),


            first: schedule.scheduleJob(`MensajePrimero ${senderId}`, { hour: serverTimes.first.hours(), minute: serverTimes.first.minutes() }, async () => {
                console.log(`Programado primer mensaje ${senderId} a las ${serverTimes.first.format()}`);

                if (nivel === 'medio' || nivel === 'alto') {
                    const firstMessage = idioma === 'ingles' ?
                        `Eating fresh fruits and vegetables is not only healthy but can also help you overcome cravings. Try carrying an apple or some carrots with you today.` :
                        `Comer frutas y verduras frescas no solo es saludable, sino que también puede ayudarte a superar los antojos. Prueba a llevar una manzana o zanahorias contigo hoy.`;

                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),


            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vaping can cause chronic bronchitis` :
                        `🗣️ El vaping puede causar bronquitis crónica`;

                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),

            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);

                    const thirdMessage = idioma === 'ingles' ?
                        `Hello ${nombre}! 🕑 Did you know that drinking water can help reduce vape cravings? Keep a bottle of water with you and drink throughout the day.\n\nYou can start each meal by drinking 2 glasses of water 💦💦. Do it for 1 month and you’ll see the difference!` :
                        `Hola  ${nombre}! 🕑 ¿Sabías que beber agua puede ayudarte a reducir los antojos de vapeo? Mantén una botella de agua contigo y bebe a lo largo del día.\n\nPuedes comenzar cada comida tomando 2 vasos de agua💦💦. Hazlo 1 mes y no sabes la diferencia!`;

                    await sendMessage(senderId, thirdMessage);
                    console.log(`Tercer mensaje enviado a usuario ${senderId}`);
                
            }),

            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

                if (nivel === 'medio' || nivel === 'alto') {
                    const fourthMessage = idioma === 'ingles' ?
                        `Did you know that using e-cigarettes can alter the central nervous system 🧠 and affect cognitive function 📉?` :
                        `¿Sabías que el uso de cigarrillos electrónicos puede alterar el sistema nervioso central 🧠 y afectar la función cognitiva 📉?`;

                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre el sistema nervioso enviado para el usuario ${senderId}`);
                }
            }),



            fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

                if (nivel === 'alto') {
                    const fifthMessage = idioma === 'ingles' ?
                        `Did you know that vaping can cause dryness in the mouth 👄 and increase the risk of dental cavities 🦷?` :
                        `¿Sabías que el vapeo puede causar sequedad en la boca 👄 y aumentar el riesgo de caries dental 🦷?`;

                    await sendMessage(senderId, fifthMessage);
                    console.log(`Quinto mensaje enviado a ${senderId}`);
                }
            }),



            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

                const sixthMessage = idioma === 'ingles' ?
                    `🙇‍♀️ Reflect on your achievements today. Every step you take brings you closer to your goal 🫵. Tomorrow is a new opportunity to continue your progress!\n\nGood night...` :
                    `🙇‍♀️ Reflexiona sobre tus logros de hoy. Cada paso que das te acerca a tu meta 🫵. ¡Mañana es una nueva oportunidad para continuar con tu progreso!\n\nBuenas nochezzzz...`;

                await sendMessage(senderId, sixthMessage);
                console.log(`Mensaje sexto de buenas noches enviado a usuario ${senderId}`);
            }),


            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado el séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);
            
                if (nivel === 'alto') {
                    const seventhMessage = idioma === 'ingles' ?
                        `Vaping affects your ability to play sports 🏀. You’ll be out of breath 😵 and won’t perform well in your sports activities 🏋️‍♀️.` :
                        `El vapeo afecta tu capacidad para hacer deporte 🏀. Te quedarás sin aliento 😵 y no podrás rendir bien en tus actividades deportivas 🏋️‍♀️.`;
            
                    await sendMessage(senderId, seventhMessage);
                    console.log(`Séptimo mensaje enviado a usuario ${senderId}`);
                }

                delete scheduledJobs[senderId]; // Eliminar el trabajo después de que se haya completado
                await dia5(senderId);
            })
        };
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};

module.exports = dia4;