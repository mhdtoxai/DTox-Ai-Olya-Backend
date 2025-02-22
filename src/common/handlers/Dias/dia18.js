const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');


const dia18 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

        const plantilla = idioma === 'ingles'
            ? `Hello! 👋 You are closer than ever 🌟. Today, if you decide to vape, do it after 11:30 PM ⏰. Every minute you resist strengthens your will 🏆. Keep moving forward with that determination that makes you unique 🚭. You can do it, legend! 💪`
            : `¡Hola! 👋 Estás más cerca que nunca 🌟. Hoy, si decides vapear, hazlo después de las 11:30 PM ⏰. Cada minuto que resistes fortalece tu voluntad 🏆. Sigue avanzando con esa determinación que te hace único 🚭. ¡Tú puedes, leyenda! 💪`

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
            dia19Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia18_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };



        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day18',
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
                    ? "Did you know that flavored vaping liquids may contain chemical compounds like diacetyl 🧈, which has been linked to obliterative pulmonary disease?"
                    : "¿Sabías que los líquidos de vapeo con sabor pueden contener compuestos químicos como el diacetilo 🧈, que se ha relacionado con la enfermedad pulmonar obliterante?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "🗣️ Vaping can damage the DNA of lung cells."
                    : "🗣️ El vaping puede causar daño al ADN de las células pulmonares."
            }, times.second, 'second');
        }
        
        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ?`Motivational noon for you ${nombre} 'It’s not about being the best. It’s about being better than you were yesterday.' – Anonymous. Every day counts!` 
                :`Mediodía motivacional para tí ${nombre} 'No se trata de ser el mejor. Se trata de ser mejor de lo que eras ayer.' – Anónimo. ¡Cada día cuenta!`

        }, times.third, 'third');


        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping reduces your energy ⚡. You’ll feel tired 🥱 and unmotivated to do anything ⛔."
                    : "El vapeo reduce tu energía ⚡. Te sentirás cansado 🥱 y sin motivación para hacer cualquier cosa ⛔."
            }, times.fourth, 'fourth');
        }


        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping can affect your fertility ⚠️. You might face difficulties conceiving 🚫 and starting a family 👪."
                    : "El vapeo puede afectar tu fertilidad ⚠️. Podrías enfrentar dificultades para concebir 🚫 y formar una familia 👪."
            }, times.fifth, 'fifth');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "Vaping affects your ability to play sports 🏀. You’ll run out of breath 😵 and won’t be able to perform well in your activities 🏋️‍♀️."
                : "El vapeo afecta tu capacidad para hacer deporte 🏀. Te quedarás sin aliento 😵 y no podrás rendir bien en tus actividades deportivas 🏋️‍♀️."
        }, times.sixth, 'sixth');


        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping can affect your mental health 🧠. You might feel more anxious 😟 and depressed 😞, impacting your overall well-being."
                    : "El vapeo puede afectar tu salud mental 🧠. Podrías sentirte más ansioso 😟 y deprimido 😞, afectando tu bienestar general."
            }, times.seventh, 'seventh');
        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia19', // 🔥 Cambia al siguiente día
        }, times.dia19Transition, 'dia19_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 18 para ${senderId}:`, error);
    }
};

module.exports = dia18;
