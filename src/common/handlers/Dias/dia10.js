const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia11 = require('./dia11'); // Asegúrate de ajustar la ruta según tu estructura de archivos
const axios = require('axios');
const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia10 = async (senderId) => {
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
        const templateName = 'morning_day10'; // Nombre de la plantilla

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
                        `Did you know that teenagers who vape are more likely to start smoking conventional cigarettes later 📅📅?` :
                        `¿Sabías que los adolescentes que vapean tienen más probabilidades de comenzar a fumar cigarrillos convencionales más tarde 📅📅?`;
            
                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),
            
            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);
            
                if (nivel === 'alto') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vaping can worsen asthma.` :
                        `🗣️ Vapear puede empeorar el asma.`;
            
                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),
            
            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);
            
                    const thirdMessage = idioma === 'ingles' ?
                        `"Before eating, keep in mind: 'Perseverance is not a long race; it is many short races one after another.' – Walter Elliot. You can do it!"` :
                        `"Antes de comer, ten en mente: 'La perseverancia no es una carrera larga; son muchas carreras cortas una tras otra.' – Walter Elliot. ¡Tú puedes!"`;
            
                    await sendMessage(senderId, thirdMessage);
                   
            }),
            
            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);
            
                if (nivel === 'medio' || nivel === 'alto') {
                    const fourthMessage = idioma === 'ingles' ?
                        `Did you know that vaping can reduce the body's ability to repair damaged DNA 🧫🧬?` :
                        `¿Sabías que el vapeo puede disminuir la capacidad del cuerpo para reparar el ADN dañado 🧫🧬?`;
            
                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre reparación del ADN enviado para el usuario ${senderId}`);
                }
            }),
            
            testUrl: schedule.scheduleJob(`MensajeUrlPrueba ${senderId}`, { hour: serverTimes.testUrl.hours(), minute: serverTimes.testUrl.minutes() }, async () => {
                console.log(`Programado mensaje URL prueba ${senderId} a las ${serverTimes.testUrl.format()}`);

                // Generar la URL única con senderId, nombre y testId
                const uniqueUrl = `https://jjhvjvui.top/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=3`;
                console.log('URL única generada:', uniqueUrl);

                // Enviar el mensaje con el enlace único
                const urlMessage = idioma === 'ingles'
                    ? `Click here to start your trial: ${uniqueUrl}`
                    : `💨 Hora de medir tu capacidad pulmonar! Da clic aquí: ${uniqueUrl}`;
                await sendMessage(senderId, urlMessage);
                console.log(`Mensaje URL prueba enviado a ${senderId}`);
            }),


            fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);
            
                if (nivel === 'alto') {
                    const fifthMessage = idioma === 'ingles' ?
                        `"If you vape, you are likely to be unable to exercise 🏋️‍♂️. You will gain weight 🍔, become ill 🤒, and possibly die prematurely."` :
                        `"Si vapeas, es probable que no puedas hacer ejercicio 🏋️‍♂️. Engordarás 🍔, podrás enfermarte 🤒 y morir prematuramente."`;
            
                    await sendMessage(senderId, fifthMessage);
                    console.log(`Quinto mensaje enviado a ${senderId}`);
                }
            }),

            RecUrl: schedule.scheduleJob(`MensajeRecUrl ${senderId}`, { hour: serverTimes.RecUrl.hours(), minute: serverTimes.RecUrl.minutes() }, async () => {
                console.log(`Programado mensaje de retención pulmonar ${senderId} a las ${serverTimes.RecUrl.format()}`);
            
                try {
                    // Realiza la solicitud POST a la API para obtener los resultados
                    const response = await axios.post('https://jjhvjvui.top/api/test/testrespiracion/obtenerpruebas', {
                        userId: senderId
                    });
            
                    const pruebas = response.data; // Suponiendo que la respuesta contiene los datos de las pruebas
            
                    // Verifica si el testId 3 está presente
                    const testId3Presente = pruebas.some(prueba => prueba.id === '3');
            
                    if (!testId3Presente) {
                        // Genera la URL única con senderId, nombre y testId
                        const uniqueUrl = `https://jjhvjvui.top/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=3`;
                        console.log('URL única generada:', uniqueUrl);
            
                        // Enviar el mensaje con el enlace único
                        const urlMessage = idioma === 'ingles'
                            ? `You still have your lung retention test pending!, Click here to start: ${uniqueUrl}`
                            : `💨 Aún tienes pendiente tu prueba de retención pulmonar! Da clic aquí : ${uniqueUrl}`;
                        await sendMessage(senderId, urlMessage);
                        console.log(`Mensaje URL RecUrl enviado a ${senderId}`);
                    } else {
                        console.log(`El testId 3 ya está presente para el usuario ${senderId}. No se envía el mensaje.`);
                    }
                } catch (error) {
                    console.error(`Error al obtener las pruebas para el usuario ${senderId}:`, error);
                }
            }),

            
            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);
            
                const sixthMessage = idioma === 'ingles' ?
                    `Have a great night. Remember that each day without vaping is a victory. Keep it up!` :
                    `Que tengas una excelente noche. Recuerda que cada día sin vapeo es una victoria. ¡Sigue así!`;
            
                await sendMessage(senderId, sixthMessage);
                console.log(`Mensaje sexto enviado a usuario ${senderId}`);
            }),
            
            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);
            
                if (nivel === 'alto') {
                    const seventhMessage = idioma === 'ingles' ?
                        `Vaping can cause infertility 🚫. Your ability to start a family 👪 could be compromised 🛑.` :
                        `El vapeo puede causar infertilidad 🚫. La posibilidad de formar una familia 👪 se verá comprometida 🛑.`;
            
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

                // Llamar a dia 11 después de cancelar todos los trabajos
                await dia11(senderId);
            })
        };
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};


module.exports = dia10;