const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca

const dia1 = async (senderId) => {
  try {
    console.log(`Iniciando programación de mensaje de buenos días para el usuario ${senderId}`);

    // Obtener la información del usuario incluyendo la zona horaria
    const { idioma, nombre, timezone } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, nombre: ${nombre}, timezone: ${timezone}`);

    // Definir el código de idioma y el nombre de la plantilla
    const languageCode = idioma === 'ingles' ? 'en_US' : 'es_MX';
    const templateName = 'morning_day1'; // Nombre de la plantilla

    // Crear un objeto de fecha y hora en la zona horaria del usuario
    const userTime = moment.tz('21:05', 'HH:mm', timezone);
    console.log(`Hora del usuario convertida a objeto de momento: ${userTime.format('YYYY-MM-DD HH:mm:ss')}`);

    // Convertir la hora del usuario a la hora del servidor
    const serverTime = userTime.clone().tz(moment.tz.guess());
    console.log(`Hora convertida a la zona horaria del servidor: ${serverTime.format('YYYY-MM-DD HH:mm:ss')}`);

    // Nombre del trabajo programado
    const jobName = `MensajeBuenosDias ${senderId}`;

    // Verificar si ya existe un trabajo programado y cancelarlo si es necesario
    const existingJob = schedule.scheduledJobs[jobName];
    if (existingJob) {
      existingJob.cancel();
      console.log(`Job cancelado para el usuario ${senderId}`);
    }

    // Programar el mensaje de buenos días usando node-schedule
    const job = schedule.scheduleJob(jobName, { hour: serverTime.hours(), minute: serverTime.minutes() }, async () => {
      console.log(`Iniciando trabajo programado para el usuario ${senderId} a las ${serverTime.format()}`);

      // Enviar el mensaje de plantilla
      await sendTemplateMessage(senderId, templateName, languageCode);

      // Cancelar el trabajo después de enviar el mensaje
      job.cancel();
      console.log(`Mensaje de buenos días enviado y trabajo cancelado para el usuario ${senderId}`);
    });

    console.log(`Mensaje de buenos días programado para el usuario ${senderId} a las 7 AM en su zona horaria`);

    // Mostrar en consola los eventos programados
    console.log(`Eventos programados para el usuario ${senderId}:`);
    for (const job in schedule.scheduledJobs) {
      console.log(`- ${job}`);
    }

  } catch (error) {
    console.error('Error al programar el mensaje de buenos días:', error);
  }
};

module.exports = dia1;