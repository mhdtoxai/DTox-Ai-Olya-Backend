const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
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

        if (nivel === 'medio' || nivel === 'alto') {
          const firstMessage = idioma === 'ingles' ?
            "If you're vaping, stop it. If you haven't vaped, good for you! I'm here for any cravings you may have. LET'S GO!" :
            "Si estás vapeando, déjalo. Si no has vapeado, ¡Bien por ti! Aquí sigo para cualquier momento que tengas antojo. ¡VAMOS!";
          await sendMessage(senderId, firstMessage);
          console.log(`Primer mensaje enviado a ${senderId}`);
        }
      }),

      second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
        console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

        if (nivel === 'alto') {
          const secondMessage = idioma === 'ingles' ?
            "Did you know that using vapes dries out your mouth? It's because the chemicals prevent saliva production, which helps manage bacteria in your mouth. This is also happening in other parts of your body, extending to dry and ashen-looking skin 😩. You can do it!" :
            "¿Sabías que el uso de vapeadores te seca la boca? Es porque los químicos evitan que se genere la saliva necesaria para el manejo bacteriano en tu boca. Eso mismo está pasando en otras partes de tu cuerpo, y se extiende a piel seca y de aspecto cenizo 😩. ¡Tu puedes!";
          await sendMessage(senderId, secondMessage);
          console.log(`Segundo mensaje enviado a ${senderId}`);
        }
      }),

      third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
        console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);

        const thirdMessage = idioma === 'ingles' ?
          `Good afternoon ${nombre}, if you’re about to eat, enjoy your meal! \nHere’s a fun fact: did you know that vaping reduces your taste sensitivity? 😵‍💫\nThe good news 🥳 is that it will return completely in 1️⃣ to 3️⃣ months after quitting! \nSo, you're on the right track, and soon everything will taste even better 🤤😋` :
          `Buenas tardes ${nombre}, si a penas vas a comer ¡BUEN PROVECHO! \nAprovecho 😝 para dejarte un dato curioso: ¿Sabías que el vapeo reduce tu sensibilidad de sabor? 😵‍💫\nLa buena noticia🥳 es que de 1️⃣ a 3️⃣ meses de haberlo dejado regresará por completo! \nAsí que vas por buen camino y prepárate que en poco tiempo, todo te sabrá aún más delicioso 🤤😋`;

        await sendMessage(senderId, thirdMessage);
        console.log(`Tercer mensaje tardes, enviado a usuario ${senderId}`);
      }),

      fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
        console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

        if (nivel === 'medio' || nivel === 'alto') {
          const fourthMessage = idioma === 'ingles' ?
            "I don't know who thought that people look good vaping. It's great that you're quitting." :
            "No se a quién se le ocurrió pensar que la gente se ve bien vapeando. Qué bueno que ya lo estas dejando.";
          await sendMessage(senderId, fourthMessage);
          console.log(`Cuarto mensaje enviado a usuario ${senderId}`);
        }
      }),

      fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
        console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

        if (nivel === 'alto') {
          const fifthMessage = idioma === 'ingles' ?
            "Hey 👀. If you're vaping, stop it." :
            "Hey 👀. Si estas vapeando, déjalo.";
          await sendMessage(senderId, fifthMessage);
          console.log(`Quinto mensaje enviado a ${senderId}`);
        }
      }),

      sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
        console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

        const sixthMessage = idioma === 'ingles' ?
          `Good night ${nombre}! Remember to sleep well, because besides being delicious, it has many health benefits: - 💪 Strengthens your immune system - 📈 Repairs tissues and releases growth hormone - 🧘 Recovers your emotional stability - 😩 Develops stress resilience - ❤️ Reduces the risk of heart disease` :
          `¡Buenas noches ${nombre}! Recuerda dormir bien, porque además de ser delicioso tiene muchos beneficios en tu salud: - 💪 Fortalece tu sistema inmune - 📈 Reparas tejidos y liberas hormona del crecimiento - 🧘 Recuperas tu estabilidad emocional - 😩 Desarrollas resiliencia al estrés - ❤️ Reduces el riesgo de enfermedades del corazón`;
        await sendMessage(senderId, sixthMessage);
        console.log(`Mensaje sexto de buenas noches enviado a usuario ${senderId}`);
      }),

      seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
        console.log(`Programado el séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

        if (nivel === 'alto') {
          const seventhMessage = idioma === 'ingles' ?
            "Remember when you were a kid and just needed a toy (or many lol) to feel happy? Vaping has nothing to do with feeling happy or relaxed. You’re on the right track." :
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
    console.log(`Trabajos 1 programados para el usuario ${senderId}:`);
    Object.keys(scheduledJobs[senderId]).forEach(jobName => {
      const job = scheduledJobs[senderId][jobName];
      console.log(`Trabajo: ${jobName}, Próxima invocación: ${job.nextInvocation().toString()}`);
    });

  } catch (error) {
    console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
  }
};

module.exports = dia1;
