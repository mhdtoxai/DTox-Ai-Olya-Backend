const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia13 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);


        const plantilla = idioma === 'ingles'
            ? `Good morning! ☀️ Stay focused 🎯 on your goals and remember why you started this journey 🌍. Cheer up! 💪 Let's break records! Today he vapes until 9️⃣PM!`
            : `¡Buenos días! ☀️ Mantente enfocado 🎯 en tus metas y recuerda por qué empezaste este viaje 🌍. ¡Ánimo! 💪 . A romper récords! Hoy vapea hasta las 9️⃣PM`


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
            dia14Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia13_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };



        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day13',
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
                    ? "Did you know that long-term e-cigarette use can negatively affect the body’s immune function 🛡️🛡️?"
                    : "¿Sabías que el uso prolongado de cigarrillos electrónicos puede afectar negativamente la función inmunológica del cuerpo 🛡️🛡️?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "🗣️ Vaping can cause periodontal diseases."
                    : "🗣️ Vapear puede causar enfermedades periodontales."
            }, times.second, 'second');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? `${nombre}!, before eating, remember: 'Success is the ability to go from one failure to another with no loss of enthusiasm.' – Winston Churchill. Don’t give up!`
                : `${nombre}!, antes de comer, recuerda: 'El éxito es la capacidad de ir de fracaso en fracaso sin perder el entusiasmo.' – Winston Churchill. ¡No te rindas!`
        }, times.third, 'third');


        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping damages your lung capacity 🫁. Climbing stairs 🚶‍♂️ will be a challenge, and you’ll constantly be short of breath 😮‍💨."
                    : "El vapeo daña tu capacidad pulmonar 🫁. Subir escaleras 🚶‍♂️ será un desafío, y te faltará el aire constantemente 😮‍💨."
            }, times.fourth, 'fourth');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping damages your ability to taste food 🍎. You’ll enjoy your favorite meals 🍔 less and lose your appetite 🍽️."
                    : "El vapeo daña tu capacidad para saborear alimentos 🍎. Disfrutarás menos de tus comidas favoritas 🍔 y perderás el apetito 🍽️."
            }, times.fifth, 'fifth');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "Good night! Today, you’ve shown great strength. Keep going, one day at a time, and you’ll reach your goal."
                : "Buenas noches! Hoy has demostrado gran fortaleza. Sigue así, un día a la vez, y alcanzarás tu meta."
        }, times.sixth, 'sixth');

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping affects your ability to enjoy food 🍽️. You’ll lose your sense of taste 🍎 and the pleasure of eating 🥘."
                    : "Vapear afecta tu capacidad para disfrutar de la comida 🍽️. Perderás el sentido del gusto 🍎 y el placer de comer 🥘."
            }, times.seventh, 'seventh');

        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia14', // 🔥 Cambia al siguiente día
        }, times.dia14Transition, 'dia14_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 13 para ${senderId}:`, error);
    }
};

module.exports = dia13;
