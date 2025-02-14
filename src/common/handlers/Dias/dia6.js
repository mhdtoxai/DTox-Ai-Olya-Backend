const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia6 = async (senderId) => {
  try {

    // Obtener información del usuario
    const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);


      const plantilla = idioma === 'ingles'
      ? `Good morning 🌞 Today, try swapping vaping for a short walk outside. Nature and exercise can be your best allies.It doesn’t matter what time you can do it. Just remember, no vaping until after 4️⃣ PM today. LET’S GO!`
      : `Buenas días🌞 Hoy, intenta sustituir el vapeo por un paseo corto al aire libre. La naturaleza y el ejercicio pueden ser tus mejores aliados.No importa a la hora que puedas. Recuerda que hoy pasamos el vapeo hasta después de las 4️⃣PM. VENGA!`


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
      dia7Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
      message.taskName = `${message.senderId}_dia6_${eventName}_${timestamp}`;

      await scheduleTask(message, scheduledTime.toDate());
      console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
    };



    await scheduleMessage({
      senderId,
      type: 'template',
      templateName: 'morning_day_6',
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
          ?"Did you know that some vape liquids contain toxic chemicals like formaldehyde and acrolein 🧪🧪?"
          :"¿Sabías que algunos líquidos de vapeo contienen sustancias químicas tóxicas como el formaldehído y el acroleína 🧪🧪?"
      }, times.first, 'first');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ?"🗣️ Some vape flavors contain carcinogenic. Which ones? I’m not sure, but why risk it?"
        :"🗣️ Algunos sabores de vapeo contienen sustancias cancerígenas. ¿Cuáles? No sé la verdad, pero ¿para qué arriesgarse?"
      }, times.second, 'second');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ?`Pssst Pssst! ${nombre}, They’re giving away fresh aguas frescas at the plaza kiosk! They’ve got Lime, Horchata, Jamaica, Guava, and Watermelon. Yuuuuuuummm 😋\n\n 😋 NOT if your vaping though. Sorry!` 
        :`Pssst Pssst! ${nombre}, Están regalando aguas frescas en el quiosco de la plaza! Tienen de Limón, Horchata, Jamaica, Guayaba, y Sandía. ¡Yuuuuuuummm 😋\n\n Pero dicen que si vapeas no te toca. Ni modo... pronto.`

    }, times.third, 'third');


    if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Did you know that the vapor from e-cigarettes can contain toxic volatile organic compounds ☠️?" 
          : "¿Sabías que el vapor de los cigarrillos electrónicos puede contener compuestos orgánicos volátiles que son tóxicos ☠️?"
      }, times.fourth, 'fourth');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ? "Did you know that vaping can cause nausea 🤢, vomiting 🤮, and abdominal pain in some users?"
        : "¿Sabías que el vapeo puede causar náuseas 🤢, vómitos 🤮 y dolor abdominal en algunos usuarios?"

      }, times.fifth, 'fifth');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ? "🥳 Congratulations on making it this far! 🥳 Remember to celebrate your small victories and reward yourself for each day vape-free 📈. You’re doing an amazing job! 🔝🔝🔝🔝"
        : "🥳 ¡Felicidades por llegar hasta aquí! 🥳 Recuerda celebrar tus pequeñas victorias y recompénsate por cada día libre de vapeo 📈. ¡Estás haciendo un trabajo increíble! 🔝🔝🔝🔝"
    }, times.sixth, 'sixth');

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ?"Vaping affects your skin 🌟. You’ll face dermatological problems 🩹 and premature aging 👵."
          :"El vapeo afecta tu piel 🌟. Enfrentarás problemas dermatológicos 🩹 y envejecimiento prematuro 👵."
      }, times.seventh, 'seventh');

    }

    await scheduleMessage({
      senderId,
      type: 'estado',
      estado: 'dia7', // 🔥 Cambia al siguiente día
    }, times.dia7Transition, 'dia7_transition');

    console.log(`📅 Mensajes programados para el usuario ${senderId}`);
  } catch (error) {
    console.error(`❌ Error al programar el día 6 para ${senderId}:`, error);
  }
};

module.exports = dia6;
