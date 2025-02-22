const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia10 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

        const imageUrl = idioma === 'ingles' ?
            'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Ingles%2FMedal4_Eng.png?alt=media&token=7d92fa37-3b4b-48e7-805f-26de99ca987d' : // Reemplaza con el enlace de la imagen en inglés
            'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Espa%C3%B1ol%2FINSIGNIAS_04_Esp.png?alt=media&token=0b1af581-f261-45d1-a100-e8464cd7cec7'; // Reemplaza con el enlace de la imagen en español

        const plantilla = idioma === 'ingles'
            ? `Good morning! ☀️ Remember that every day without vaping 🚭 is an achievement 🏅. Keep it up, you can do it! 💪😊 Today the possibility opens AFTER 7️⃣ PM. Don't forget it!`
            : `¡Buenos días! ☀️ Recuerda que cada día sin vapeo 🚭 es un logro 🏅. Sigue así, ¡tú puedes hacerlo! 💪😊 Hoy se abre la posibilidad DESPUÉS DE LAS 7️⃣ PM. ¡No lo olvides!`

        // 🔹 Construcción de URL única para test
        const testUrl = `https://olya.club/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=3&language=${idioma}`;

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
            dia11Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia10_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };



        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day10',
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
                    ? "Did you know that teens who vape are more likely to start smoking regular cigarettes later 📅📅?"
                    : "¿Sabías que los adolescentes que vapean tienen más probabilidades de comenzar a fumar cigarrillos convencionales más tarde 📅📅?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ?"🗣️ Vaping can worsen asthma."
                    :"🗣️ Vapear puede empeorar el asma."
            }, times.second, 'second');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ?`${nombre}, before eating, remember: 'Perseverance is not a long race; it is many short races one after the other.' – Walter Elliot. You got this!`
                :`${nombre}, antes de comer, ten en mente: 'La perseverancia no es una carrera larga; son muchas carreras cortas una tras otra.' – Walter Elliot. ¡Tú puedes!`
        }, times.third, 'third');



        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ?"Did you know that vaping can reduce the body's ability to repair damaged DNA 🧫🧬?"
                    :"¿Sabías que el vapeo puede disminuir la capacidad del cuerpo para reparar el ADN dañado 🧫🧬?"
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
                    ? "If you vape, you are likely to be unable to exercise 🏋️‍♂️. You will gain weight 🍔, get sick 🤒, and potentially face premature death."
                    : "Si vapeas, es probable que no puedas hacer ejercicio 🏋️‍♂️. Engordarás 🍔, podrás enfermarte 🤒 y morir prematuramente."
            }, times.fifth, 'fifth');
        }

        await scheduleMessage({
            senderId,
            type: 'checktest',
            testId:'3',
            message: idioma === 'ingles'
                ? `💨 Your Lung Retention Test is still pending. Clic here to do it:: ${testUrl}`
                : `💨 Aún tienes pendiente tu prueba de retención pulmonar! Da clic aquí: ${testUrl}`
        }, times.RecUrl, 'RecUrl');


        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "Have a great night. Remember that each day without vaping is a victory. Here’s the Willpower Trophy for you!"
                : "Que tengas una excelente noche. Recuerda que cada día sin vapeo es una victoria. ¡Te presentamos el Trofeo de Voluntad!"

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
                    ? "Vaping can cause infertility 🚫. Your ability to start a family 👪 could be compromised 🛑."
                    : "El vapeo puede causar infertilidad 🚫. La posibilidad de formar una familia 👪 se verá comprometida 🛑."
            }, times.seventh, 'seventh');

        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia11', // 🔥 Cambia al siguiente día
        }, times.dia11Transition, 'dia11_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 10 para ${senderId}:`, error);
    }
};

module.exports = dia10;
