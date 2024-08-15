const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia4 = require('./dia4'); // Asegúrate de ajustar la ruta según tu estructura de archivos

const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia3 = async (senderId) => {
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
        const templateName = 'morning_day3'; // Nombre de la plantilla

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
                      `Today is the day! What’s today? Day 3️⃣ of the program. Gather your courage, you've already proven you can do it! Let’s hold out until 1PM without vaping 💪💪💪💪💪.\n\nYou’re not alone! Today 6️⃣,2️⃣2️⃣8️⃣ other people are also on day 3. It’s a good challenge, remember that when you have a craving, just say CRAVING and we’ll get through it together. LET'S GO!` :
                      `¡Hoy es hoy! ¿Qué es hoy? El día 3️⃣ del programa. ¡Ármate de valor, ya viste que si puedes! Aguantemos hasta la 1PM sin vape 💪💪💪💪💪.\n\n¡No estás solo! Hoy 6️⃣,2️⃣2️⃣8️⃣ personas más están también en el día 3. Es un buen reto, recuerda que cuando tengas un antojo sólo deberás decir ANTOJO y lo superamos juntos. ¡VAMOS!`;
                  
                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
                  
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto') {
                    const secondMessage = idioma === 'ingles' ?
                      `No excuses, YOU CAN DO IT! If you have cravings, remember to say CRAVING and we'll overcome it together.` :
                      `No hay pretextos, ¡SI PUEDES! Si tienes antojos, recuerda decir ANTOJO y lo vencemos juntos.`;
                  
                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                  }
                  
            }),

            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);
              
                if (nivel === 'medio' || nivel === 'alto') {
                  const thirdMessage = idioma === 'ingles' ?
                    `I took a nap and dreamt that you quit vaping. I got excited and got hungry, so I came for a 🍕. \n\nI feel like you should also get yourself one to reward your effort. 😋` :
                    `Me tomé una siesta y soñé que dejabas de vapear. Me emocioné y me dio hambre, entonces vine por una 🍕.\n\nSiento que deberías pedirte tú también una para recompensar tu esfuerzo. 😋`;
              
                  await sendMessage(senderId, thirdMessage);
                  console.log(`Tercer mensaje enviado a usuario ${senderId}`);
                }
              }),
              

              fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);
              
                if (nivel === 'medio' || nivel === 'alto') {
                  const fourthMessage = idioma === 'ingles' ?
                    `NO VAPE NO VAPE NO VAPE NO VAPE` :
                    `NO VAPE NO VAPE NO VAPE NO VAPE`;
              
                  await sendMessage(senderId, fourthMessage);
                  console.log(`Mensaje de no vapeo enviado para el usuario ${senderId}`);
                }
              }),
              

              fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);
              
                if (nivel === 'alto') {
                  const fifthMessage = idioma === 'ingles' ?
                    `👅👅Vaping can negatively affect oral health, causing dryness, cavities, and a burnt tongue👅👅. Who wants that?` :
                    `👅👅El vaping puede afectar negativamente la salud bucal, causando resequedad, caries y lengua escaldada👅👅. ¿Quién quiere eso?`;
              
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
                    `Vaping can cause digestive problems 🤢. You’ll suffer from nausea 🤮 and constant stomach discomfort 🤧.` :
                    `Vapear puede causar problemas digestivos 🤢. Sufrirás de náuseas 🤮 y malestar estomacal constante 🤧.`;
              
                  await sendMessage(senderId, seventhMessage);
                  console.log(`Séptimo mensaje enviado a usuario ${senderId}`);
                }

                delete scheduledJobs[senderId]; // Eliminar el trabajo después de que se haya completado
                await dia4(senderId);
            })
        };
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};

module.exports = dia3;
