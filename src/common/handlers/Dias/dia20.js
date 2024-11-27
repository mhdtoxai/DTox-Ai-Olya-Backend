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
            third: moment.tz('14:00', 'HH:mm', timezone), // 2 PM
            fourth: moment.tz('16:00', 'HH:mm', timezone), // 4 PM
            testrep: moment.tz('17:00', 'HH:mm', timezone), // 5 PM
            fifth: moment.tz('20:00', 'HH:mm', timezone), // 10 PM
            sixth: moment.tz('20:00', 'HH:mm', timezone), // 8 PM
            seventh: moment.tz('22:00', 'HH:mm', timezone) // 10 PM
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


            }),

            first: schedule.scheduleJob(`MensajePrimero ${senderId}`, { hour: serverTimes.first.hours(), minute: serverTimes.first.minutes() }, async () => {
                console.log(`Programado primer mensaje ${senderId} a las ${serverTimes.first.format()}`);

                if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {

                    const firstMessage = idioma === 'ingles' ?
                        `Did you know that vaping exposes users to ultrafine particles that can penetrate deep into the lungs 🌫️🫁?` :
                        `¿Sabías que el vapeo expone a los usuarios a partículas ultrafinas que pueden penetrar profundamente en los pulmones 🌫️🫁?`;

                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const secondMessage = idioma === 'ingles' ?
                        `Did you know that vaping exposes users to ultrafine particles that can penetrate deep into the lungs 🌫️🫁?` :
                        `¿Sabías que el vapeo expone a los usuarios a partículas ultrafinas que pueden penetrar profundamente en los pulmones 🌫️🫁?`;

                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),

            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);

                const thirdMessage = idioma === 'ingles' ?
                    `🗣️ Vaping can cause dizziness and nausea` :
                    `🗣️El vapeo puede provocar mareos y náuseas.`;

                await sendMessage(senderId, thirdMessage);
                console.log(`Tercer mensaje enviado a usuario ${senderId}`);
            }),


            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

                if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
                    const fourthMessage = idioma === 'ingles' ?
                        `Enjoy this special meal! You absolutely deserve it!` :
                        `¡Disfruta de esta comida especial! ¡Te la mereces absolutamente!`;

                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre piel enviado para el usuario ${senderId}`);
                }
            }),

            testrep: schedule.scheduleJob(`MensajeTestRep ${senderId}`, { hour: serverTimes.testrep.hours(), minute: serverTimes.testrep.minutes() }, async () => {
                console.log(`Programado mensaje de retención pulmonar ${senderId} a las ${serverTimes.testrep.format()}`);

                try {
                    // Realiza la solicitud POST a la API para obtener los resultados
                    const response = await axios.post('https://olya.club/api/test/testrespiracion/obtenerpruebas', {
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
                        `Your lung retention test report: ${status} with a [${Math.abs(percentageChange)}%] retention rate ${emoji} .Quitting vaping will gradually increase it. I recommend following these exercises to help clear your lungs."` :
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

                if (nivel === 'alto' || nivel === 'high') {
                    const fifthMessage = idioma === 'ingles' ?
                        `Vaping damages your vocal cords 🎤. Your voice might change 😶, and you could lose the ability to speak clearly 🗣️.` :
                        `El vapeo daña tus cuerdas vocales 🎤. Tu voz puede cambiar 😶 y podrías perder la capacidad de hablar claramente 🗣️.`;

                    await sendMessage(senderId, fifthMessage);
                    console.log(`Quinto mensaje enviado a ${senderId}`);
                }
            }),

            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

                const sixthMessage = idioma === 'ingles' ?
                    `Congratulations, you've reached the end of our program.\n\nIf you're ready to say good bye we salute you! If not, remember next time will be easier and so on...\n\nThe key is to NEVER QUIT QUITTING.\n\nHere's a 50% off discount for your next 20 day program: DDN50Xz\n\nIf you don't need it, send it to someone who could use the help.` :
                    `Felicidades, has llegado al final de nuestro programa.\n\nSi estás listo para decir adiós, ¡te saludamos! Si no, recuerda que la próxima vez será más fácil y así sucesivamente...\n\nLa clave es NUNCA DEJAR DE DEJARLO.\n\nAquí tienes un 50% de descuento para tu próximo programa de 20 días: DDN50Xz\n\nSi no lo necesitas, envíalo a alguien que pueda necesitar ayuda.`;

                await sendMessage(senderId, sixthMessage);
                console.log(`Sexto mensaje enviado a usuario ${senderId}`);
            }),


            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

                if (nivel === 'alto' || nivel === 'high') {

                    const seventhMessage = idioma === 'ingles' ?
                        `You're the best. Let's move forward or restart the program. Up to you.` :
                        `Eres el mejor. Sigamos adelante o reiniciemos el programa. Tú decides.`;

                    await sendMessage(senderId, seventhMessage);
                    console.log(`Séptimo mensaje enviado a usuario ${senderId}`);
                }


                // Esperar a que el mensaje 7 se haya enviado antes de cancelar los trabajos
                if (scheduledJobs[senderId]) {
                    console.log(`Cancelando todos los trabajos programados al finalizar para el usuario ${senderId}`);
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
                    console.log(`Todos los trabajos anteriores para el usuario ${senderId} han sido cancelados y eliminados.`);
                } else {
                    console.log(`No se encontraron trabajos programados para cancelar.`);
                }


                // Actualizar el estado
                await userService.updateUser(senderId, { estado: 'programafinalizado' });

                // Hacer la llamada a la API para realizar el backup y eliminar el usuario
try {
    const response = await fetch('https://olya.club/api/backup/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ senderId })
    });

    if (response.ok) {
        const data = await response.json();
        console.log(`Respuesta de la API: ${data.mensaje}`);
    } else {
        console.error('Error al realizar el backup y eliminar el usuario');
    }
} catch (error) {
    console.error('Error en la solicitud a la API:', error);
}

            })
        };


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
