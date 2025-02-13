const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia1 = async (senderId) => {
  try {

    // Obtener información del usuario
    const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

    const imageUrl = idioma === 'ingles'
      ? 'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Ingles%2FMedal1_Eng.png?alt=media&token=5a4280c0-8870-491a-bfc2-9cb2ae647a51'
      : 'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Espa%C3%B1ol%2FMedalla1_Esp.png?alt=media&token=beed2d31-3ace-40d6-8b8b-bb6793666dd4';

  
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
      morning: convertToUTC('07:00'), // todos los niveles
      first: convertToUTC('10:00'),   // medio y alto
      second: convertToUTC('12:00'),  // alto 
      third: convertToUTC('14:00'),   // todos los niveles
      fourth: convertToUTC('16:00'),  // medio y alto
      fifth: convertToUTC('18:00'),   // alto
      sixth: convertToUTC('20:00'),   // todos los niveles 
      seventh: convertToUTC('22:00'), // alto 
      dia2Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

    };

    // Obtener la hora actual en UTC
    const nowUTC = moment().utc();

    // Función para programar mensajes en Cloud Tasks
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
      message.taskName = `${message.senderId}_dia1_${eventName}_${timestamp}`;
    
      await scheduleTask(message, scheduledTime.toDate());
      console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
    };
    

    await scheduleMessage({
      senderId,
      type: 'template',
      templateName: 'morning_day1',
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
          ? "If you're vaping, stop. If you haven’t vaped, good for you! I’m here for you whenever you have a craving."
          : "Si estás vapeando, déjalo. Si no has vapeado, ¡Bien por ti! Aquí sigo para cualquier momento que tengas antojo. ¡VAMOS!"
      }, times.first, 'first');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Did you know that using vapes dries out your mouth? It’s because the chemicals prevent the production of saliva, which is necessary for bacterial management in your mouth. The same thing is happening in other parts of your body, leading to dry, ashy-looking skin 😩. You got this!"
          : "¿Sabías que el uso de vapeadores te seca la boca? Es porque los químicos evitan que se genere la saliva necesaria para el manejo bacteriano en tu boca. Eso mismo está pasando en otras partes de tu cuerpo, y se extiende a piel seca y de aspecto cenizo 😩. ¡Tu puedes!"
      }, times.second, 'second');
    }
    // Mensaje de la tarde (todos los niveles)
    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ? `Good afternoon, ${nombre}! 🍽 if you're about to eat, enjoy your meal! \nA little fun fact while we're at it: Did you know that vaping can dull your sense of taste? 😵‍💫\n\nThe good news 🥳 is that within 1️⃣ to 3️⃣ months of quitting, your full sense of taste will come back! \nSo you're on the right track, and get ready because soon, everything will taste even more delicious 🤤😋`
        : `¡Buenas tardes, ${nombre}! 🍽 si a penas vas a comer ¡BUEN PROVECHO! \nAprovecho 😝 para dejarte un dato curioso: ¿Sabías que el vapeo reduce tu sensibilidad de sabor? 😵‍💫\nLa buena noticia🥳 es que de 1️⃣ a 3️⃣ meses de haberlo dejado regresará por completo! \nAsí que vas por buen camino y prepárate que en poco tiempo, todo te sabrá aún más delicioso 🤤😋`
    }, times.third, 'third');

    if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "I don’t know who thought vaping looked cool. But I’m glad you’re leaving it behind."
          : "No se a quién se le ocurrió pensar que la gente se ve bien vapeando. Qué bueno que ya lo estas dejando."
      }, times.fourth, 'fourth');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Hey 👀. If you’re vaping, stop."
          : "Hey 👀. Si estas vapeando, déjalo."
      }, times.fifth, 'fifth');
    }


    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ? `Good night, ${nombre}! Here’s a new recognition just for you! Congratulations on completing your first day of the program.`
        : `¡Buenas noches ${nombre}! Aquí tienes un nuevo reconocimiento sólo para tí! Felicidades por cumplir con tu primer día del programa.`
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
          ? "Remember when you were a kid and just needed a toy (or lots of them, haha) to feel happy? Vaping has nothing to do with real happiness or relaxation. You’re on the right path."
          : "Recuerdas cuando eras niñ@ y sólo necesitabas un juguete (o muchos jaja) para sentirte feliz? El vaping no tiene nada que ver con sentirte feliz o relajad@. Vas por buen camino."
      }, times.seventh, 'seventh');

    }

    await scheduleMessage({
      senderId,
      type: 'estado',
      estado: 'dia2', // 🔥 Cambia al siguiente día
    }, times.dia2Transition, 'dia2_transition');

    console.log(`📅 Mensajes programados para el usuario ${senderId}`);
  } catch (error) {
    console.error(`❌ Error al programar el día 1 para ${senderId}:`, error);
  }
};

module.exports = dia1;
