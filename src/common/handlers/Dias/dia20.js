const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone');
const axios = require('axios');
const scheduledJobs = {}; // Objeto para almacenar trabajos programados
const userService = require('../../services/userService');

// Función para cancelar trabajos programados
const cancelScheduledJobs = (senderId) => {
    if (scheduledJobs[senderId]) {
        console.log(`Cancelando trabajos para el usuario ${senderId}`);
        const userJobs = scheduledJobs[senderId];
        for (const jobName in userJobs) {
            if (userJobs.hasOwnProperty(jobName)) {
                console.log(`Cancelando trabajo: ${jobName} programado para ${userJobs[jobName].nextInvocation().toString()}`);
                const wasCancelled = userJobs[jobName].cancel(); // Intentar cancelar el trabajo
                if (wasCancelled) {
                    console.log(`Trabajo ${jobName} fue cancelado con éxito.`);
                } else {
                    console.log(`No se pudo cancelar el trabajo ${jobName}.`);
                }
            }
        }
        delete scheduledJobs[senderId];
        console.log(`Todos los trabajos para el usuario ${senderId} han sido cancelados y eliminados.`);
    } else {
        console.log(`No se encontraron trabajos para el usuario ${senderId}.`);
    }
};

const dia20 = async (senderId) => {
    try {
        console.log(`Iniciando programación de mensajes para el usuario ${senderId}`);

        // Verificar y cancelar trabajos existentes al inicio
        cancelScheduledJobs(senderId);

        // Obtener la información del usuario incluyendo el nivel y la zona horaria
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, nombre: ${nombre}, nivel: ${nivel}, timezone: ${timezone}`);

        // Definir el código de idioma y el nombre de la plantilla
        const languageCode = idioma === 'ingles' ? 'en_US' : 'es_MX';
        const templateName = 'morning_day_20'; // Nombre de la plantilla

        // Crear objetos de fecha y hora en la zona horaria del usuario para cada mensaje
        const times = {
            morning: moment.tz('07:00', 'HH:mm', timezone), // 7 AM - Plantilla
            first: moment.tz('10:00', 'HH:mm', timezone), // 10 AM
            second: moment.tz('12:00', 'HH:mm', timezone), // 12 PM
            testrep: moment.tz('17:00', 'HH:mm', timezone), // 5 PM
            fifth: moment.tz('22:00', 'HH:mm', timezone), // 10 PM
        };


        // Convertir las horas del usuario a la hora del servidor
        const serverTimes = {};
        Object.keys(times).forEach(key => {
            serverTimes[key] = times[key].clone().tz(moment.tz.guess());
            // console.log(`Hora convertida servidor (${key}): ${serverTimes[key].format('YYYY-MM-DD HH:mm:ss')}`);
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
                    { id: 'yes', title: 'Sí' },
                ];
                // Enviar el mensaje interactivo con botones
                await sendMessageTarget(senderId, messageText, buttons);
                console.log(`Mensaje de confirmacion enviado para el usuario ${senderId}`);
            }),

            first: schedule.scheduleJob(`MensajePrimero ${senderId}`, { hour: serverTimes.first.hours(), minute: serverTimes.first.minutes() }, async () => {
                console.log(`Programado primer mensaje ${senderId} a las ${serverTimes.first.format()}`);

                if (nivel === 'medio' || nivel === 'alto') {
                    const firstMessage = idioma === 'ingles' ?
                        `Did you know that vaping exposes users to ultrafine particles that can deeply penetrate the lungs 🌫️🫁?` :
                        `¿Sabías que el vapeo expone a los usuarios a partículas ultrafinas que pueden penetrar profundamente en los pulmones 🌫️🫁?`;

                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vaping can cause dizziness and nausea.` :
                        `🗣️ El vapeo puede provocar mareos y náuseas.`;

                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),

            testrep: schedule.scheduleJob(`MensajeTestRep ${senderId}`, { hour: serverTimes.testrep.hours(), minute: serverTimes.testrep.minutes() }, async () => {
                console.log(`Programado mensaje de retención pulmonar ${senderId} a las ${serverTimes.testrep.format()}`);

                try {
                    // Realiza la solicitud POST a la API para obtener los resultados
                    const response = await axios.post('https://jjhvjvui.top/api/test/testrespiracion/obtenerpruebas', {
                        userId: senderId
                    });

                    // Extrae los datos recibidos de la API
                    const results = response.data;

                    // Encuentra los scores de los resultados con id 1 y el primer id disponible desde 5 hacia abajo
                    const score1 = results.find(result => result.id === "1").score;

                    let score5;
                    for (let id = 5; id >= 1; id--) {
                        const result = results.find(result => result.id === id.toString());
                        if (result) {
                            score5 = result.score;
                            break;
                        }
                    }

                    if (score5 === undefined) {
                        throw new Error("No se encontró un resultado válido para el id 5 o menor.");
                    }

                    // Calcula el porcentaje de cambio respecto al score del primer resultado
                    const difference = score5 - score1;
                    const percentageChange = ((difference / score1) * 100).toFixed(2);

                    // Determina el status y el emoji correspondiente
                    let status;
                    let emoji;

                    if (percentageChange > 0) {
                        status = 'mejoró';
                        emoji = '💪🤟';
                    } else if (percentageChange < 0) {
                        status = 'empeoró';
                        emoji = '🥺👎';
                    } else {
                        status = 'no mejoró ni empeoró';
                        emoji = '🙏';
                    }

                    // Construye el mensaje basado en el idioma
                    const historyMessage = idioma === 'ingles' ?
                        `Your lung retention test report: ${status} by [${Math.abs(percentageChange)}%] ${emoji}. Quitting vaping will gradually improve this. I recommend continuing these exercises to cleanse your lungs.` :
                        `Tu informe de pruebas de retención pulmonar: ${status} en [${Math.abs(percentageChange)}%] tu retención. ${emoji}. Dejar de vapear la incrementará paulatinamente. Te recomiendo seguir estos ejercicios para limpiar tus pulmones.`;

                    // Envía el mensaje al usuario
                    await sendMessage(senderId, historyMessage);
                    console.log(`Mensaje resultado prueba enviado para el usuario ${senderId} con el informe de retención pulmonar.`);
                } catch (error) {
                    console.error(`Error al obtener las pruebas para el usuario ${senderId}:`, error);
                }
            }),

            fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

                if (nivel === 'alto') {
                    const fifthMessage = idioma === 'ingles' ?
                        `Vaping damages your vocal cords 🎤. Your voice may change 😶 and you could lose the ability to speak clearly 🗣️.` :
                        `El vapeo daña tus cuerdas vocales 🎤. Tu voz puede cambiar 😶 y podrías perder la capacidad de hablar claramente 🗣️.`;

                    await sendMessage(senderId, fifthMessage);
                    console.log(`Quinto mensaje enviado a ${senderId}`);
                }
            })
        };

        // Actualizar el estado
        await userService.updateUser(senderId, { estado: 'programafinalizado' });

        // Cancelar los trabajos programados al terminar
        cancelScheduledJobs(senderId);

        // Imprimir detalles de los trabajos programados
        console.log(`Trabajos 20 programados para el usuario ${senderId}:`);
        Object.keys(scheduledJobs[senderId]).forEach(jobName => {
            const job = scheduledJobs[senderId][jobName];
            console.log(`Trabajo: ${jobName}, Próxima invocación: ${job.nextInvocation().toString()}`);
        });
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};

module.exports = dia20;
