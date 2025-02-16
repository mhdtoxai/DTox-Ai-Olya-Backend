const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia11 = async (senderId) => {
  try {

    // Obtener información del usuario
    const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);


      const plantilla = idioma === 'ingles'
      ? `Good morning! ☀️ Today is a new day to stay strong 💪 and healthy 🥗. You are amazing! 🌟 Repeat after me: Today I won't vape until 8 PM Today I will not give in Today I will be strong Today I decide that my day will be free, and at 8 I will be a slave to the vape again.`
      : `¡Buenos días! ☀️ Hoy es un nuevo día para mantenerte fuerte 💪 y saludable 🥗. ¡Eres increíble! 🌟 Repite conmigo: Hoy no vapearé hasta las 8 PM Hoy no cederé Hoy seré fuerte Hoy YO decido que mi día estará libre, y a las 8 volveré a ser esclavo del vape.`


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
      morning: convertToUTC('07:00'), // todos los niveles
      first: convertToUTC('10:00'),   // medio y alto
      second: convertToUTC('12:00'),  // alto 
      third: convertToUTC('14:00'),   // todos los niveles
      fourth: convertToUTC('16:00'),  // medio y alto
      fifth: convertToUTC('18:00'),   // alto
      sixth: convertToUTC('20:00'),   // todos los niveles 
      seventh: convertToUTC('22:00'), // alto 
      dia12Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
      message.taskName = `${message.senderId}_dia11_${eventName}_${timestamp}`;

      await scheduleTask(message, scheduledTime.toDate());
      console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
    };



    await scheduleMessage({
      senderId,
      type: 'template',
      templateName: 'morning_day11',
      languageCode: idioma === 'ingles'
        ? 'en_US'
        : 'es_MX',
      plantilla: plantilla,
    }, times.morning, 'morning');


    // Mensajes dependiendo del nivel
    if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ?"Did you know that e-cigarette vapor can contain heavy metals like lead, nickel, and chromium 🏭⚙️?"
          :"¿Sabías que el vapor de los cigarrillos electrónicos puede contener metales pesados como el plomo, el níquel y el cromo 🏭⚙️?"
      }, times.first, 'first');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ?"🗣️ Vaping can irritate your throat"
        :"🗣️ El vapeo puede causar irritación en la garganta."

      }, times.second, 'second');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
      ?`Hi ${nombre}! 'The key to success is to focus on goals, not obstacles.' – Arthur Ashe. Keep focusing on your goal to quit vaping.` 
      :`¡Hola ${nombre}! 'La clave para el éxito es centrarse en metas, no en obstáculos.' – Arthur Ashe. Sigue enfocándote en tu objetivo de dejar de vapear.`
    }, times.third, 'third');


    if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Did you know that vaping can contribute to the development of inflammatory diseases in the respiratory system 🔥🫁?"
          : "¿Sabías que el vapeo puede contribuir al desarrollo de enfermedades inflamatorias en el sistema respiratorio 🔥🫁?"
      }, times.fourth, 'fourth');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ?"Vaping can destroy your lungs 🫁. Without fresh air 🌬️, you’ll feel weak 🥴 and constantly exhausted."
        :"El vapeo puede destruir tus pulmones 🫁. Sin aire fresco 🌬️, te sentirás débil 🥴 y agotado todo el tiempo."
      }, times.fifth, 'fifth');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ?"LET'S GIVE IT! Today was a great day. You're doing a great job. If you could last until 8:15 that would be great. Just to show you that YOU are in control. COME ON!"
        :"A DARLE! Hoy fué un gran día. Estás haciendo un gran trabajo. Si pudieras aguantar hasta las 8:15 sería genial. Sólo para demostrarte que TU tienes el control. VAMOS!"
    }, times.sixth, 'sixth');

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ?"Vaping damages your dental health 🦷. You’ll face constant cavities 😬 and gum pain 🔴."
          :"Vapear daña tu salud dental 🦷. Enfrentarás caries constantes 😬 y dolor de encías 🔴."
      }, times.seventh, 'seventh');

    }

    await scheduleMessage({
      senderId,
      type: 'estado',
      estado: 'dia12', // 🔥 Cambia al siguiente día
    }, times.dia12Transition, 'dia12_transition');

    console.log(`📅 Mensajes programados para el usuario ${senderId}`);
  } catch (error) {
    console.error(`❌ Error al programar el día 11 para ${senderId}:`, error);
  }
};

module.exports = dia11;
