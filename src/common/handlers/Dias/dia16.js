const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia17 = require('./dia17'); // Asegúrate de ajustar la ruta según tu estructura de archivos

const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia16 = async (senderId) => {
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
        const templateName = 'morning_day16'; // Nombre de la plantilla

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
                        `Did you know that vaping during pregnancy 🤰 can negatively affect fetal development 👶 and increase the risk of preterm birth?` :
                        `¿Sabías que el vapeo durante el embarazo 🤰 puede afectar negativamente el desarrollo del feto 👶 y aumentar el riesgo de parto prematuro?`;
            
                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),
            
            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);
            
                if (nivel === 'alto') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vaping can negatively affect mental health.` :
                        `🗣️ El vapeo puede afectar negativamente la salud mental.`;
            
                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),
            
            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);
            
                    const thirdMessage = idioma === 'ingles' ?
                        `At midday, remember: 'Strength does not come from physical capacity, but from an indomitable will.' – Mahatma Gandhi. You are strong!` :
                        `A medio día, ten presente: 'La fuerza no proviene de la capacidad física, sino de una voluntad indomable.' – Mahatma Gandhi. ¡Tú eres fuerte!`;
            
                    await sendMessage(senderId, thirdMessage);
                    console.log(`Tercer mensaje enviado a usuario ${senderId}`);
            
            }),
            
            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);
            
                if (nivel === 'medio' || nivel === 'alto') {
                    const fourthMessage = idioma === 'ingles' ?
                        `Vaping can affect your immune system 🛡️. You'll be more vulnerable to illnesses 🤒 and will get sick more often 😷.` :
                        `El vapeo puede afectar tu sistema inmunológico 🛡️. Serás más vulnerable a las enfermedades 🤒 y te enfermarás más a menudo 😷.`;
            
                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre sistema inmunológico enviado para el usuario ${senderId}`);
                }
            }),
            
            fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);
            
                if (nivel === 'alto') {
                    const fifthMessage = idioma === 'ingles' ?
                        `Vaping affects your blood circulation 💉. You'll feel cold in your extremities ❄️ and have less physical endurance 🏃.` :
                        `Vapear afecta tu circulación sanguínea 💉. Sentirás frío en las extremidades ❄️ y tendrás menos resistencia física 🏃.`;
            
                    await sendMessage(senderId, fifthMessage);
                    console.log(`Quinto mensaje enviado a ${senderId}`);
                }
            }),
            
            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);
            
                const sixthMessage = idioma === 'ingles' ?
                    `Good night! Reflect on your achievements today and remember that each day without vaping is a step towards a healthier life.` :
                    `¡Buenas noches! Reflexiona sobre tus logros de hoy y recuerda que cada día sin vapeo es un paso hacia una vida más saludable.`;
            
                await sendMessage(senderId, sixthMessage);
                console.log(`Mensaje sexto enviado a usuario ${senderId}`);
            }),
            
            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);
            
                if (nivel === 'alto') {
                    const seventhMessage = idioma === 'ingles' ?
                        `Vaping can lead to lung cancer 🧬. The risk is high 🚫 and the treatment can be painful 💊.` :
                        `El vapeo puede provocar cáncer de pulmón 🧬. El riesgo es alto 🚫 y el tratamiento puede ser doloroso 💊.`;
            
                    await sendMessage(senderId, seventhMessage);
                    console.log(`Séptimo mensaje enviado a usuario ${senderId}`);
                }
         
            
   
            
                delete scheduledJobs[senderId]; // Eliminar el trabajo después de que se haya completado
                await dia17(senderId);
            })
        };
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};

module.exports = dia16;