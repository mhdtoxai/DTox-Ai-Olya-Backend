const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendImageMessage = require('../../services/Wp-Envio-Msj/sendImageMessage');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia2 = require('./dia2'); // Asegúrate de ajustar la ruta según tu estructura de archivos
const userService = require('../../services/userService');

const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia1 = async (senderId) => {
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
    const templateName = 'morning_day1'; // Nombre de la plantilla

    // Crear objetos de fecha y hora en la zona horaria del usuario para cada mensaje
    const times = {
      morning: moment.tz('07:00', 'HH:mm', timezone), // 7 AM - Plantilla
      first: moment.tz('10:00', 'HH:mm', timezone), // 10 AM
      second: moment.tz('12:00', 'HH:mm', timezone), // 12 PM
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
            "If you're vaping, stop. If you haven’t vaped, good for you! I’m here for you whenever you have a craving." :
            "Si estás vapeando, déjalo. Si no has vapeado, ¡Bien por ti! Aquí sigo para cualquier momento que tengas antojo. ¡VAMOS!";
          await sendMessage(senderId, firstMessage);
          console.log(`Primer mensaje enviado a ${senderId}`);
        }
      }),

      second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
        console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

        if (nivel === 'alto' || nivel === 'high') {
          const secondMessage = idioma === 'ingles' ?
            "Did you know that using vapes dries out your mouth? It’s because the chemicals prevent the production of saliva, which is necessary for bacterial management in your mouth. The same thing is happening in other parts of your body, leading to dry, ashy-looking skin 😩. You got this!" :
            "¿Sabías que el uso de vapeadores te seca la boca? Es porque los químicos evitan que se genere la saliva necesaria para el manejo bacteriano en tu boca. Eso mismo está pasando en otras partes de tu cuerpo, y se extiende a piel seca y de aspecto cenizo 😩. ¡Tu puedes!";
          await sendMessage(senderId, secondMessage);
          console.log(`Segundo mensaje enviado a ${senderId}`);
        }
      }),

      third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
        console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);

        const thirdMessage = idioma === 'ingles' ?
          `Good afternoon, ${nombre}, if you're about to eat, enjoy your meal! \nA little fun fact while we're at it: Did you know that vaping can dull your sense of taste? 😵‍💫\n\nThe good news 🥳 is that within 1️⃣ to 3️⃣ months of quitting, your full sense of taste will come back! \nSo you're on the right track, and get ready because soon, everything will taste even more delicious 🤤😋` :
          `Buenas tardes ${nombre}, si a penas vas a comer ¡BUEN PROVECHO! \nAprovecho 😝 para dejarte un dato curioso: ¿Sabías que el vapeo reduce tu sensibilidad de sabor? 😵‍💫\nLa buena noticia🥳 es que de 1️⃣ a 3️⃣ meses de haberlo dejado regresará por completo! \nAsí que vas por buen camino y prepárate que en poco tiempo, todo te sabrá aún más delicioso 🤤😋`;


        await sendMessage(senderId, thirdMessage);
        console.log(`Tercer mensaje tardes, enviado a usuario ${senderId}`);
      }),

      fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
        console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
          const fourthMessage = idioma === 'ingles' ?
            "I don’t know who thought vaping looked cool. But I’m glad you’re leaving it behind." :
            "No se a quién se le ocurrió pensar que la gente se ve bien vapeando. Qué bueno que ya lo estas dejando.";
          await sendMessage(senderId, fourthMessage);
          console.log(`Cuarto mensaje enviado a usuario ${senderId}`);
        }
      }),

      fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
        console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

        if (nivel === 'alto' || nivel === 'high') {
          const fifthMessage = idioma === 'ingles' ?
            "Hey 👀. If you’re vaping, stop." :
            "Hey 👀. Si estas vapeando, déjalo.";
          await sendMessage(senderId, fifthMessage);
          console.log(`Quinto mensaje enviado a ${senderId}`);
        }
      }),

      sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
        console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

        const sixthMessage = idioma === 'ingles' ?
          `Good night, ${nombre}! Here’s a new recognition just for you! Congratulations on completing your first day of the program.` :
          `¡Buenas noches ${nombre}! Aquí tienes un nuevo reconocimiento sólo para tí! Felicidades por cumplir con tu primer día del programa.`;

        const imageUrl = idioma === 'ingles' ?
          'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Ingles%2FMedal1_Eng.png?alt=media&token=5a4280c0-8870-491a-bfc2-9cb2ae647a51' : // Reemplaza con el enlace de la imagen en inglés
          'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Espa%C3%B1ol%2FMedalla1_Esp.png?alt=media&token=beed2d31-3ace-40d6-8b8b-bb6793666dd4'; // Reemplaza con el enlace de la imagen en español

          
        await sendMessage(senderId, sixthMessage);
        await sendImageMessage(senderId, imageUrl);
        console.log(`Mensaje sexto de buenas noches enviado a usuario ${senderId}`);

      }),

      seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
        console.log(`Programado el séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

        if (nivel === 'alto' || nivel === 'high') {
          const seventhMessage = idioma === 'ingles' ?
            "Remember when you were a kid and just needed a toy (or lots of them, haha) to feel happy? Vaping has nothing to do with real happiness or relaxation. You’re on the right path." :
            "Recuerdas cuando eras niñ@ y sólo necesitabas un juguete (o muchos jaja) para sentirte feliz? El vaping no tiene nada que ver con sentirte feliz o relajad@. Vas por buen camino.";
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

        await userService.updateUser(senderId, { estado: 'dia2' });

        // Llamar a dia2 después de cancelar todos los trabajos
        await dia2(senderId);
      })
    };

    // Imprimir detalles de los trabajos programados
    console.log(`Trabajos dia 1 programados para el usuario ${senderId}:`);
    Object.keys(scheduledJobs[senderId]).forEach(jobName => {
      const job = scheduledJobs[senderId][jobName];
      console.log(`Trabajo: ${jobName}, Próxima invocación: ${job.nextInvocation().toString()}`);
    });

  } catch (error) {
    console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
  }
};

module.exports = dia1;
