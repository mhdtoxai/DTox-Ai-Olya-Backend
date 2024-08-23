const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia15 = require('./dia15'); // Asegúrate de ajustar la ruta según tu estructura de archivos

const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia14 = async (senderId) => {
    try {
        console.log(`Iniciando programación de mensajes para el usuario ${senderId}`);

        // Verificar y cancelar trabajos existentes al inicio
        if (scheduledJobs[senderId]) {
            console.log(`Cancelando trabajos anteriores para el usuario ${senderId}`);
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
            console.log(`No se encontraron trabajos anteriores para el usuario ${senderId}.`);
        }

        // Obtener la información del usuario incluyendo el nivel y la zona horaria
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, nombre: ${nombre}, nivel: ${nivel}, timezone: ${timezone}`);

        // Definir el código de idioma y el nombre de la plantilla
        const languageCode = idioma === 'ingles' ? 'en_US' : 'es_MX';
        const templateName = 'morning_day14'; // Nombre de la plantilla

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
                        `Did you know that some studies have linked vaping to an increased risk of developing chronic bronchitis 🫁😷?` :
                        `¿Sabías que algunos estudios han vinculado el vapeo con un mayor riesgo de desarrollar bronquitis crónica 🫁😷?`;

                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vaping can increase the risk of respiratory infections.` :
                        `🗣️ El vapeo puede aumentar el riesgo de infecciones respiratorias.`;

                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),

            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);

                const thirdMessage = idioma === 'ingles' ?
                    `Midday motivation: 'Every great achievement begins with the decision to try.' – Gail Devers. Your effort counts!` :
                    `"A la mitad del día: 'Cada gran logro comienza con la decisión de intentarlo.' – Gail Devers. ¡Tu esfuerzo cuenta!"`;

                await sendMessage(senderId, thirdMessage);
                console.log(`Tercer mensaje enviado a usuario ${senderId}`);

            }),

            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

                if (nivel === 'medio' || nivel === 'alto') {
                    const fourthMessage = idioma === 'ingles' ?
                        `Vaping makes you more prone to respiratory infections 🤧. You might end up hospitalized 🏥 and bedridden for weeks 🛌.` :
                        `Vapear te hace más propenso a infecciones respiratorias 🤧. Podrías terminar hospitalizado 🏥 y en cama durante semanas 🛌.`;

                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre infecciones respiratorias enviado para el usuario ${senderId}`);
                }
            }),

            fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

                if (nivel === 'alto') {
                    const fifthMessage = idioma === 'ingles' ?
                        `Vaping can lead to cancer 🧬. The risk is high 🚫 and treatment can be painful 💊.` :
                        `Vapear puede llevarte a desarrollar cáncer 🧬. El riesgo es alto 🚫 y el tratamiento puede ser doloroso 💊.`;

                    await sendMessage(senderId, fifthMessage);
                    console.log(`Quinto mensaje enviado a ${senderId}`);
                }
            }),

            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

                const sixthMessage = idioma === 'ingles' ?
                    `Have a peaceful night. You are making an incredible effort and each day without vaping counts. Keep going!` :
                    `Que tengas una noche tranquila. Estás haciendo un esfuerzo increíble y cada día sin vapeo cuenta. ¡Ánimo!`;

                await sendMessage(senderId, sixthMessage);
                console.log(`Mensaje sexto enviado a usuario ${senderId}`);
            }),

            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

                if (nivel === 'alto') {
                    const seventhMessage = idioma === 'ingles' ?
                        `Vaping can cause inflammatory diseases 🔥. You will experience constant pain and discomfort 😖.` :
                        `El vapeo puede causar enfermedades inflamatorias 🔥. Sufrirás de dolor y malestar continuo 😖.`;

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

                // Llamar a dia 15 después de cancelar todos los trabajos
                await dia15(senderId);
            })
        };
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};



module.exports = dia14;