const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendImageMessage = require('../../services/Wp-Envio-Msj/sendImageMessage');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia16 = require('./dia16'); // Asegúrate de ajustar la ruta según tu estructura de archivos
const axios = require('axios');
const scheduledJobs = {}; // Objeto para almacenar trabajos programados
const userService = require('../../services/userService');
const dia15 = async (senderId) => {
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
        const templateName = 'morning_day15'; // Nombre de la plantilla

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
                        `Did you know that vaping can damage the epithelial cells in your airways 🌬️, making it harder to protect against infections 🦠?` :
                        `¿Sabías que el vapeo puede causar daños a las células epiteliales de las vías respiratorias 🌬️, lo que dificulta la protección contra infecciones 🦠?`;

                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vaping can cause chest pain.` :
                        `🗣️ Vapear puede causar dolor en el pecho.`;

                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),

            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);

                const thirdMessage = idioma === 'ingles' ?
                    `${nombre}!, before lunch: 'It doesn’t matter how slow you go, as long as you don’t stop.' – Confucius. Keep moving forward!` :
                    `${nombre}!, antes del almuerzo: 'No importa cuán despacio vayas, siempre y cuando no te detengas.' – Confucio. ¡Sigue avanzando!`;

                await sendMessage(senderId, thirdMessage);
                console.log(`Tercer mensaje enviado a usuario ${senderId}`);

            }),

            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

                if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
                    const fourthMessage = idioma === 'ingles' ?
                        `Your teeth 🦷 will suffer if you continue vaping. You’ll face cavities 😬 and constant gum pain 😖.` :
                        `Tus dientes 🦷 sufrirán si sigues vapeando. Enfrentarás caries 😬 y dolor de encías constantes 😖.`;

                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre salud dental enviado para el usuario ${senderId}`);
                }
            }),

            testUrl: schedule.scheduleJob(`MensajeUrlPrueba ${senderId}`, { hour: serverTimes.testUrl.hours(), minute: serverTimes.testUrl.minutes() }, async () => {
                console.log(`Programado mensaje URL prueba ${senderId} a las ${serverTimes.testUrl.format()}`);

                // Generar la URL única con senderId, nombre y testId
                const uniqueUrl = `https://olya.club/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=4&language=${idioma}`;
                console.log('URL única generada:', uniqueUrl);

                // Enviar el mensaje con el enlace único
                const urlMessage = idioma === 'ingles'
                    ? `💨 Time to test your lung capacity! Click here: ${uniqueUrl}`
                    : `💨 Hora de medir tu capacidad pulmonar! Da clic aquí: ${uniqueUrl}`;
                await sendMessage(senderId, urlMessage);
                console.log(`Mensaje URL prueba enviado a ${senderId}`);
            }),

            fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const fifthMessage = idioma === 'ingles' ?
                        `Vaping affects your sense of smell 👃. You won’t enjoy scents 🍃 and will miss out on sensory experiences 🌺.` :
                        `El vapeo afecta tu sentido del olfato 👃. No podrás disfrutar de los aromas 🍃 y te perderás experiencias sensoriales 🌺.`;

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

                    // Verifica si el testId 4 está presente
                    const testId4Presente = pruebas.some(prueba => prueba.id === '4');

                    if (!testId4Presente) {
                        // Genera la URL única con senderId, nombre y testId
                        const uniqueUrl = `https://olya.club/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=4&language=${idioma}`;
                        console.log('URL única generada:', uniqueUrl);

                        // Enviar el mensaje con el enlace único
                        const urlMessage = idioma === 'ingles'
                            ? `💨 Your Lung Retention Test is still pending. Clic here ${uniqueUrl}`
                            : `💨 Aún tienes pendiente tu prueba de retención pulmonar! Da clic aquí : ${uniqueUrl}`;
                        await sendMessage(senderId, urlMessage);
                        console.log(`Mensaje URL RecUrl enviado a ${senderId}`);
                    } else {
                        console.log(`El testId 4 ya está presente para el usuario ${senderId}. No se envía el mensaje.`);
                    }
                } catch (error) {
                    console.error(`Error al obtener las pruebas para el usuario ${senderId}:`, error);
                }
            }),


            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

                const sixthMessage = idioma === 'ingles' ?
                    `Have a peaceful night. You’re making an incredible effort, and every day without vaping counts. Courage Badge unlocked!` :
                    `¡Solo los valientes llegan a este punto del viaje! Insignia de Coraje desbloqueada.`;

                const imageUrl = idioma === 'ingles' ?
                    'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Ingles%2FMedal5_Eng.png?alt=media&token=c9b0dc02-a590-40e6-99da-099a6b665d07' : // Reemplaza con el enlace de la imagen en inglés
                    'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Espa%C3%B1ol%2FMedalla5_Esp.png?alt=media&token=60f2c9b6-8da7-451e-a2b3-63e854d0bdc3'; // Reemplaza con el enlace de la imagen en español

                await sendMessage(senderId, sixthMessage);
                await sendImageMessage(senderId, imageUrl);
                console.log(`Mensaje sexto enviado a usuario ${senderId}`);
            }),

            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const seventhMessage = idioma === 'ingles' ?
                        `Vaping reduces your lung capacity 🫁. Climbing stairs 🚶 will be a challenge, and you’ll constantly feel out of breath 😮‍💨.` :
                        `Vapear afecta tu capacidad pulmonar 🫁. Subir escaleras 🚶 será un desafío, y te faltará el aire constantemente 😮‍💨.`;

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
                await userService.updateUser(senderId, { estado: 'dia16' });
                // Llamar a dia 16 después de cancelar todos los trabajos
                await dia16(senderId);
            })
        };
        // Imprimir detalles de los trabajos programados
        console.log(`Trabajos dia 15 programados para el usuario ${senderId}:`);
        Object.keys(scheduledJobs[senderId]).forEach(jobName => {
            const job = scheduledJobs[senderId][jobName];
            console.log(`Trabajo: ${jobName}, Próxima invocación: ${job.nextInvocation().toString()}`);
        });
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};



module.exports = dia15;