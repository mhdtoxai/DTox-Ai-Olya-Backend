const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const userService = require('../../services/userService');
const schedule = require('node-schedule');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendStickerMessage = require('../../services/Wp-Envio-Msj/sendStickerMessage');
const axios = require('axios');

const scheduleNightMessage = async (senderId) => {
  try {
    // Hacer la solicitud POST a la API para obtener los datos de onboarding
    const response = await axios.post('https://jjhvjvui.top/api/user/onboarding', {
      senderId: senderId
    });

    const onboardingData = response.data;

    // Crear un objeto para almacenar las respuestas del usuario
    const respuestasUsuario = {};
    onboardingData.respuestas.forEach(respuesta => {
      respuestasUsuario[respuesta.id] = respuesta.respuesta;
    });

    // Buscar la respuesta a la pregunta sobre la hora de dormir
    const horaDeDormir = respuestasUsuario['pregunta_id09'];
    if (!horaDeDormir) {
      throw new Error('No se encontró la respuesta para la hora de dormir');
    }

    // Obtener la información del usuario incluyendo el nombre
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    // Convertir la hora de dormir en horas y minutos
    const [hour, minute] = horaDeDormir.split(':');
    const jobTime = new Date();
    jobTime.setHours(parseInt(hour), parseInt(minute), 0);

    // Cancelar cualquier trabajo anterior
    const jobName = `nightMessage_${senderId}`;
    const existingJob = schedule.scheduledJobs[jobName];
    if (existingJob) {
      existingJob.cancel();
      console.log(`Job cancelado para el usuario ${senderId}`);
    }

    // Programar el mensaje nocturno usando node-schedule
    const job = schedule.scheduleJob({ hour: jobTime.getHours(), minute: jobTime.getMinutes() }, async () => {
      // Enviar el GIF de YAWN
      await sendStickerMessage(senderId, '482161877680974');
      await delay(2000);

      const firstMessage = idioma === 'ingles' ?
        `${nombre}, It's almost time to sleep. Just stopped by to say good night :)` :
        `${nombre}, ya casi es hora de dormir. Sólo pasé por aquí para desearte las buenas noches :)`;
      await sendMessage(senderId, firstMessage);

      await delay(2000);

      const secondMessage = idioma === 'ingles' ?
        "Good luck tomorrow with your first challenge. If you have any questions, let me know ;)" :
        "Mucha suerte mañana en tu primer reto. Si tienes alguna duda, avísame ;)";
      await sendMessage(senderId, secondMessage);

      // Actualizar estado del usuario
      await userService.updateUser(senderId, { estado: 'segundodia' });
      userContext[senderId].estado = 'segundodia';
      console.log(`Estado en contexto actualizado a ${userContext[senderId].estado}`);

      // Imprimir todo el contexto del usuario en la consola
      console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);

      // Cancelar el trabajo después de enviar los mensajes
      job.cancel();
      console.log(`Mensaje nocturno enviado y trabajo cancelado para el usuario ${senderId}`);
    });

    job.name = jobName; // Asignar nombre al trabajo
    console.log(`Mensaje nocturno programado para el usuario ${senderId} a las ${horaDeDormir}`);

    // Mostrar en consola los eventos programados
    console.log(`Eventos programados para el usuario ${senderId}:`);
    for (const job in schedule.scheduledJobs) {
      console.log(`- ${job}`);
    }

  } catch (error) {
    console.error('Error al programar el mensaje nocturno:', error);
  }
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = scheduleNightMessage;
