const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia6 = require('./dia6'); // Asegúrate de ajustar la ruta según tu estructura de archivos
const axios = require('axios');
const scheduledJobs = {}; // Objeto para almacenar trabajos programados
const userService = require('../../services/userService');
const dia5 = async (senderId) => {
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
                        `Did you know that vaping can cause 🫁 severe lung damage and 😷 acute respiratory illnesses?` :
                        `¿Sabías que el vapeo puede causar 🫁 daños pulmonares severos y 😷 enfermedades respiratorias agudas?`;

                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vaping is linked to a higher risk of heart attack` :
                        `🗣️ El vaping está relacionado con un mayor riesgo de ataque cardíaco`;

                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),

            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);

                const thirdMessage = idioma === 'ingles' ?
                    `🗯️ I may not have mentioned this, but having a hobby can distract you from vaping, and 72% of users report it has helped them. Have you thought about picking up something new? Reading, painting, or even taking short afternoon walks are great options.` :
                    `🗯️ No sé si te lo había dicho, pero tener un hobby puede distraerte del vapeo y el 72% de los usuarios reconocen que les ha ayudado. ¿Has pensado en aprender algo nuevo? La lectura, la pintura o incluso las caminatas cortas por la tarde pueden ser excelentes opciones.`;

                await sendMessage(senderId, thirdMessage);
                console.log(`Tercer mensaje enviado a usuario ${senderId}`);

            }),


            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

                if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
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
                const uniqueUrl = `https://jjhvjvui.top/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=2&language=${idioma}`;
                
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
                        `Did you know that vaping can trigger asthma symptoms in people who have never had the condition 🌬️?` :
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
                        const uniqueUrl = `https://jjhvjvui.top/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=2&language=${idioma}`;
                        console.log('URL única generada:', uniqueUrl);

                        // Enviar el mensaje con el enlace único
                        const urlMessage = idioma === 'ingles'
                            ? `💨 Your Lung Retention Test is still pending. Clic here to do it: ${uniqueUrl}`
                            : `💨 Aún tienes pendiente tu prueba de retención pulmonar! Da clic aquí : ${uniqueUrl}`;
                        await sendMessage(senderId, urlMessage);
                        console.log(`Mensaje URL RecUrl enviado a ${senderId}`);
                    } else {
                        console.log(`El testId 2 ya está presente para el usuario ${senderId}. No se envía el mensaje.`);
                    }
                } catch (error) {
                    console.error(`Error al obtener las pruebas para el usuario ${senderId}:`, error);
                }
            }),


            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);
            
                const sixthMessage = idioma === 'ingles' ?
                    `Hey! I got a letter for you! Here it is...\n\nJust wanted to take a moment to say how awesome it is that you’ve made it to day 5 of the Olya program. I was right where you are not too long ago, and I totally get how tough those first few days can be. But honestly, they’re also the most important ones. Every little step you're taking is getting you closer to breaking free, and trust me, it’s so worth it.\n\nThis isn’t just about quitting vaping, it’s about taking back control of your life and feeling better overall. I finished the program, and I can’t even describe how great it feels on the other side. So whenever those cravings hit hard, take a deep breath and remind yourself of how far you’ve already come. You’re so much closer to the finish line than you think.\n\nKeep going—you’ve got this!\n\nMichael D. - Hershey, PA.` :
                    `¡Hey! ¡Me dieron una carta para ti! Aquí te la dejo...\n\n¡Hola! Quiero decirte lo increíble que es que ya estés en el día 5 del programa de Olya. Yo estuve en tu lugar no hace mucho, y sé que los primeros días pueden ser desafiantes, pero también son los más importantes. Cada pequeño paso que das te acerca más a tu objetivo, y créeme, el esfuerzo que estás haciendo ahora te va a traer una libertad y una tranquilidad que no te imaginas.\n\nRecuerda que esto no es solo dejar de vapear, es recuperar el control sobre ti mismo y tu bienestar. Yo terminé el programa y te puedo decir que la sensación de haberlo logrado es indescriptible. Así que sigue fuerte, ten paciencia contigo mismo, y cuando sientas que las ganas son intensas, respira profundo y recuerda todo lo que has avanzado hasta ahora. ¡Estás más cerca de lo que crees!\n\nKarla G. - CDMX`;
            
                await sendMessage(senderId, sixthMessage);
                console.log(`Mensaje sexto enviado a usuario ${senderId}`);
            }),
            



            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado el séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

                if (nivel === 'alto' || nivel === 'high') {
                    const seventhMessage = idioma === 'ingles' ?
                        `Vaping can lead to chronic lung diseases 🫁. You’ll live with constant pain 😣 and require prolonged medical treatment 💊.` :
                        `Vapear puede provocar enfermedades pulmonares crónicas 🫁. Vivirás con dolor constante 😣 y necesitarás tratamiento médico prolongado 💊.`;

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
                await userService.updateUser(senderId, { estado: 'dia6' });
                // Llamar a dia 6 después de cancelar todos los trabajos
                await dia6(senderId);
            })
        };

        // Imprimir detalles de los trabajos programados
        console.log(`Trabajos dia 5 programados para el usuario ${senderId}:`);
        Object.keys(scheduledJobs[senderId]).forEach(jobName => {
            const job = scheduledJobs[senderId][jobName];
            console.log(`Trabajo: ${jobName}, Próxima invocación: ${job.nextInvocation().toString()}`);
        });

    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};

module.exports = dia5;