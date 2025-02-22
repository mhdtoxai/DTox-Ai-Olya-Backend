const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');


const dia17 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

        const plantilla = idioma === 'ingles'
            ? `Getting here is not for everyone: only legends achieve it 💪. Today, your mission is clear: if you decide to vape, do it after 11:00 PM. Every minute you win is a victory for your health 🚭. Can! 🌟`
            : `Llegar hasta aquí no es para cualquiera: sólo las leyendas lo logran 💪. Hoy, tu misión es clara: si decides vapear, hazlo después de las 11:00 PM. Cada minuto que ganas es una victoria para tu salud 🚭. ¡Tú puedes! 🌟`

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
            dia18Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia17_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };



        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day17',
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
                    ? "Did you know that vaping can increase the likelihood of developing lipoid pneumonia 🫀, a serious lung disease?"
                    : "¿Sabías que el vapeo puede aumentar la probabilidad de sufrir neumonía lipoidea 🫀, una enfermedad pulmonar grave?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "🗣️ Vaping can cause chronic cough."
                    : "🗣️ Vapear puede causar tos crónica."
            }, times.second, 'second');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? `${nombre}, before eating, remember: 'Success is not final, failure is not fatal: it is the courage to continue that counts.' – Winston Churchill. Keep going with courage!`
                : `${nombre}, antes de comer, recuerda: 'El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el coraje para continuar.' – Winston Churchill. ¡Sigue con valentía!`

        }, times.third, 'third');


        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping affects your mental health 🧠. You might feel more anxious 😟 and depressed 😞, impacting your overall well-being."
                    : "Vapear afecta tu salud mental 🧠. Podrías sentirte más ansioso 😟 y deprimido 😞, afectando tu bienestar general."
            }, times.fourth, 'fourth');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping can cause sleep problems 🛏️. You’ll wake up exhausted 🥱 and find it hard to get a good rest 🌙."
                    : "El vapeo puede causar problemas de sueño 🛏️. Te despertarás agotado 🥱 y será difícil descansar bien 🌙."
            }, times.fifth, 'fifth');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "Rest well tonight. Keep moving forward with confidence and determination. You’re doing a fantastic job!"
                : "Que descanses bien esta noche. Sigue adelante con confianza y determinación. ¡Estás haciendo un trabajo fantástico!"
        }, times.sixth, 'sixth');

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping weakens your immune system 🛡️. You’ll be more vulnerable to illnesses 🤒 and get sick more often 😷."
                    : "Vapear daña tu sistema inmunológico 🛡️. Serás más vulnerable a las enfermedades 🤒 y te enfermarás más a menudo 😷."
            }, times.seventh, 'seventh');

        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia18', // 🔥 Cambia al siguiente día
        }, times.dia18Transition, 'dia18_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 17 para ${senderId}:`, error);
    }
};

module.exports = dia17;
