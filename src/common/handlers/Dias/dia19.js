const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia19 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

        const plantilla = idioma === 'ingles'
            ? `Good morning! ☀️ Keep your mind busy 📚 and your heart strong ❤️. Today, if you decide to vape, do it after 12:00 AM ⏰. Every half hour you advance is a sign of your strength and commitment 🚭. You're closer than ever, legend! 💪✨`
            : `¡Buenos días! ☀️ Mantén la mente ocupada 📚 y el corazón fuerte ❤️. Hoy, si decides vapear, hazlo después de las 12:00 AM ⏰. Cada media hora que avanzas es una muestra de tu fuerza y compromiso 🚭. ¡Estás más cerca que nunca, leyenda! 💪✨`

        // 🔹 Construcción de URL única para test
        const testUrl = `https://olya.club/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=5&language=${idioma}`;

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
            testUrl: convertToUTC('17:00'), // todos los niveles
            fifth: convertToUTC('18:00'),  // alto 
            RecUrl: convertToUTC('19:00'), // todos los niveles
            sixth: convertToUTC('20:00'),   // todos los niveles 
            seventh: convertToUTC('22:00'), // alto 
            dia20Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia19_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };

        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day19',
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
                    ? "Did you know that vaping can decrease the body’s ability to fight respiratory infections 🦠🦠?"
                    : "¿Sabías que el vapeo puede disminuir la capacidad del cuerpo para combatir infecciones respiratorias 🦠🦠?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                ?"🗣️ Vaping can weaken your immune system."
                :"🗣️ Vapear puede disminuir la eficacia del sistema inmunológico."
            }, times.second, 'second');
        }


        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ?`What do you think ${nombre} One more day to go. You got this!` 
                :`Que crees ${nombre}? ¡Sólo falta un día! ¡Qué emoción! Ánimo que estás a punto de terminar!`
        }, times.third, 'third');



        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ?"Vaping can affect your skin 🌟. You’ll deal with acne and premature aging 👵 due to the toxins 🧪."
                    :"El vapeo puede afectar tu piel 🌟. Enfrentarás acné y envejecimiento prematuro 👵 debido a las toxinas 🧪."
            }, times.fourth, 'fourth');
        }
     
        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? `💨 Time to test your lung capacity! Click here: ${testUrl}`
                : `💨 Hora de medir tu capacidad pulmonar! Da clic aquí: ${testUrl}`
        }, times.testUrl, 'test_url');

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping affects your memory 📚. You’ll forget important things ❗ and struggle to retain information 📉."
                    : "Vapear afecta tu memoria 📚. Olvidarás cosas importantes ❗ y te costará retener información 📉."
            }, times.fifth, 'fifth');
        }
       
        await scheduleMessage({
            senderId,
            type: 'checktest',
            testId:'5',
            message: idioma === 'ingles'
                ? `💨 Your Lung Retention Test is still pending. Clic here to do it:: ${testUrl}`
                : `💨 Aún tienes pendiente tu prueba de retención pulmonar! Da clic aquí: ${testUrl}`
        }, times.RecUrl, 'RecUrl');


        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "Vaping can lead to chronic lung diseases 🫁. You’ll live with constant pain 😣 and need long-term medical treatment 💊."
                : "Vapear puede provocar enfermedades pulmonares crónicas 🫁. Vivirás con dolor constante 😣 y necesitarás tratamiento médico prolongado 💊."

        }, times.sixth, 'sixth');


        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping affects your ability to concentrate 📉. You’ll find it difficult to focus 📚 and perform in your daily activities 🗓️."
                    : "El vapeo afecta tu capacidad de concentración 📉. Te resultará difícil enfocarte 📚 y rendir en tus actividades diarias 🗓️."
            }, times.seventh, 'seventh');

        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia20', // 🔥 Cambia al siguiente día
        }, times.dia20Transition, 'dia20_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 19 para ${senderId}:`, error);
    }
};

module.exports = dia19;
