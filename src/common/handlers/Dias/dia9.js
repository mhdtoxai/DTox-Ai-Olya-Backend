const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia9 = async (senderId) => {
  try {

    // Obtener información del usuario
    const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);


      const plantilla = idioma === 'ingles'
      ? `✋🏻Good morning 🌅Today's challenges:1️⃣ Hold on to the urge not to vape until 6:30PM 2️⃣ ✍️ Write down on paper the 5 reasons why you DO vape. If you have more, the better. Fold the paper and carry it with you all day in the bag. At the end of the day I will tell you what to do.`
      : `✋🏻Buenos días 🌅 Retos de hoy:1️⃣ Aguanta las ganas de no vapear hasta las 6:30PM 2️⃣ ✍️ Anota en un papel las 5 razones por las que SI vapeas. Si tienes más, mejor. Dobla el papel y tráelo contigo todo el día en la bolsa. Al final del día te diré que hacer.`


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
      dia10Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
      message.taskName = `${message.senderId}_dia9_${eventName}_${timestamp}`;

      await scheduleTask(message, scheduledTime.toDate());
      console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
    };



    await scheduleMessage({
      senderId,
      type: 'template',
      templateName: 'morning_day9',
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
          ? "Did you know that vaping can lead to a nicotine addiction equal to or even greater 🚬 than smoking traditional cigarettes?"
          : "¿Sabías que el vapeo puede llevar a una dependencia de la nicotina igual o incluso mayor 🚬 que fumar cigarrillos tradicionales?"
      }, times.first, 'first');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ?"🗣️ Vaping can cause high blood pressure."
        :"🗣️ Vapear puede provocar hipertensión arterial."
      }, times.second, 'second');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
      ?`${nombre}, midday reminder: 'Success is the sum of small efforts repeated day in and day out.' – Robert Collier. Keep going!`
      :`${nombre}, a mitad del día, recuerda: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.' – Robert Collier. ¡Sigue adelante!`
    }, times.third, 'third');


    if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ? "Did you know that vape liquids can contain carcinogenic substances like tobacco-specific nitrosamines 🧬🧬?"
          : "¿Sabías que los líquidos de vapeo pueden contener sustancias cancerígenas como las nitrosaminas específicas del tabaco 🧬🧬?"
      }, times.fourth, 'fourth');
    }

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
        ? "Did you know that vaping can cause oxidative damage to body tissues, contributing to premature aging 🕰️👵?"
        : "¿Sabías que el vapeo puede causar daño oxidativo en los tejidos del cuerpo, lo que contribuye al envejecimiento prematuro 🕰️👵?"
      }, times.fifth, 'fifth');
    }

    await scheduleMessage({
      senderId,
      type: 'text',
      message: idioma === 'ingles'
        ?"Congratulations! You’ve completed day 9 of your program.\n\nHere’s what you should do now:\n1.- Take out the paper where you wrote your reasons this morning.\n2.- Realize that you carried those reasons all day.\n3.- They didn’t help you, in fact, they probably were a hindrance.\n4.- Similarly, vaping is a habit that serves no purpose.\n5.- Rip the paper into as many pieces as you can and throw it in the trash.\n6.- As you do this, thank yourself for the huge step you’re taking.\n\nCongratulations! Now it’s time to have dinner and get some sleep :)"
        :"¡Felicidades! Has pasado el día 9 de tu programa.\n\nLo que deberás hacer ahora es sacar el papel donde anotaste esta mañana.\n1.- Lee las razones que anotaste.\n2.- Date cuenta que todo el día estuviste cargando con esas razones.\n3.- No te aportaron nada, de hecho seguramente te estuvieron estorbando.\n4.- De la misma manera, vapear es un hábito que no te sirve de nada.\n5.- Rompe el papel en tantos pedazos como puedas y tíralo a la basura.\n6.- Mientras lo haces, agradécete a ti mismo por el gran paso que estás dando.\n\n¡Felicidades! A cenar y a dormir :)"
    }, times.sixth, 'sixth');

    if (nivel === 'alto' || nivel === 'high') {
      await scheduleMessage({
        senderId,
        type: 'text',
        message: idioma === 'ingles'
          ?"Vaping can harm your heart ❤️. You could develop arrhythmias ⚠️ and suffer a heart attack 💔 at any moment."
          :"Vapear afecta tu corazón ❤️. Podrías desarrollar arritmias ⚠️ y sufrir un infarto 💔 en cualquier momento."
      }, times.seventh, 'seventh');

    }

    await scheduleMessage({
      senderId,
      type: 'estado',
      estado: 'dia10', // 🔥 Cambia al siguiente día
    }, times.dia10Transition, 'dia10_transition');

    console.log(`📅 Mensajes programados para el usuario ${senderId}`);
  } catch (error) {
    console.error(`❌ Error al programar el día 9 para ${senderId}:`, error);
  }
};

module.exports = dia9;
