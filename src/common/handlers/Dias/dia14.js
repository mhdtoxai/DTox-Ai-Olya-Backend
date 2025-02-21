const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');


const dia14 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);


        const plantilla = idioma === 'ingles'
            ? `Good morning! ☀️ Today is a great day 🌟 to continue moving towards a life without vaping 🚭. You have the strength! 💪 Today vape until 9️⃣:30PM!`
            : `¡Buenos días! ☀️ Hoy es un gran día 🌟 para seguir avanzando hacia una vida sin vapeo 🚭. ¡Tú tienes la fuerza! 💪 Hoy vapea hasta las 9️⃣:30PM!`


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
            dia15Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia14_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };



        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day14',
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
                    ?"Did you know that some studies have linked vaping to a higher risk of developing chronic bronchitis 🫁😷?"
                    :"¿Sabías que algunos estudios han vinculado el vapeo con un mayor riesgo de desarrollar bronquitis crónica 🫁😷?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ?"🗣️ Vaping can increase the risk of respiratory infections." 
                    :"🗣️ El vapeo puede aumentar el riesgo de infecciones respiratorias."
            }, times.second, 'second');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
               ? `${nombre}! midday reminder: 'Every great achievement begins with the decision to try.' – Gail Devers. Your effort counts!` 
               : `${nombre}!, a la mitad del día: 'Cada gran logro comienza con la decisión de intentarlo.' – Gail Devers. ¡Tu esfuerzo cuenta!`
        }, times.third, 'third');

        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping makes you more prone to respiratory infections 🤧. You could end up hospitalized 🏥 and bedridden for weeks 🛌."
                    : "Vapear te hace más propenso a infecciones respiratorias 🤧. Podrías terminar hospitalizado 🏥 y en cama durante semanas 🛌."
            }, times.fourth, 'fourth');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping can lead to cancer 🧬. The risk is high 🚫, and the treatment can be painful 💊."
                    : "Vapear puede llevarte a desarrollar cáncer 🧬. El riesgo es alto 🚫 y el tratamiento puede ser doloroso 💊."
            }, times.fifth, 'fifth');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "Have a peaceful night. You’re making an incredible effort, and every day without vaping counts. Stay strong!"
                : "Que tengas una noche tranquila. Estás haciendo un esfuerzo increíble y cada día sin vapeo cuenta. ¡Ánimo!"
        }, times.sixth, 'sixth');

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping can cause inflammatory diseases 🔥. You’ll suffer from continuous pain and discomfort 😖."
                    : "El vapeo puede causar enfermedades inflamatorias 🔥. Sufrirás de dolor y malestar continuo 😖."
            }, times.seventh, 'seventh');

        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia15', // 🔥 Cambia al siguiente día
        }, times.dia15Transition, 'dia15_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 14 para ${senderId}:`, error);
    }
};

module.exports = dia14;
