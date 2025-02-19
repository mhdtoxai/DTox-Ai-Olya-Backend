const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia12 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);


        const plantilla = idioma === 'ingles'
            ? `Hello! 👋 I hope you have a great day 🌞. Don't forget to celebrate 🎉 every small step you take towards stopping vaping 🚭.Today's challenge: Vape until 8:30 PM. You've already done it, you can`
            : `¡Hola! 👋 Espero que tengas un excelente día 🌞. No olvides celebrar 🎉 cada pequeño paso que das hacia dejar de vapear 🚭.Reto de hoy: Vapear hasta las 8:30 PM. Ya lo has hecho, tu puedes`


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
            dia13Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia12_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };



        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day_12',
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
                    ? "Did you know that vaping can cause irritation and damage to your gums and mouth tissue 🦷👄?"
                    : "¿Sabías que el vapeo puede causar irritación y daño a las encías y al tejido bucal 🦷👄?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "🗣️ Vape liquids can contain heavy metals"
                    : "🗣️ Los líquidos de vapeo pueden contener metales pesados."
            }, times.second, 'second');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ?`${nombre}! lunchtime motivation: 'You don’t have to be perfect to achieve it, just persistent.' – Anonymous. Keep it up!"`
                :`${nombre}! Es hora de un almuerzo motivacional: 'No tienes que ser perfecto para lograrlo, solo persistente.' – Anónimo. ¡Sigue así!"`
        }, times.third, 'third');


        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ?"Vaping could lead to the development of heart diseases ❤️. You’ll suffer from chest pains 💔 and could be at risk of a heart attack ⚠️."
                    :"Vapear podría llevarte a desarrollar enfermedades cardíacas ❤️. Sufrirás dolores en el pecho 💔 y podrías tener un ataque cardíaco ⚠️."
            }, times.fourth, 'fourth');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping affects your ability to concentrate 📉. You’ll find it hard to focus 📚 and perform in your daily activities 🗓️."
                    : "Vapear afecta tu capacidad de concentración 📉. Te resultará difícil enfocarte 📚 y rendir en tus actividades diarias 🗓️."
            }, times.fifth, 'fifth');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "Rest well tonight. Your strength and determination are inspiring. Tomorrow will be a new day to continue your progress!"
                : "Descansa bien esta noche. Tu fuerza y determinación son inspiradoras. ¡Mañana será un nuevo día para continuar el progreso!"
        }, times.sixth, 'sixth');

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping can lead to chronic illnesses 🌡️. You will experience constant discomfort 🤢 and will need frequent medical treatment 💊."
                    : "El vapeo puede llevarte a desarrollar enfermedades crónicas 🌡️. Vivirás con malestar constante 🤢 y necesitarás tratamiento médico frecuente 💊."
            }, times.seventh, 'seventh');

        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia13', // 🔥 Cambia al siguiente día
        }, times.dia13Transition, 'dia13_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 12 para ${senderId}:`, error);
    }
};

module.exports = dia12;
