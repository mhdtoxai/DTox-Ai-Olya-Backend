const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia4 = async (senderId) => {
  try {

    // Obtener información del usuario
    const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);


      const plantilla = idioma === 'ingles'
      ? `🏃🏃‍♀️🏃‍♂️💨 🏃🏃‍♀️🏃‍♂️💨 🏃🏃‍♀️🏃‍♂️ Wow! A group of people running! How inspiring. Soon, you’ll be able to join them! Let’s go! Have an awesome day! Today, no vaping until 2️⃣ PM. Yay!`
      : `🏃🏃‍♀️🏃‍♂️💨 🏃🏃‍♀️🏃‍♂️💨 🏃🏃‍♀️🏃‍♂️ Woow!, Un grupo de personas corriendo! Que inspirador ¡Pronto podrás unirte a su grupo! Vamos!! Que tengas excelente día! Hoy no hay vape hasta las 2️⃣PM. Yei!`


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
      dia5Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
      message.taskName = `${message.senderId}_dia4_${eventName}_${timestamp}`;

      await scheduleTask(message, scheduledTime.toDate());
      console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
    };



    await scheduleMessage({
      senderId,
      type: 'template',
      templateName: 'morning_day4',
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
          ? "Eating fresh fruits and veggies isn’t just healthy, it can also help you overcome cravings. Try carrying an apple or carrots with you today." 
          : "Comer frutas y verduras frescas no solo es saludable, sino que también puede ayudarte a superar los antojos. Prueba a llevar una manzana o zanahorias contigo hoy."
      }, times.first, 'first');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ?"🗣️ Vaping can cause chronic bronchitis" 
          :"🗣️ El vaping puede causar bronquitis crónica"
      }, times.second, 'second');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ?`Hello ${nombre}! 🕑 Did you know that drinking water can help reduce vape cravings? Keep a bottle of water with you and drink throughout the day.\n\nYou can start each meal by drinking 2 glasses of water 💦💦. Do it for a month, and you’ll see a huge difference!`
        :`Hola  ${nombre}! 🕑 ¿Sabías que beber agua puede ayudarte a reducir los antojos de vapeo? Mantén una botella de agua contigo y bebe a lo largo del día.\n\nPuedes comenzar cada comida tomando 2 vasos de agua💦💦. Hazlo 1 mes y no sabes la diferencia!`

    }, times.third, 'third');


    if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Did you know that using e-cigarettes can alter the central nervous system 🧠 and affect cognitive function 📉?"
          : "¿Sabías que el uso de cigarrillos electrónicos puede alterar el sistema nervioso central 🧠 y afectar la función cognitiva 📉?"
      }, times.fourth, 'fourth');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ?"Did you know that vaping can cause dry mouth 👄 and increase the risk of tooth decay 🦷?"
        :"¿Sabías que el vapeo puede causar sequedad en la boca 👄 y aumentar el riesgo de caries dental 🦷?"
      }, times.fifth, 'fifth');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ? "🙇‍♀️ Reflect on your achievements today. Every step you take brings you closer to your goal 🫵. Tomorrow is a new opportunity to continue your progress!\n\nGood night..." 
        : "🙇‍♀️ Reflexiona sobre tus logros de hoy. Cada paso que das te acerca a tu meta 🫵. ¡Mañana es una nueva oportunidad para continuar con tu progreso!\n\nBuenas nochezzzz..."
    }, times.sixth, 'sixth');

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ?"Vaping affects your ability to play sports 🏀. You’ll run out of breath 😵 and won’t perform well in physical activities 🏋️‍♀️"
          :"El vapeo afecta tu capacidad para hacer deporte 🏀. Te quedarás sin aliento 😵 y no podrás rendir bien en tus actividades deportivas 🏋️‍♀️."
      }, times.seventh, 'seventh');

    }

    await scheduleMessage({
      senderId,
      type: 'estado',
      estado: 'dia5', // 🔥 Cambia al siguiente día
    }, times.dia5Transition, 'dia5_transition');

    console.log(`📅 Mensajes programados para el usuario ${senderId}`);
  } catch (error) {
    console.error(`❌ Error al programar el día 4 para ${senderId}:`, error);
  }
};

module.exports = dia4;
