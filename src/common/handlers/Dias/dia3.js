const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendImageMessage = require('../../services/Wp-Envio-Msj/sendImageMessage');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia4 = require('./dia4'); // Asegúrate de ajustar la ruta según tu estructura de archivos
const sendContactMessage = require('../../services/Wp-Envio-Msj/sendContactMessage');
const userService = require('../../services/userService');
const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia3 = async (senderId) => {
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
            `No excuses, YOU CAN DO IT! If cravings hit, remember to say CRAVING, and we’ll beat it together.` :
            `¡No hay pretextos, SI PUEDES! Si tienes antojos, recuerda decir ANTOJO y lo vencemos juntos.`;

          await sendMessage(senderId, firstMessage);
          console.log(`Primer mensaje enviado a ${senderId}`);
        }
      }),

      second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
        console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

        if (nivel === 'alto' || nivel === 'high') {
          const secondMessage = idioma === 'ingles' ?
            `Just a heads up: vaping can cause digestive problems 🤢🤮.` :
            `Sólo quiero decirte que el vaping puede causar problemas en el sistema digestivo 🤢🤮.`;

          await sendMessage(senderId, secondMessage);
          console.log(`Mensaje específico enviado para el usuario ${senderId}`);
        }
      }),

      third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
        console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);


        const thirdMessage = idioma === 'ingles' ?
          `Hi ${nombre}. 🗣️🗣️ Spread the word and earn $1 for each referral. You just need to share your unique code. Forward the following to anyone you can help improve their health:` :
          `Hola ${nombre}. 🗣️🗣️ Corre la voz y gana 1USD por cada referido. Únicamente deberás compartirle tu código único. Reenvía lo siguiente a quien puedes ayudar a mejorar su salud:`;

        const thirdMessageCode = idioma === 'ingles' ?
          `Hey! I already quit vaping, what about you? What are you waiting for?\nThe full program costs $10, and with my code, you get a 15% discount.\n\nDiscount code: [CODE]\n\nWith Olya, freedom is possible.` :
          `¡Hola! Yo ya dejé de vapear, ¿y tú? ¿Qué esperas?\nEl programa completo cuesta 10USD y con mi código recibes un descuento del 15%.\n\nCódigo de descuento: [CODE]\n\nCon Olya, es posible ser libre.`;



        await sendMessage(senderId, thirdMessage);
        await sendMessage(senderId, thirdMessageCode);
        await sendContactMessage(senderId);
        console.log(`Tercer mensaje enviado a usuario ${senderId}`);

      }),


      fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
        console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
          const fourthMessage = idioma === 'ingles' ?
            `NO VAPE NO VAPE NO VAPE NO VAPE` :
            `NO VAPE NO VAPE NO VAPE NO VAPE`;

          await sendMessage(senderId, fourthMessage);
          console.log(`Mensaje de no vapeo enviado para el usuario ${senderId}`);
        }
      }),


      fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
        console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

        if (nivel === 'alto' || nivel === 'high') {
          const fifthMessage = idioma === 'ingles' ?
            `👅👅Vaping can negatively affect your oral health, causing dryness, cavities, and a burnt tongue 👅👅. Who wants that?` :
            `👅👅El vaping puede afectar negativamente la salud bucal, causando resequedad, caries y lengua escaldada👅👅. ¿Quién quiere eso?`;

          await sendMessage(senderId, fifthMessage);
          console.log(`Quinto mensaje enviado a ${senderId}`);
        }
      }),


      sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
        console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

        const sixthMessage = idioma === 'ingles' ?
          `Time to rest! You’ve unlocked a new achievement. Keep it up!` :
          `¡A descansar! Tienes un nuevo logro desbloqueado. Sigue así!`;

        const imageUrl = idioma === 'ingles' ?
          'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Ingles%2FMedal2_Eng.png?alt=media&token=d2a12a1d-6345-4692-a784-e09c2143ada9' : // Reemplaza con el enlace de la imagen en inglés
          'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Espa%C3%B1ol%2FMedalla2_Esp.png?alt=media&token=73c0b2bd-1a1b-49a9-87f9-2d2479d35d92'; // Reemplaza con el enlace de la imagen en español

        await sendMessage(senderId, sixthMessage);
        await sendImageMessage(senderId, imageUrl);
        console.log(`Mensaje sexto de buenas noches enviado a usuario ${senderId}`);

      }),

      seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
        console.log(`Programado el séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

        if (nivel === 'alto' || nivel === 'high') {
          const seventhMessage = idioma === 'ingles' ?
            `Vaping can cause digestive problems 🤢. You’ll suffer from nausea 🤮 and constant stomach discomfort 🤧.` :
            `Vapear puede causar problemas digestivos 🤢. Sufrirás de náuseas 🤮 y malestar estomacal constante 🤧.`;

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
        await userService.updateUser(senderId, { estado: 'dia4' });
        // Llamar a dia 4 después de cancelar todos los trabajos
        await dia4(senderId);
      })
    };

    // Imprimir detalles de los trabajos programados
    console.log(`Trabajos dia 3 programados para el usuario ${senderId}:`);
    Object.keys(scheduledJobs[senderId]).forEach(jobName => {
      const job = scheduledJobs[senderId][jobName];
      console.log(`Trabajo: ${jobName}, Próxima invocación: ${job.nextInvocation().toString()}`);
    });

  } catch (error) {
    console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
  }
};

module.exports = dia3;
