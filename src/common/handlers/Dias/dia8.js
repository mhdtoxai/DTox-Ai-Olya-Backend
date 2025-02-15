const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia8 = async (senderId) => {
  try {

    // Obtener información del usuario
    const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);


      const plantilla = idioma === 'ingles'
      ? `🫣 "When my friends stop" 🫣 "When I no longer have so much stress" 🫣 "Having My Birthday" 🫣 "In the new year" 🙇‍♀️🫵 If not now... When? ⚡️⚡️STOP VAPING! Your mission today: Vape only after 6PM`
      : `🫣 "Cuando lo dejen mis amig@s" 🫣 "Cuando ya no tenga tanto estrés" 🫣 "Pasando Mi cumpleaños" 🫣 "En año nuevo" 🙇‍♀️🫵 Si no es ahora... ¿Cuándo? ⚡️⚡️DEJA DE VAPEAR! Tu misión de hoy: Vapear solamente después de las 6PM`


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
      dia9Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
      message.taskName = `${message.senderId}_dia8_${eventName}_${timestamp}`;

      await scheduleTask(message, scheduledTime.toDate());
      console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
    };



    await scheduleMessage({
      senderId,
      type: 'template',
      templateName: 'morning_day_8',
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
          ? "Did you know that vaping is not fully regulated ⚖️, which means that the exact ingredients in e-liquids are not always known 🧐?" 
          : "¿Sabías que el vapeo no está completamente regulado ⚖️, lo que significa que los ingredientes exactos de los líquidos no siempre se conocen 🧐?"
      }, times.first, 'first');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ? "🗣️ Vaping can damage blood vessels."
        : "🗣️ El vapeo puede causar daño a los vasos sanguíneos."
      }, times.second, 'second');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
      ?`Look ${nombre}... You’ve decided to quit. You and I both know it brings you nothing good. It has no health benefits. So why keep going, right?`
      :`A ver ${nombre}... Ya decidiste dejarlo. Tú y yo sabemos que no te trae nada bueno. No tiene beneficio alguno para tu salud. Entonces... ¿Para qué seguir, no crees?`
    }, times.third, 'third');


    if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Did you know that vaping can lead to increased blood pressure and heart rate 💓💓?"
          : "¿Sabías que el vapeo puede provocar un aumento de la presión arterial y la frecuencia cardíaca 💓💓?"
      }, times.fourth, 'fourth');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ? "Did you know that vaping can affect lung function and reduce your exercise capacity 🏃‍♂️🏃‍♀️?" 
        : "¿Sabías que el vapeo puede afectar la función pulmonar y reducir la capacidad de ejercicio 🏃‍♂️🏃‍♀️?"
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
          ? "Good night.Today, you’ve taken another important step toward a vape-free life. Rest well, you deserve it!"
          : "¡Buenas noches! Felicidades por superar otro día sin vapear. Mañana es una nueva oportunidad para seguir adelante."
      }, times.seventh, 'seventh');

    }

    await scheduleMessage({
      senderId,
      type: 'estado',
      estado: 'dia9', // 🔥 Cambia al siguiente día
    }, times.dia9Transition, 'dia9_transition');

    console.log(`📅 Mensajes programados para el usuario ${senderId}`);
  } catch (error) {
    console.error(`❌ Error al programar el día 8 para ${senderId}:`, error);
  }
};

module.exports = dia8;
