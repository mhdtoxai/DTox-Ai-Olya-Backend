const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia3 = async (senderId) => {
  try {

    // Obtener información del usuario
    const { idioma, nombre, nivel, timezone, codigo } = await getUserInfo(senderId);

    const imageUrl = idioma === 'ingles' ?
    'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Ingles%2FMedal2_Eng.png?alt=media&token=d2a12a1d-6345-4692-a784-e09c2143ada9' : // Reemplaza con el enlace de la imagen en inglés
    'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Espa%C3%B1ol%2FMedalla2_Esp.png?alt=media&token=73c0b2bd-1a1b-49a9-87f9-2d2479d35d92'; // Reemplaza con el enlace de la imagen en español

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
      dia4Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
      message.taskName = `${message.senderId}_dia3_${eventName}_${timestamp}`;

      await scheduleTask(message, scheduledTime.toDate());
      console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
    };



    await scheduleMessage({
      senderId,
      type: 'template',
      templateName: 'morning_day3',
      languageCode: idioma === 'ingles'
        ? 'en_US'
        : 'es_MX',
    }, times.morning, 'morning');


    // Mensajes dependiendo del nivel
    if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "No excuses, YOU CAN DO IT! If cravings hit, remember to say CRAVING, and we’ll beat it together."
          : "¡No hay pretextos, SI PUEDES! Si tienes antojos, recuerda decir ANTOJO y lo vencemos juntos."
      }, times.first, 'first');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Just a heads up: vaping can cause digestive problems 🤢🤮."
          : "Sólo quiero decirte que el vaping puede causar problemas en el sistema digestivo 🤢🤮."
      }, times.second, 'second');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ? `Hi ${nombre}. 🗣️🗣️ Spread the word and earn $1 for each referral. You just need to share your unique code. Forward the following to anyone you can help improve their health:` 
        : `Hola ${nombre}. 🗣️🗣️ Corre la voz y gana 1USD por cada referido. Únicamente deberás compartirle tu código único. Reenvía lo siguiente a quien puedes ayudar a mejorar su salud:`

    }, times.third, 'third');

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ?`Hey! I already quit vaping, what about you? What are you waiting for?\nThe full program costs $10, and with my code, you get a 15% discount.\n\nDiscount code: ${codigo}\n\nWith Olya, freedom is possible.`
        :`¡Hola! Yo ya dejé de vapear, ¿y tú? ¿Qué esperas?\nEl programa completo cuesta 10USD y con mi código recibes un descuento del 15%.\n\nCódigo de descuento: ${codigo}\n\nCon Olya, es posible ser libre.`
    
    }, times.third, 'third_code');

    await scheduleMessage({
      senderId,
      type: 'contactcard',
    }, times.third, 'contactcard');


    if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "NO VAPE NO VAPE NO VAPE NO VAPE"
          : "NO VAPE NO VAPE NO VAPE NO VAPE"
      }, times.fourth, 'fourth');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ?"👅👅Vaping can negatively affect your oral health, causing dryness, cavities, and a burnt tongue 👅👅. Who wants that?" 
          :"👅👅El vaping puede afectar negativamente la salud bucal, causando resequedad, caries y lengua escaldada👅👅. ¿Quién quiere eso?"
      }, times.fifth, 'fifth');
    }



    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ?"Time to rest! You’ve unlocked a new achievement. Keep it up!"
        :"¡A descansar! Tienes un nuevo logro desbloqueado. Sigue así!"
    }, times.sixth, 'sixth');

    
    await scheduleMessage({
      senderId,
      type: 'image',
      imageUrl: imageUrl,
    }, times.sixth, 'sixth_Image');


    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Vaping can cause digestive problems 🤢. You’ll suffer from nausea 🤮 and constant stomach discomfort 🤧."
          : "Vapear puede causar problemas digestivos 🤢. Sufrirás de náuseas 🤮 y malestar estomacal constante 🤧."
      }, times.seventh, 'seventh');

    }

    await scheduleMessage({
      senderId,
      type: 'estado',
      estado: 'dia4', // 🔥 Cambia al siguiente día
      plantilla: plantilla,
    }, times.dia4Transition, 'dia4_transition');

    console.log(`📅 Mensajes programados para el usuario ${senderId}`);
  } catch (error) {
    console.error(`❌ Error al programar el día 3 para ${senderId}:`, error);
  }
};

module.exports = dia3;
