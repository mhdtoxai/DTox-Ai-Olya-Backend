const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const axios = require('axios');
const moment = require('moment-timezone');
const userContext = require('../../services/userContext');

const scheduleMessages = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre, idioma y zona horaria
    const { idioma, nombre, timezone } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, nombre: ${nombre}, y zona horaria: ${timezone}`);

    // Obtener datos de onboarding
    const response = await axios.post('https://jjhvjvui.top/api/user/onboarding', {
      senderId: senderId
    });
    const onboardingData = response.data;

    // Crear un objeto para almacenar todas las respuestas del usuario
    const respuestasUsuario = {};
    onboardingData.respuestas.forEach(respuesta => {
      respuestasUsuario[respuesta.id] = respuesta.respuesta;
    });

    // Extraer motivo de la respuesta
    const motivo = respuestasUsuario['pregunta_id03'];
    const cuantoVapea = respuestasUsuario['pregunta_id12'];
    const horaDespertar = respuestasUsuario['pregunta_id05'];
    const comienzaVapear = respuestasUsuario['pregunta_id04'];
    const horaComida = respuestasUsuario['pregunta_id07'];

    const scheduleJobWithCancellation = (jobName, scheduleTime, message) => {
      const existingJob = schedule.scheduledJobs[jobName];
      if (existingJob) {
        existingJob.cancel();
        console.log(`Job cancelado para el usuario ${senderId}: ${jobName}`);
      }

      const job = schedule.scheduleJob(jobName, scheduleTime, async () => {
        await sendMessage(senderId, message);
        job.cancel();  // Cancelar el trabajo después de que se haya ejecutado
        console.log(`Mensaje enviado y job cancelado para el usuario ${senderId}: ${jobName}`);
      });
    };

    // Convertir la hora de despertar a la hora del servidor y ajustar 10 minutos antes
    if (cuantoVapea === 'Mucho (tanto que no lo podría contar)' || comienzaVapear === 'En cuanto despierto') {
      const [hour, minute] = horaDespertar.split(':');
      const userWakeTime = moment.tz(`${hour}:${minute}`, 'HH:mm', timezone).subtract(10, 'minutes');
      const serverWakeTime = userWakeTime.clone().tz(moment.tz.guess());


      const morningMessage1 = idioma === 'ingles' ?
        `Good morning ${nombre}! Remember your first challenge is not to touch your vape for just one hour. If you can hold out until later that would be great but to respect the method one hour will be enough.` :
        `Buenos días ${nombre}! Recuerda que tu primer reto es no tocar tu vape por una hora solamente. Si puedes aguantar hasta más tarde sería genial pero para respetar el método con 1 hora será suficiente.`;

      scheduleJobWithCancellation(`morningMessage1_${senderId}`, { hour: serverWakeTime.hours(), minute: serverWakeTime.minutes() }, morningMessage1);
      console.log(`*Mensaje de buenos días 1 programado para las* ${serverWakeTime.format('HH:mm')}`);
      console.log(`Hora de despertar ajustada del usuario (zona ${timezone}): ${userWakeTime.format('YYYY-MM-DD HH:mm:ss')}`);
      console.log(`Hora de despertar ajustada en la zona del servidor: ${serverWakeTime.format('YYYY-MM-DD HH:mm:ss')}`);
    }

    // Programar el mensaje de buenos días adicional si no comienza a vapear en cuanto despierta
    if (comienzaVapear !== 'En cuanto despierto') {
      const [hour, minute] = horaDespertar.split(':');
      const userWakeTime = moment.tz(`${hour}:${minute}`, 'HH:mm', timezone);
      const serverWakeTime = userWakeTime.clone().tz(moment.tz.guess());


      const morningMessage2 = idioma === 'ingles' ?
        `Good morning ${nombre}, and welcome to the first day of your Dtox. Today is a great day for you, so make sure to share it with your partner, family, friends, let everyone know that you have decided to quit vaping! Enjoy your day!` :
        `Buenos días, y bienvenidx ${nombre} al primer día de tu Olya. Hoy es un gran día para ti, así que asegúrate de comentarlo con tu pareja, familia, amigos, que todos sepan que has decidido dejar de vapear! A disfrutar tu día!`;

      scheduleJobWithCancellation(`morningMessage2_${senderId}`, { hour: serverWakeTime.hours(), minute: serverWakeTime.minutes() }, morningMessage2);
      console.log(`*Mensaje de buenos días 2 programado para las* ${serverWakeTime.format('HH:mm')}`);
      console.log(`Hora de despertar ajustada del usuario (zona ${timezone}): ${userWakeTime.format('YYYY-MM-DD HH:mm:ss')}`);
      console.log(`Hora de despertar ajustada en la zona del servidor: ${serverWakeTime.format('YYYY-MM-DD HH:mm:ss')}`);

    }

    // Programar mensaje de motivación a las 12 PM
    const motivacionTime = moment.tz('23:15', 'HH:mm', timezone).tz(moment.tz.guess());
    const motivacionMessage = idioma === 'ingles' ?
      `Remember, doing this to "${motivo}" is a great motivation. Keep this in mind in your fight for habit freedom. We are with you! And remember, do you have cravings? TELL ME` :
      `Recuerda, hacer esto por "${motivo}", es un gran motor. Tenlo muy en cuenta en tu lucha por la libertad de hábitos. ¡Estamos contigo! Y recuerda, ¿tienes antojo? DIMELO`;

    scheduleJobWithCancellation(`motivacionMessage_${senderId}`, { hour: motivacionTime.hours(), minute: motivacionTime.minutes() }, motivacionMessage);
    console.log(`*Mensaje de motivación programado para las 12:00 PM en hora del servidor*`);

    // Programar mensaje justo después de la hora de la comida
    if (comienzaVapear === 'Después de comer') {
      const [comidaHour, comidaMinute] = horaComida.split(':');
      const userMealTime = moment.tz(`${comidaHour}:${comidaMinute}`, 'HH:mm', timezone);
      const serverMealTime = userMealTime.clone().tz(moment.tz.guess());

      const mealMessage = idioma === 'ingles' ?
        `Enjoy your meal! Enjoy your delicious food and remember that your challenge is not to touch your vape after eating. To avoid the craving, I recommend reading something or even a short walk inside or outside the house to keep your mind busy. If you still have anxiety to vape, let me know and we'll do an exercise that will work for you.` :
        `¡Buen provecho! Disfruta tu deliciosa comida y recuerda que tu reto será no tocar tu vape después de comer. Te recomiendo para evitar el antojo leer algo o incluso un pequeño paseo dentro o fuera de casa que te permita ocupar la mente. Si aún así tienes ansiedad por vapear, avísame y hacemos un ejercicio que te va a funcionar.`;

      scheduleJobWithCancellation(`mealMessage_${senderId}`, { hour: serverMealTime.hours(), minute: serverMealTime.minutes() }, mealMessage);
      console.log(`*Mensaje de buen provecho programado para la hora de la comida en hora del servidor*`);
    }

    // Programar mensaje de apoyo una hora después de la hora de la comida si vapea por las tardes
    if (comienzaVapear === 'Por las tardes') {
      const [comidaHour, comidaMinute] = horaComida.split(':');
      const userMealTime = moment.tz(`${comidaHour}:${comidaMinute}`, 'HH:mm', timezone).add(1, 'hour');
      const serverMealTime = userMealTime.clone().tz(moment.tz.guess());

      const afternoonMessage = idioma === 'ingles' ?
        `How's your day going ${nombre}? I hope great and you are able to control your cravings. Remember that if you ever feel like vaping, come to me and we will do an activity to take away the craving. Keep it up!` :
        `¿Cómo va tu día ${nombre}? Espero que súper y estés pudiendo controlar tus antojos. Recuerda que si en algún momento tienes ganas de vapear, ven conmigo y haremos una dinámica para quitarte el antojo. ¡Sigue así!`;

      scheduleJobWithCancellation(`afternoonMessage_${senderId}`, { hour: serverMealTime.hours(), minute: serverMealTime.minutes() }, afternoonMessage);
      console.log(`*Mensaje de apoyo programado para 1 hora después de la hora de la comida en hora del servidor*`);
    }

    // Programar mensaje de apoyo a las 6 PM
    const supportTime = moment.tz('23:16', 'HH:mm', timezone).tz(moment.tz.guess());
    const supportMessage = idioma === 'ingles' ?
      `Woohoo! I'm still here for anything. Let me know when you want to vape so we can eliminate the craving together :)` :
      `¡Yuhu! Sigo por aquí para cualquier cosa. Avísame cuando quieras vapear para lograr eliminar el antojo juntxs :)`;

    scheduleJobWithCancellation(`supportMessage_${senderId}`, { hour: supportTime.hours(), minute: supportTime.minutes() }, supportMessage);
    console.log(`*Mensaje de apoyo programado para las 6:00 PM en hora del servidor*`);

    // Programar mensaje de solicitud a las 9 PM
    const requestTime = moment.tz('23:17', 'HH:mm', timezone).tz(moment.tz.guess());
    const requestMessage = idioma === 'ingles' ?
      `Psst! Sorry for the hour, can you take 2 minutes to answer the following questions?` :
      `¡Psst! Perdón la hora, ¿puedes tomarte 2 minutos para responder por favor a las siguientes preguntas?`;

    scheduleJobWithCancellation(`requestMessage_${senderId}`, { hour: requestTime.hours(), minute: requestTime.minutes() }, requestMessage);
    console.log(`*Mensaje de solicitud programado para las 9:00 PM en hora del servidor*`);


    // Actualizar estado del usuario al finalizar todos los mensajes
    await userService.updateUser(senderId, { estado: 'tercerdia' });
    userContext[senderId].estado = 'tercerdia';
    console.log(`Estado en contexto actualizado a ${userContext[senderId].estado}`);

    // Imprimir todo el contexto del usuario en la consola
    console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);


  } catch (error) {
    console.error('Error al programar los mensajes:', error);
  }
};

module.exports = scheduleMessages;
