const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia20 = require('./dia20'); // Asegúrate de ajustar la ruta según tu estructura de archivos
const axios = require('axios');
const scheduledJobs = {}; // Objeto para almacenar trabajos programados
const userService = require('../../services/userService');

const dia19 = async (senderId) => {
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
        const templateName = 'morning_day19'; // Nombre de la plantilla

        // Crear objetos de fecha y hora en la zona horaria del usuario para cada mensaje
        const times = {
            morning: moment.tz('07:00', 'HH:mm', timezone), // 7 AM - Plantilla
            first: moment.tz('10:00', 'HH:mm', timezone), // 10 AM
            second: moment.tz('12:00:', 'HH:mm', timezone), // 12 PM
            third: moment.tz('14:00', 'HH:mm', timezone), // 2 PM
            fourth: moment.tz('16:00', 'HH:mm', timezone), // 4 PM
            testUrl: moment.tz('17:00', 'HH:mm', timezone), // 5 PM
            fifth: moment.tz('18:00', 'HH:mm', timezone), // 6 PM
            RecUrl: moment.tz('19:00', 'HH:mm', timezone), // 7 PM
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
                        `Did you know that vaping can decrease the body’s ability to fight respiratory infections 🦠🦠?` :
                        `¿Sabías que el vapeo puede disminuir la capacidad del cuerpo para combatir infecciones respiratorias 🦠🦠?`;

                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vaping can weaken your immune system` :
                        `🗣️ Vapear puede disminuir la eficacia del sistema inmunológico.`;

                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),


            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);
            
                const thirdMessage = idioma === 'ingles' ?
                    `One more day to go. You got this!` :
                    `¡Sólo falta un día! ¡Qué emoción! Ánimo que estás a punto de terminar!`;
            
                await sendMessage(senderId, thirdMessage);
                console.log(`Tercer mensaje enviado a usuario ${senderId}`);
            }),
            

            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

                if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
                    const fourthMessage = idioma === 'ingles' ?
                        `Vaping can affect your skin 🌟. You’ll deal with acne and premature aging 👵 due to the toxins 🧪.` :
                        `El vapeo puede afectar tu piel 🌟. Enfrentarás acné y envejecimiento prematuro 👵 debido a las toxinas 🧪.`;

                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre piel enviado para el usuario ${senderId}`);
                }
            }),

            testUrl: schedule.scheduleJob(`MensajeUrlPrueba ${senderId}`, { hour: serverTimes.testUrl.hours(), minute: serverTimes.testUrl.minutes() }, async () => {
                console.log(`Programado mensaje URL prueba ${senderId} a las ${serverTimes.testUrl.format()}`);

                // Generar la URL única con senderId, nombre y testId
                const uniqueUrl = `https://olya.club/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=5&language=${idioma}`;
                console.log('URL única generada:', uniqueUrl);

                // Enviar el mensaje con el enlace único
                const urlMessage = idioma === 'ingles'
                    ? `💨 Time to test your lung capacity! Click here ${uniqueUrl}`
                    : `💨 Hora de medir tu capacidad pulmonar! Da clic aquí: ${uniqueUrl}`;
                await sendMessage(senderId, urlMessage);
                console.log(`Mensaje URL prueba enviado a ${senderId}`);
            }),

            fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const fifthMessage = idioma === 'ingles' ?
                        `Vaping affects your memory 📚. You’ll forget important things ❗ and struggle to retain information 📉.` :
                        `Vapear afecta tu memoria 📚. Olvidarás cosas importantes ❗ y te costará retener información 📉.`;

                    await sendMessage(senderId, fifthMessage);
                    console.log(`Quinto mensaje enviado a ${senderId}`);
                }
            }),

            RecUrl: schedule.scheduleJob(`MensajeRecUrl ${senderId}`, { hour: serverTimes.RecUrl.hours(), minute: serverTimes.RecUrl.minutes() }, async () => {
                console.log(`Programado mensaje de retención pulmonar ${senderId} a las ${serverTimes.RecUrl.format()}`);

                try {
                    // Realiza la solicitud POST a la API para obtener los resultados
                    const response = await axios.post('https://olya.club/api/test/testrespiracion/obtenerpruebas', {
                        userId: senderId
                    });

                    const pruebas = response.data; // Suponiendo que la respuesta contiene los datos de las pruebas

                    // Verifica si el testId 5 está presente
                    const testId5Presente = pruebas.some(prueba => prueba.id === '5');

                    if (!testId5Presente) {
                        // Genera la URL única con senderId, nombre y testId
                        const uniqueUrl = `https://olya.club/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=5&language=${idioma}`;
                        console.log('URL única generada:', uniqueUrl);

                        // Enviar el mensaje con el enlace único
                        const urlMessage = idioma === 'ingles'
                            ? `💨 Your Lung Retention Test is still pending. Clic here to do it: ${uniqueUrl}`
                            : `💨 Aún tienes pendiente tu prueba de retención pulmonar! Da clic aquí : ${uniqueUrl}`;
                        await sendMessage(senderId, urlMessage);
                        console.log(`Mensaje URL RecUrl enviado a ${senderId}`);
                    } else {
                        console.log(`El testId 5 ya está presente para el usuario ${senderId}. No se envía el mensaje.`);
                    }
                } catch (error) {
                    console.error(`Error al obtener las pruebas para el usuario ${senderId}:`, error);
                }
            }),

            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

                const sixthMessage = idioma === 'ingles' ?
                    `Vaping can lead to chronic lung diseases 🫁. You’ll live with constant pain 😣 and need long-term medical treatment 💊.` :
                    `Vapear puede provocar enfermedades pulmonares crónicas 🫁. Vivirás con dolor constante 😣 y necesitarás tratamiento médico prolongado 💊.`;

                await sendMessage(senderId, sixthMessage);
                console.log(`Sexto mensaje enviado a usuario ${senderId}`);
            }),

            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const seventhMessage = idioma === 'ingles' ?
                        `Vaping affects your ability to concentrate 📉. You’ll find it difficult to focus 📚 and perform in your daily activities 🗓️.` :
                        `El vapeo afecta tu capacidad de concentración 📉. Te resultará difícil enfocarte 📚 y rendir en tus actividades diarias 🗓️.`;

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
                await userService.updateUser(senderId, { estado: 'dia20' });
                // Llamar a dia 20 después de cancelar todos los trabajos
                await dia20(senderId);
            })
        };

        // Imprimir detalles de los trabajos programados
        console.log(`Trabajos dia 19 programados para el usuario ${senderId}:`);
        Object.keys(scheduledJobs[senderId]).forEach(jobName => {
            const job = scheduledJobs[senderId][jobName];
            console.log(`Trabajo: ${jobName}, Próxima invocación: ${job.nextInvocation().toString()}`);
        });
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};


module.exports = dia19;