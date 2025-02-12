const scheduleTask = require('../../services/cloudTasksService'); // Asegúrate de tener esta función de Cloud Tasks
const getUserInfo = require('../../services/getUserInfo');
const moment = require('moment-timezone');

const handleDia1Call = async (senderId) => {
  try {
    // Obtener información del usuario (incluyendo zona horaria e idioma)
    const { timezone, idioma } = await getUserInfo(senderId);

    // Determinar la plantilla según el idioma del usuario
    const plantilla = idioma === 'ingles'
      ? `☀️Good morning! Today is your first day of the program 😎. At Olya AI we are very proud that you have decided to embark on this path. Your task today is very simple. Hold off the urge to vape as late as possible. When you can't stand it anymore, relax and enjoy what you have stood. Even if it's an hour, it doesn't matter`
      : `☀️¡Buenos días! Hoy es tu primer día del programa 😎. En Olya AI nos sentimos muy orgullosos de que hayas decidido embarcarte en este camino. Tu tarea de hoy es muy sencilla. Aguanta las ganas de vapear lo más tarde que puedas. Cuando ya no aguantes, relájate y disfruta lo que hayas aguantado. Así sea una hora, no importa`;


    console.log(`🌍 Zona horaria del usuario: ${timezone}`);
    // Función para convertir la hora local del usuario a UTC
    const convertToUTC = (time) => {
      const localTime = moment.tz(time, 'HH:mm', timezone).set({
        year: moment().tz(timezone).year(),
        month: moment().tz(timezone).month(),
        date: moment().tz(timezone).date(),
      });

      const utcTime = localTime.clone().utc();

      return utcTime;
    };
    // Definir los horarios en UTC
    const times = {

      dia1Transition: convertToUTC('00:00'), 
    };

    // Obtener la hora actual en UTC
    const nowUTC = moment().utc();

    const scheduleMessage = async (message, scheduledTime, eventName) => {
      // Usar scheduledTime directamente
      if (scheduledTime.isBefore(nowUTC)) {
        console.log(`⚠️ La hora programada (${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC) ya pasó. Se programará para el día siguiente.`);
        scheduledTime.add(1, 'day'); // Mover al día siguiente
      } else {
        console.log(`🕒 Hora en UTC: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
      }
    
      console.log(`🌍 Equivalente en ${timezone}: ${scheduledTime.clone().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}`);
    
      const timestamp = Date.now(); // Obtener timestamp actual
      message.taskName = `${message.senderId}_${eventName}_${timestamp}`;
    
      await scheduleTask(message, scheduledTime.toDate());
      console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
    };
    
    await scheduleMessage({
      senderId,
      type: 'estado',
      estado: 'dia1', // 🔥 Cambia al siguiente día
      plantilla: plantilla,
    }, times.dia1Transition, 'dia1_transition');

    console.log(`📅 Mensajes programados para el usuario ${senderId} para ejecutar dia1`);

  } catch (error) {
    console.error(`❌ Error al programar la llamada a dia1 para el usuario ${senderId}:`, error);
  }
};

module.exports = handleDia1Call;
