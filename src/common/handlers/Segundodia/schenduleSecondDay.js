const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const axios = require('axios');

const scheduleMessages = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre
    const { idioma, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma} y nombre: ${nombre}`);

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
    if (!motivo) {
      throw new Error('No se encontró la respuesta para el motivo');
    }


// Obtener la respuesta a la pregunta sobre cuánto vapea
const cuantoVapea = respuestasUsuario['pregunta_id12'];
const horaDespertar = respuestasUsuario['pregunta_id05'];
const comienzaVapear = respuestasUsuario['pregunta_id04'];
const horaComida = respuestasUsuario['pregunta_id07'];


if (cuantoVapea === 'Mucho (Todo el día estás con tu vape)' || comienzaVapear === 'En cuanto despierto') {
  // Obtener la hora de despertar y ajustar 10 minutos antes
  const [hour, minute] = horaDespertar.split(':');
  const jobTime = new Date();
  jobTime.setHours(parseInt(hour), parseInt(minute) - 10, 0); // 10 minutos antes de la hora de despertar

  // Programar el mensaje 10 minutos antes de la hora de despertar
  schedule.scheduleJob({ hour: jobTime.getHours(), minute: jobTime.getMinutes() }, async () => {
    const message = idioma === 'ingles' ?
      `Good morning ${nombre}! Remember your first challenge is not to touch your vape for just one hour. If you can hold out until later that would be great but to respect the method one hour will be enough.` :
      `Buenos días ${nombre}! Recuerda que tu primer reto es no tocar tu vape por una hora solamente. Si puedes aguantar hasta más tarde sería genial pero para respetar el método con 1 hora será suficiente.`;

    await sendMessage(senderId, message);
    console.log(`Mensaje de buenos días enviado al usuario ${senderId}`);
  });

  console.log(`Mensaje de buenos días 1 programado para las ${jobTime.getHours()}:${jobTime.getMinutes()}`);
} else {
  console.log(`No se cumplieron las condiciones para programar el mensaje de buenos días.`);
}


if (comienzaVapear !== 'En cuanto despierto') {
    // Obtener la hora de despertar
    const [hour, minute] = horaDespertar.split(':');
    const jobTime = new Date();
    jobTime.setHours(parseInt(hour), parseInt(minute), 0); // Hora de despertar exacta

    // Programar el mensaje de buenos días adicional
    schedule.scheduleJob({ hour: jobTime.getHours(), minute: jobTime.getMinutes() }, async () => {
      const message = idioma === 'ingles' ?
        `Good morning ${nombre}, and welcome to the first day of your Dtox. Today is a great day for you, so make sure to share it with your partner, family, friends, let everyone know that you have decided to quit vaping! Enjoy your day!` :
        `Buenos días, y bienvenidx ${nombre} al primer día de tu Olya. Hoy es un gran día para ti, así que asegúrate de comentarlo con tu pareja, familia, amigos, que todos sepan que has decidido dejar de vapear! A disfrutar tu día!`;

      await sendMessage(senderId, message);
      console.log(`Mensaje de buenos días enviado al usuario ${senderId}`);
    });

    console.log(`Mensaje de buenos días 2 programado para las ${jobTime.getHours()}:${jobTime.getMinutes()}`);
  }

    // Programar mensaje de motivación a las 12 PM
    schedule.scheduleJob({ hour: 12, minute: 0 }, async () => {
      const message = idioma === 'ingles' ?
        `Remember, doing this to "${motivo}" is a great motivation. Keep this in mind in your fight for habit freedom. We are with you! And remember, do you have cravings? TELL ME` :
        `Recuerda, hacer esto por "${motivo}", es un gran motor. Tenlo muy en cuenta en tu lucha por la libertad de hábitos. ¡Estamos contigo! Y recuerda, ¿tienes antojo? DIMELO`;

      await sendMessage(senderId, message);
      console.log(`Mensaje de motivación enviado al usuario ${senderId}`);
    });

    console.log(`Mensaje de motivación programado para las 12:00 PM`);


    // Programar mensaje justo después de la hora de la comida
if (comienzaVapear === 'Después de comer') {
    const [comidaHour, comidaMinute] = horaComida.split(':');
    const comidaTime = new Date();
    comidaTime.setHours(parseInt(comidaHour), parseInt(comidaMinute), 0);
  
    // Programar el mensaje justo después de la hora de la comida
    schedule.scheduleJob({ hour: comidaTime.getHours(), minute: comidaTime.getMinutes() }, async () => {
      const message = idioma === 'ingles' ?
        `Enjoy your meal! Enjoy your delicious food and remember that your challenge is not to touch your vape after eating. To avoid the craving, I recommend reading something or even a short walk inside or outside the house to keep your mind busy. If you still have anxiety to vape, let me know and we'll do an exercise that will work for you.` :
        `¡Buen provecho! Disfruta tu deliciosa comida y recuerda que tu reto será no tocar tu vape después de comer. Te recomiendo para evitar el antojo leer algo o incluso un pequeño paseo dentro o fuera de casa que te permita ocupar la mente. Si aún así tienes ansiedad por vapear, avísame y hacemos un ejercicio que te va a funcionar.`;
  
      await sendMessage(senderId, message);
      console.log(`Mensaje de buen provecho enviado al usuario ${senderId}`);
    });
  
    console.log(`Mensaje de buen provecho programado para la hora de la comida`);
  }
  
  // Verificar si el usuario indicó que vapea por las tardes
