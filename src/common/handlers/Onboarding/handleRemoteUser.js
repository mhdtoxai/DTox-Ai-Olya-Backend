const scheduleTask = require('../../services/cloudTasksService'); // Asegúrate de tener esta función de Cloud Tasks
const getUserInfo = require('../../services/getUserInfo');
const moment = require('moment-timezone');

const handleRemoteUser = async (senderId) => {
  try {
    // Obtener información del usuario (incluyendo zona horaria e idioma)
    const { timezone, idioma } = await getUserInfo(senderId);
    // Determinar la plantilla según el idioma del usuario

    console.log(`🌍 Zona horaria del usuario: ${timezone}`);

    // Definir los horarios en UTC (30 minutos después de la hora actual)
    const times = {
      programremoto: moment.utc().add(30, 'minutes'), // Enviar mensaje de ánimo
      programardia1: moment.utc(), // Cambiar estado a 'handleDia1Call'
    };

    console.log(`🕒 Hora programada (UTC) - Mensaje: ${times.programremoto.format('YYYY-MM-DD HH:mm:ss')}`);
    console.log(`🕒 Hora programada (UTC) - Cambio de estado: ${times.programardia1.format('YYYY-MM-DD HH:mm:ss')}`);

    // Función para programar una tarea en Cloud Tasks
    const scheduleMessage = async (message, scheduledTime, eventName) => {
      console.log(`🌍 Equivalente en ${timezone}: ${scheduledTime.clone().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}`);

      const timestamp = Date.now(); // Obtener timestamp actual
      message.taskName = `${message.senderId}_${eventName}_${timestamp}`;

      await scheduleTask(message, scheduledTime.toDate());
      console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
    };

    // Programar el mensaje de ánimo para el usuario
    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ? `Look, a user has sent you an encouraging message as you start your journey:\n\nHi, I know how hard it is to decide to quit vaping. I want to congratulate you on taking this important step toward a healthier life. It’s not an easy path, but I know you can do it too. Every day without vaping is a victory, and I want you to know that you’re not alone in this fight. Keep going, YOU’RE DOING THE RIGHT THING, and Olya will be with you every step of the way. Congratulations on your bravery and determination." - Leslie F. Texas`
        : `Mira, un usuario te ha enviado un mensaje de ánimo ahora que inicias tu viaje:\n\nHola, sé lo difícil que es tomar la decisión de dejar de vapear.\n\nQuiero felicitarte por dar este paso tan importante hacia una vida más saludable.\n\nNo es un camino fácil, pero sé que tú también puedes lograrlo.\n\nCada día sin vapeo es una victoria, y quiero que sepas que no estás solo en esta lucha.\n\nSigue adelante, ESTÁS HACIENDO LO CORRECTO, y Olya estará contigo en cada paso del camino.\n\n¡Felicidades por tu valentía y determinación!". - Lucía Ospina. Colombia`
    }, times.programremoto, 'mensajeremoto');

    await scheduleMessage({
      senderId,
      type: 'estado',
      estado: 'programardia1', // 🔥 Cambia al siguiente día
    }, times.programardia1, 'programardia1');

    console.log(`📅 Mensajes programados para el usuario ${senderId} para ejecutarse dentro de 30 minutos`);

  } catch (error) {
    console.error(`❌ Error al programar el mensaje de ánimo para el usuario ${senderId}:`, error);
  }
};

module.exports = handleRemoteUser;
