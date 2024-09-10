const schedule = require('node-schedule');
const userService = require('../../services/userService');
const moment = require('moment-timezone');
const dia1 = require('../Dias/dia1'); // Ajusta la ruta según tu estructura de archivos
const getUserInfo = require('../../services/getUserInfo');
const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const handleDia1Call = async (senderId) => {
  try {
    // Obtener la información del usuario
    const { timezone } = await getUserInfo(senderId);

    // Validar que timezone sea una cadena válida
    if (typeof timezone !== 'string' || !moment.tz.names().includes(timezone)) {
      throw new Error(`Zona horaria no válida: ${timezone}`);
    }

    console.log(`Programando la llamada a dia1 para el usuario ${senderId} al final del día en su zona horaria`);

    // Verificar y cancelar trabajos existentes al inicio
    if (scheduledJobs[senderId] && scheduledJobs[senderId].dia1Call) {
      console.log(`Cancelando trabajos anteriores de dia1 para el usuario ${senderId}`);
      const job = scheduledJobs[senderId].dia1Call;
      console.log(`Cancelando trabajo: dia1Call programado para ${job.nextInvocation().toString()}`);
      const wasCancelled = job.cancel(); // Intentar cancelar el trabajo
      if (wasCancelled) {
        console.log(`Trabajo dia1Call fue cancelado con éxito.`);
      } else {
        console.log(`No se pudo cancelar el trabajo dia1Call.`);
      }
      delete scheduledJobs[senderId];
    }

    // Calcular el final del día en la zona horaria del usuario
    const userTime = moment().tz(timezone); // Hora actual en la zona horaria del usuario
    const endOfDay = userTime.clone().endOf('day'); // Final del día en la zona horaria del usuario

    // Mostrar el tiempo restante hasta el final del día
    const timeRemaining = endOfDay.diff(userTime); // Diferencia en milisegundos
    console.log(`*Tiempo restante hasta el final del día para el usuario ${senderId}: ${moment.duration(timeRemaining).humanize()}*`);

    // Mostrar la hora exacta en la que se programará la llamada a dia1
    console.log(`*La llamada a la función dia1 se programará para: ${endOfDay.format('YYYY-MM-DD HH:mm:ss')} en la zona horaria del usuario (${timezone})*`);

    // Programar la llamada a la función dia1 para el final del día
    const dia1Job = schedule.scheduleJob(endOfDay.toDate(), async () => {
      try {
        // Actualizar el estado del usuario a 'dia1' antes de ejecutar la función dia1
        await userService.updateUser(senderId, { estado: 'dia1' });
        console.log(`Estado del usuario ${senderId} actualizado a 'dia1'`);

        // Ejecutar la función dia1
        await dia1(senderId);
        console.log(`*Función dia1 llamada al final del día para el usuario ${senderId}*`);
        
      } catch (error) {
        console.error(`Error al ejecutar la función dia1 o al actualizar el estado para el usuario ${senderId}:`, error);
        // Aquí podrías agregar lógica para manejar el error, como reintentar o notificar al usuario/administrador.
      }
    });

    // Almacenar el trabajo programado en scheduledJobs
    if (!scheduledJobs[senderId]) {
      scheduledJobs[senderId] = {}; // Inicializar objeto si no existe
    }
    scheduledJobs[senderId].dia1Call = dia1Job;

    console.log(`*Función dia1 programada para llamarse al final del día*`);

  } catch (error) {
    console.error(`Error al programar la llamada a dia1 para el usuario ${senderId}:`, error);
  }
};

module.exports = handleDia1Call;
