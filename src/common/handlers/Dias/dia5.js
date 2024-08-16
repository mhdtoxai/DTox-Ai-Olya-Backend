const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia6 = require('./dia6'); // Asegúrate de ajustar la ruta según tu estructura de archivos
const axios = require('axios');
const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia5 = async (senderId) => {
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
        const templateName = 'morning_day5'; // Nombre de la plantilla

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
                        `Did you know that some vape liquids contain toxic chemicals like formaldehyde and acrolein 🧪🧪?` :
                        `¿Sabías que algunos líquidos de vapeo contienen sustancias químicas tóxicas como el formaldehído y el acroleína 🧪🧪?`;

                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vaping is associated with an increased risk of heart attack` :
                        `🗣️ El vaping está relacionado con un mayor riesgo de ataque cardíaco`;

                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),

            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);

                    const thirdMessage = idioma === 'ingles' ?
                        `🗯️ I may not have mentioned this, but having a hobby can distract you from vaping, and 72% of users report it has helped them. Have you thought about learning something new? Reading, painting, or even short walks in the afternoon can be great options.` :
                        `🗯️ No sé si te lo había dicho, pero tener un hobby puede distraerte del vapeo y el 72% de los usuarios reconocen que les ha ayudado. ¿Has pensado en aprender algo nuevo? La lectura, la pintura o incluso las caminatas cortas por la tarde pueden ser excelentes opciones.`;

                    await sendMessage(senderId, thirdMessage);
                    console.log(`Tercer mensaje enviado a usuario ${senderId}`);
                
            }),


            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

                if (nivel === 'medio' || nivel === 'alto') {
                    const fourthMessage = idioma === 'ingles' ?
                        `Did you know that e-cigarettes can explode 💥, causing severe injuries to the face 😵 and hands?` :
                        `¿Sabías que los cigarrillos electrónicos pueden explotar 💥, causando lesiones graves en la cara 😵 y manos?`;

                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre explosiones de cigarrillos electrónicos enviado para el usuario ${senderId}`);
                }
            }),


            testUrl: schedule.scheduleJob(`MensajeUrlPrueba ${senderId}`, { hour: serverTimes.testUrl.hours(), minute: serverTimes.testUrl.minutes() }, async () => {
                console.log(`Programado mensaje URL prueba ${senderId} a las ${serverTimes.testUrl.format()}`);

                // Generar la URL única con senderId, nombre y testId
                const uniqueUrl = `https://jjhvjvui.top/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=2`;
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
                        `Did you know that vaping can trigger asthma symptoms in people who have never had the disease 🌬️?` :
                        `¿Sabías que el vapeo puede provocar síntomas de asma en personas que nunca han tenido la enfermedad 🌬️?`;

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
            
                    // Verifica si el testId 2 está presente
                    const testId2Presente = pruebas.some(prueba => prueba.id === '2');
            
                    if (!testId2Presente) {
                        // Genera la URL única con senderId, nombre y testId
                        const uniqueUrl = `https://jjhvjvui.top/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=2`;
                        console.log('URL única generada:', uniqueUrl);
            
                        // Enviar el mensaje con el enlace único
                        const urlMessage = idioma === 'ingles'
                            ? `You still have your lung retention test pending!, Click here to start: ${uniqueUrl}`
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
                    `Hey! I got a letter for you! Here it is...` :
                    `¡Hey! ¡Me dieron una carta para ti! Aquí te la dejo...`;

                await sendMessage(senderId, sixthMessage);
                console.log(`Mensaje sexto enviado a usuario ${senderId}`);
            }),



            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado el séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

                if (nivel === 'alto') {
                    const seventhMessage = idioma === 'ingles' ?
                        `Vaping can cause chronic lung diseases 🫁. You’ll live with constant pain 😣 and require prolonged medical treatment 💊.` :
                        `Vapear puede provocar enfermedades pulmonares crónicas 🫁. Vivirás con dolor constante 😣 y necesitarás tratamiento médico prolongado 💊.`;

                    await sendMessage(senderId, seventhMessage);
                    console.log(`Séptimo mensaje enviado a usuario ${senderId}`);
                }

                delete scheduledJobs[senderId]; // Eliminar el trabajo después de que se haya completado
                await dia6(senderId);
            })
        };
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};

module.exports = dia5;