const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia7 = async (senderId) => {
  try {

    // Obtener información del usuario
    const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);


      const plantilla = idioma === 'ingles'
      ? `Good morning, you’re doing great! Today, you’ve got 2 super important challenges: 1️⃣ No vaping before 5 PM 2️⃣ Tell 🗣️ someone close to you that you’re quitting vaping.LET’S GO!`
      : `Buenos días, Vas muy bien! Hoy tienes 2 retos super importantes:1️⃣ No vapear antes de las 5PM 2️⃣ Cuéntale 🗣️ a una persona cercana a tí que estás dejando de vapear.¡VAMOS!`


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
      dia8Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
      message.taskName = `${message.senderId}_dia7_${eventName}_${timestamp}`;

      await scheduleTask(message, scheduledTime.toDate());
      console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
    };



    await scheduleMessage({
      senderId,
      type: 'template',
      templateName: 'morning_day7',
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
          ?"Did you know that vaping can increase the risk of cardiovascular diseases ❤️, like heart attacks and strokes 💔?"
          :"¿Sabías que el vapeo puede aumentar el riesgo de enfermedades cardiovasculares ❤️, como 💔 ataques cardíacos y derrames cerebrales?"
      }, times.first, 'first');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ?"🗣️ Vaping can reduce lung capacity." 
        :"🗣️ El vapeo puede reducir la capacidad pulmonar."
      }, times.second, 'second');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
      ?`${nombre}, 😵‍💫 The hospital called me this morning... They asked if they should hold a spot for you in case you get chronic bronchitis. I told them no because you’re already quitting vaping. Don’t worry 🤝` 
      :`${nombre}, 😵‍💫 Me hablaron del hospital esta mañana... Me dijeron que si te mantienen el lugar por si te da una bronquitis crónica. Les dije que no porque ya estás dejando de vapear. Tú tranqui 🤝`
    }, times.third, 'third');


    if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Did you know that vaping can negatively impact mental health 🧘, contributing to anxiety 😟 and depression 😔?"
          : "¿Sabías que el vapeo puede afectar negativamente la salud mental 🧘, contribuyendo a la ansiedad 😟 y la depresión 😔?"
      }, times.fourth, 'fourth');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ? "Did you know that e-cigarettes can increase antibiotic resistance 💊 in the bacteria present in your body?"
        : "¿Sabías que los cigarrillos electrónicos pueden aumentar la resistencia a los antibióticos 💊 en las bacterias presentes en el cuerpo?"
      }, times.fifth, 'fifth');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ? "Good night. Today, you’ve taken another important step toward a vape-free life. Rest well, you deserve it!" 
        : "Buenas noches. Hoy has dado otro paso importante hacia una vida sin vapeo. ¡Descansa bien, te lo mereces!"
    }, times.sixth, 'sixth');

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Vaping affects your respiratory system 🌬️. Chronic cough 🤧 and difficulty breathing will be your daily reality 🫁." 
          : "Vapear afecta tu sistema respiratorio 🌬️. Tos crónica 🤧 y dificultad para respirar serán tu realidad diaria 🫁."
      }, times.seventh, 'seventh');

    }

    await scheduleMessage({
      senderId,
      type: 'estado',
      estado: 'dia8', // 🔥 Cambia al siguiente día
    }, times.dia8Transition, 'dia8_transition');

    console.log(`📅 Mensajes programados para el usuario ${senderId}`);
  } catch (error) {
    console.error(`❌ Error al programar el día 7 para ${senderId}:`, error);
  }
};

module.exports = dia7;
