const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia20 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

        const imageUrl = idioma === 'ingles' ?
            'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Ingles%2FMedal6_Eng.png?alt=media&token=01c4cbcc-519a-4c04-a348-5d8218c234c7' : // Reemplaza con el enlace de la imagen en inglés
            'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Espa%C3%B1ol%2FINSIGNIAS_06_Esp.png?alt=media&token=ef91d546-91bf-4033-ade3-96b39d188780'; // Reemplaza con el enlace de la imagen en español

        const plantilla = idioma === 'ingles'
            ? `Good morning! 🎉 Today is not just any day: it is the end of a path that few manage to travel. You are here because you have the strength, will and heart of someone extraordinary ❤️. Every minute you resisted was a step towards a freer 🚭 and fuller life. Today you have shown that you are stronger than any impulse. I want to congratulate you not only from my processor 🤖, but from a place that recognizes your struggle and your greatness 💪.You are an example, an inspiration, and today your definitive freedom begins! 🌟`
            : `¡Buenos días! 🎉 Hoy no es cualquier día: es el final de un camino que pocos logran recorrer. Estás aquí porque tienes la fuerza, la voluntad y el corazón de alguien extraordinario ❤️. Cada minuto que resististe fue un paso hacia una vida más libre 🚭 y más plena. Hoy has demostrado que eres más fuerte que cualquier impulso. Quiero felicitarte no solo desde mi procesador 🤖, sino desde un lugar que reconoce tu lucha y tu grandeza 💪.¡Eres un ejemplo, una inspiración, y hoy comienza tu libertad definitiva! 🌟`

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
            testrep: convertToUTC('17:00'), // todos los niveles
            fifth: convertToUTC('18:00'),  // alto 
            sixth: convertToUTC('20:00'),   // todos los niveles 
            seventh: convertToUTC('22:00'), // alto 
            dia21Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia20_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };

        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day_20',
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
                    ? "Did you know that vaping exposes users to ultrafine particles that can penetrate deep into the lungs 🌫️🫁?"
                    : "¿Sabías que el vapeo expone a los usuarios a partículas ultrafinas que pueden penetrar profundamente en los pulmones 🌫️🫁?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "🗣️ Vaping can cause dizziness and nausea"
                    : "🗣️El vapeo puede provocar mareos y náuseas."
            }, times.second, 'second');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? `${nombre}, enjoy this special meal! You absolutely deserve it!`
                : `${nombre}, ¡disfruta de esta comida especial! ¡Te la mereces absolutamente!`
        }, times.third, 'third');


        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "No need to keep stating the obvious. Vaping has nothing good about it."
                    : "No hay necesidad de seguir diciendo lo obvio. Vapear no tiene nada bueno."
            }, times.fourth, 'fourth');
        }

        await scheduleMessage({
            senderId,
            type: 'testrep',
            idioma,
        }, times.testrep, 'testrep');


        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping damages your vocal cords 🎤. Your voice might change 😶, and you could lose the ability to speak clearly 🗣️."
                    : "El vapeo daña tus cuerdas vocales 🎤. Tu voz puede cambiar 😶 y podrías perder la capacidad de hablar claramente 🗣️."
            }, times.fifth, 'fifth');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "Congratulations, you've reached the end of our program.\n\nIf you're ready to say good bye we salute you! If not, remember next time will be easier and so on...\n\nThe key is to NEVER QUIT QUITTING.\n\nHere's a 50% off discount for your next 20 day program: DDN50Xz\n\nIf you don't need it, send it to someone who could use the help."
                : "Felicidades, has llegado al final de nuestro programa.\n\nSi estás listo para decir adiós, ¡te saludamos! Si no, recuerda que la próxima vez será más fácil y así sucesivamente...\n\nLa clave es NUNCA DEJAR DE DEJARLO.\n\nAquí tienes un 50% de descuento para tu próximo programa de 20 días: DDN50Xz\n\nSi no lo necesitas, envíalo a alguien que pueda necesitar ayuda."

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
                    ? "You're the best. Let's move forward or restart the program. Up to you."
                    : "Eres el mejor. Sigamos adelante o reiniciemos el programa. Tú decides."
            }, times.seventh, 'seventh');

        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia21', // 🔥 Cambia al siguiente día
        }, times.dia21Transition, 'dia21_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 20 para ${senderId}:`, error);
    }
};

module.exports = dia20;
