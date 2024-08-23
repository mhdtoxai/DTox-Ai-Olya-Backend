const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendAudioMessage = require('../../services/Wp-Envio-Msj/sendAudioMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia3 = require('./dia3'); // Asegúrate de ajustar la ruta según tu estructura de archivos

const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia2 = async (senderId) => {
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
        const templateName = 'morning_day2'; // Nombre de la plantilla

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
                        "Repeat after me: HAKUNA MATATA 🦁 ... 😝\nBetter yet, repeat: No vape no vape NO vape NO VAPE" :
                        "Repite conmigo: HAKUNA MATATA 🦁 ... 😝\nBueno, mejor repite: No vape no vape NO vape NO VAPE";
                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto') {
                    const secondMessage = idioma === 'ingles' ?
                        `Vaping can affect kidney function. I don't know about you ${nombre} but if they're going to have to flag me or get me a kidney transplant because of vaping, I'd better quit` :
                        `El vaping puede afectar la función renal. No se tú ${nombre} pero si por vapear me van a tener que dializar o buscarme un trasplante de riñon mejor lo dejo.`;
                    await sendMessage(senderId, secondMessage);
                    console.log(`Seundo mensaje enviado a  usuario ${senderId}`);
                }
            }),

            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);
                const thirdMessage = 'https://drive.google.com/uc?export=download&id=1ONRFS3ofK7UsoB3w_2N4dXFy8N7EEu4w';
                await sendAudioMessage(senderId, thirdMessage);
                console.log(`Tercer mensaje tardes, enviado a usuario ${senderId}`);

            }),

            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

                if (nivel === 'medio' || nivel === 'alto') {
                    const fourthMessage = idioma === 'ingles' ?
                        `Here's a tip: keep a bag of peanuts handy and transfer the habit of grabbing the vape to grabbing a peanut. This is known as reward substitution. It might sound silly, but after 21 days of doing this, you might have forgotten about vaping.` :
                        `Te paso un tip: ten a la mano una bolsa de cacahuates y transfiere el hábito de agarrar el vape por agarrar un cacahuate. Se conoce como transferencia de recompensa. Igual y te parece ridículo, pero tras 21 días de hacerlo te habrás olvidado del vapeo.`;
                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre la percepción del vapeo enviado para el usuario ${senderId}`);
                }

            }),

            fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

                if (nivel === 'alto') {
                    const fifthMessage = idioma === 'ingles' ?
                        "Don't think about vaping. Go for a 10-minute walk." :
                        "No estés pensando en vapear. Sal a caminar 10 minutos.";
                    await sendMessage(senderId, fifthMessage);
                    console.log(`Quinto mensaje enviado a ${senderId}`);
                }
            }),

            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

                const sixthMessage = idioma === 'ingles' ?
                    `Almost bedtime and time to relax 🧘.\nCongratulations ${nombre} for your effort today.\nRecharge your batteries ⚡️ because tomorrow we cut the vaping window to one hour ⏰.\nTomorrow you’ll only be able to vape from 1PM to 11:59PM.\nNO VAPING IN THE MORNING! I’ll be watching 👀` :
                    `Casi hora de dormir y relajarse 🧘.\nTe felicito ${nombre} por tu esfuerzo de hoy.\nA recargar pilas ⚡️ que mañana cortamos la ventana de vapeo a una hora ⏰.\nMañana solo podrás vapear de 1PM a 11:59PM.\n¡NADA DE VAPEO EN LA MAÑANA! Te estaré observando 👀`;
                await sendMessage(senderId, sixthMessage);
                console.log(`Mensaje sexto de buenas noches enviado a usuario ${senderId}`);
            }),

            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado el séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);
            
                if (nivel === 'alto') {
                    const seventhMessage = idioma === 'ingles' ?
                        "Close your eyes and repeat after me: Tomorrow I won’t vape before 1 PM. I’m with you!" :
                        "Cierra los ojos y repite: Mañana no vapearé antes de la 1PM. ¡Estoy contigo!";
                    await sendMessage(senderId, seventhMessage);
                    console.log(`Séptimo mensaje a usuario ${senderId}`);
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
  
          // Llamar a dia 3 después de cancelar todos los trabajos
          await dia3(senderId);
        })
      };
    } catch (error) {
      console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
  };
module.exports = dia2;
