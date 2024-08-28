const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const userService = require('../../services/userService');
const handleDia1Call = require('./handleDia1Call');

const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const handleRemoteUser = async (senderId) => {
  try {
    console.log(`Manejando el usuario remoto ${senderId}`);

    // Obtener la información del usuario
    const { idioma, timezone } = await getUserInfo(senderId);

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

    // Mensaje de ánimo
    const encouragementMessage = idioma === 'ingles'
      ? `Hello, I know how difficult it is to make the decision to quit vaping.\n\nI want to congratulate you for taking this important step towards a healthier life.\n\nIt’s not an easy path, but I know you can achieve it too.\n\nEvery day without vaping is a victory, and I want you to know that you are not alone in this struggle.\n\nKeep going, YOU ARE DOING THE RIGHT THING, and Olya will be with you every step of the way.\n\nCongratulations on your courage and determination!" - Lucía Ospina. Colombia`
      : `Hola, sé lo difícil que es tomar la decisión de dejar de vapear.\n\nQuiero felicitarte por dar este paso tan importante hacia una vida más saludable.\n\nNo es un camino fácil, pero sé que tú también puedes lograrlo.\n\nCada día sin vapeo es una victoria, y quiero que sepas que no estás solo en esta lucha.\n\nSigue adelante, ESTÁS HACIENDO LO CORRECTO, y Olya estará contigo en cada paso del camino.\n\n¡Felicidades por tu valentía y determinación!". - Lucía Ospina. Colombia`;

    // Programar el envío del mensaje de ánimo para 30 minutos después
    const sendTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos después de la hora actual
    const sendJob = schedule.scheduleJob(sendTime, async () => {
      await sendMessage(senderId, encouragementMessage);
      console.log(`Mensaje de ánimo enviado al usuario ${senderId}`);

      // Actualizar el estado del usuario a 'programardia1' después de enviar el mensaje
      await userService.updateUser(senderId, { estado: 'programardia1' });
      console.log(`Estado del usuario ${senderId} actualizado a 'programardia1'`);

      // Llamar a la función que programará la llamada a dia1 al final del día
      await handleDia1Call(senderId, timezone);
    });

    // Almacenar el trabajo programado en scheduledJobs
    if (!scheduledJobs[senderId]) {
      scheduledJobs[senderId] = {}; // Inicializar objeto si no existe
    }
    scheduledJobs[senderId].sendJob = sendJob;

    console.log(`Mensaje de ánimo programado para enviarse en 30 minutos`);

    // Imprimir detalles de los trabajos programados
    console.log(`Trabajos programados para el usuario ${senderId}:`);
    Object.keys(scheduledJobs[senderId]).forEach(jobName => {
      const job = scheduledJobs[senderId][jobName];
      console.log(`Trabajo: ${jobName}, Próxima invocación: ${job.nextInvocation().toString()}`);
    });

  } catch (error) {
    console.error(`Error al manejar la confirmación del usuario remoto para el usuario ${senderId}:`, error);
  }
};

module.exports = handleRemoteUser;
