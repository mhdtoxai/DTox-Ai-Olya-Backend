const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');


const dia16 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

        const plantilla = idioma === 'ingles'
            ? `Welcome to the area of ​​champions, from this moment on is when legends are forged. They will be the 5 most important days of the program.You should not vape at any time, however if you decide to give into temptation, and after having asked me for help with your cravings, you can only do so after 10:30 PM .We will focus on controlling the mind before sleeping. Enjoy your day, we'll talk at night.`
            : `Bienvenido al área de los campeones, a partir de este momento es cuando las leyendas se forjan. Serán los 5 días más importantes del programa.No debes vapear a ninguna hora, sin embargo si decides caer en la tentación, y después de haberme pedido ayuda con los antojos, sólo podrás hacerlo después de las 10:30 PM.Nos concentraremos en controlar la mente antes de dormir. Disfruta tu día, hablamos en la noche.`

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
            dia17Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia16_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };



        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day16',
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
                    ? "Did you know that vaping during pregnancy 🤰 can negatively affect fetal development 👶 and increase the risk of premature birth?"
                    : "¿Sabías que el vapeo durante el embarazo 🤰 puede afectar negativamente el desarrollo del feto 👶 y aumentar el riesgo de parto prematuro?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "🗣️ Vaping can negatively affect mental health."
                    : "🗣️ El vapeo puede afectar negativamente la salud mental."
            }, times.second, 'second');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? `${nombre}, midday reminder: 'Strength doesn’t come from physical capacity, it comes from an indomitable will.' – Mahatma Gandhi. ¡You are strong!`
                : `${nombre}, a medio día, ten presente: 'La fuerza no proviene de la capacidad física, sino de una voluntad indomable.' – Mahatma Gandhi. ¡Tú eres fuerte!`
        }, times.third, 'third');


        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping can weaken your immune system 🛡️. You’ll be more vulnerable to illnesses 🤒 and get sick more often 😷."
                    : "El vapeo puede afectar tu sistema inmunológico 🛡️. Serás más vulnerable a las enfermedades 🤒 y te enfermarás más a menudo 😷."
            }, times.fourth, 'fourth');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping affects your blood circulation 💉. You’ll feel cold in your extremities ❄️ and have less physical stamina 🏃."
                    : "Vapear afecta tu circulación sanguínea 💉. Sentirás frío en las extremidades ❄️ y tendrás menos resistencia física 🏃."
            }, times.fifth, 'fifth');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "How is your day going so far? Tell me what your feelings have been on this trip."
                : "¿Cómo va tu día hasta el momento? Platícame cuáles ha sido tu sentir en este viaje."
        }, times.sixth, 'sixth');

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping can lead to lung cancer 🧬. The risk is high 🚫, and the treatment can be painful 💊."
                    : "El vapeo puede provocar cáncer de pulmón 🧬. El riesgo es alto 🚫 y el tratamiento puede ser doloroso 💊."
            }, times.seventh, 'seventh');

        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia17', // 🔥 Cambia al siguiente día
        }, times.dia17Transition, 'dia17_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 16 para ${senderId}:`, error);
    }
};

module.exports = dia16;
