const moment = require('moment-timezone');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const getUserInfo = require('../../services/getUserInfo');

const dia1 = async (senderId) => {
  try {
    console.log(`Iniciando programación de mensaje de buenos días para el usuario ${senderId}`);

    // Obtener la información del usuario incluyendo la zona horaria
    const { idioma, nombre, timezone } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, nombre: ${nombre}, timezone: ${timezone}`);

    // Definir el código de idioma y el nombre de la plantilla
    const languageCode = idioma === 'ingles' ? 'en_US' : 'es_MX';
    const templateName = 'morning_day1';

    // Crear un objeto de fecha y hora en la zona horaria del usuario
    const userTime = moment.tz('21:05', 'HH:mm', timezone);
    console.log(`Hora del usuario convertida a objeto de momento: ${userTime.format('YYYY-MM-DD HH:mm:ss')}`);

    // Crear un objeto de fecha y hora para el próximo mensaje en la hora local del usuario
    const now = moment().tz(timezone);
    let nextMessageTime = userTime;
    
    // Si la hora del próximo mensaje ya ha pasado hoy, programar para mañana
    if (now.isAfter(userTime)) {
      nextMessageTime = userTime.add(1, 'day');
    }

    console.log(`Hora del próximo mensaje programada: ${nextMessageTime.format('YYYY-MM-DD HH:mm:ss')} en la zona horaria del usuario`);

    // Nombre del trabajo programado
    const jobName = `MensajeBuenosDias ${senderId}`;

    // Verificar si ya existe un trabajo programado y cancelarlo si es necesario
    const existingJob = schedule.scheduledJobs[jobName];
    if (existingJob) {
      existingJob.cancel();
      console.log(`Job cancelado para el usuario ${senderId}`);
    }

    // Programar el mensaje de buenos días usando node-schedule
    const job = schedule.scheduleJob(jobName, nextMessageTime.toDate(), async () => {
      console.log(`Iniciando trabajo programado para el usuario ${senderId} a las ${nextMessageTime.format()}`);

      // Enviar el mensaje de plantilla
      await sendTemplateMessage(senderId, templateName, languageCode);

      // Cancelar el trabajo después de enviar el mensaje
      job.cancel();
      console.log(`Mensaje de buenos días enviado y trabajo cancelado para el usuario ${senderId}`);
    });

    console.log(`Mensaje de buenos días programado para el usuario ${senderId} a las ${nextMessageTime.format()} en la zona horaria del usuario`);

    // Mostrar en consola los eventos programados
    console.log(`Eventos programados actuales:`);
    for (const job in schedule.scheduledJobs) {
      console.log(`- ${job}`);
    }

  } catch (error) {
    console.error('Error al programar el mensaje de buenos días:', error);
  }
};

module.exports = dia1;