if (comienzaVapear === 'Por las tardes') {
    const [comidaHour, comidaMinute] = horaComida.split(':');
    const comidaTime = new Date();
    comidaTime.setHours(parseInt(comidaHour) + 1, parseInt(comidaMinute), 0);
  
    // Programar el mensaje de apoyo 1 hora después de la hora de la comida
    schedule.scheduleJob({ hour: comidaTime.getHours(), minute: comidaTime.getMinutes() }, async () => {
      const message = idioma === 'ingles' ?
        `How's your day going ${nombre}? I hope great and you are able to control your cravings. Remember that if you ever feel like vaping, come to me and we will do an activity to take away the craving. Keep it up!` :
        `¿Cómo va tu día ${nombre}? Espero que súper y estés pudiendo controlar tus antojos. Recuerda que si en algún momento tienes ganas de vapear, ven conmigo y haremos una dinámica para quitarte el antojo. ¡Sigue así!`;
  
      await sendMessage(senderId, message);
      console.log(`Mensaje de apoyo enviado al usuario ${senderId}`);
    });
  
    console.log(`Mensaje de apoyo programado para 1 hora después de la hora de la comida`);
  }
  

    // Programar mensaje de apoyo a las 6 PM
    schedule.scheduleJob({ hour: 18, minute: 0 }, async () => {
      const message = idioma === 'ingles' ?
        `Woohoo! I'm still here for anything. Let me know when you want to vape so we can eliminate the craving together :)` :
        `¡Yuhu! Sigo por aquí para cualquier cosa. Avísame cuando quieras vapear para lograr eliminar el antojo juntxs :)`;

      await sendMessage(senderId, message);
      console.log(`Mensaje de apoyo enviado al usuario ${senderId}`);
    });

    console.log(`Mensaje de apoyo programado para las 6:00 PM`);


    // Programar mensaje de solicitud a las 9 PM
    const specificURL = '#'; // Cambia esto a la URL específica que necesitas
    schedule.scheduleJob({ hour: 21, minute: 0 }, async () => {
      const message = idioma === 'ingles' ?
        `Psst! Sorry for the time, can you take 2 minutes to answer the following questions? ${specificURL}` :
        `¡Psst! Perdón la hora, ¿puedes tomarte 2 minutos para responder por favor a las siguientes preguntas? ${specificURL}`;

      await sendMessage(senderId, message);
      console.log(`Mensaje de solicitud enviado al usuario ${senderId}`);
    });

    console.log(`Mensaje de solicitud programado para las 9:00 PM`);

    console.log(`Todos los mensajes han sido programados para el usuario ${senderId}`);
  } catch (error) {
    console.error('Error al programar los mensajes:', error);
  }
};

module.exports = scheduleMessages;
