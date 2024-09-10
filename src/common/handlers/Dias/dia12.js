const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia13 = require('./dia13'); // Asegúrate de ajustar la ruta según tu estructura de archivos
const userService = require('../../services/userService');
const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia12 = async (senderId) => {
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
        const templateName = 'morning_day_12'; // Nombre de la plantilla

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
                        `Did you know that vaping can cause irritation and damage to your gums and mouth tissue 🦷👄?` :
                        `¿Sabías que el vapeo puede causar irritación y daño a las encías y al tejido bucal 🦷👄?`;

                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vape liquids can contain heavy metals` :
                        `🗣️ Los líquidos de vapeo pueden contener metales pesados.`;

                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),

            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);

                const thirdMessage = idioma === 'ingles' ?
                    `"Lunchtime motivation: 'You don’t have to be perfect to achieve it, just persistent.' – Anonymous. Keep it up!"` :
                    `"Almuerzo motivacional: 'No tienes que ser perfecto para lograrlo, solo persistente.' – Anónimo. ¡Sigue así!"`;

                await sendMessage(senderId, thirdMessage);
                console.log(`Tercer mensaje enviado a usuario ${senderId}`);

            }),

            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

                if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
                    const fourthMessage = idioma === 'ingles' ?
                        `Vaping could lead to the development of heart diseases ❤️. You’ll suffer from chest pains 💔 and could be at risk of a heart attack ⚠️.` :
                        `Vapear podría llevarte a desarrollar enfermedades cardíacas ❤️. Sufrirás dolores en el pecho 💔 y podrías tener un ataque cardíaco ⚠️.`;

                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre enfermedades cardíacas enviado para el usuario ${senderId}`);
                }
            }),

            fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const fifthMessage = idioma === 'ingles' ?
                        `Vaping affects your ability to concentrate 📉. You’ll find it hard to focus 📚 and perform in your daily activities 🗓️.` :
                        `Vapear afecta tu capacidad de concentración 📉. Te resultará difícil enfocarte 📚 y rendir en tus actividades diarias 🗓️.`;

                    await sendMessage(senderId, fifthMessage);
                    console.log(`Quinto mensaje enviado a ${senderId}`);
                }
            }),

            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

                const sixthMessage = idioma === 'ingles' ?
                    `Rest well tonight. Your strength and determination are inspiring. Tomorrow will be a new day to continue your progress!` :
                    `Descansa bien esta noche. Tu fuerza y determinación son inspiradoras. ¡Mañana será un nuevo día para continuar el progreso!`;

                await sendMessage(senderId, sixthMessage);
                console.log(`Mensaje sexto enviado a usuario ${senderId}`);
            }),

            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const seventhMessage = idioma === 'ingles' ?
                        `Vaping can lead to chronic illnesses 🌡️. You will experience constant discomfort 🤢 and will need frequent medical treatment 💊.` :
                        `El vapeo puede llevarte a desarrollar enfermedades crónicas 🌡️. Vivirás con malestar constante 🤢 y necesitarás tratamiento médico frecuente 💊.`;

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
                await userService.updateUser(senderId, { estado: 'dia13' });
                // Llamar a dia 13 después de cancelar todos los trabajos
                await dia13(senderId);
            })
        };

        // Imprimir detalles de los trabajos programados
        console.log(`Trabajos dia 12 programados para el usuario ${senderId}:`);
        Object.keys(scheduledJobs[senderId]).forEach(jobName => {
            const job = scheduledJobs[senderId][jobName];
            console.log(`Trabajo: ${jobName}, Próxima invocación: ${job.nextInvocation().toString()}`);
        });

    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};

module.exports = dia12;