const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia2 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

        const audioUrl = idioma === 'ingles'
            ? 'https://drive.google.com/uc?export=download&id=1r9u5OdFrAQGN7MeyKjvU09MteR1RZ_g5'
            : 'https://drive.google.com/uc?export=download&id=1ONRFS3ofK7UsoB3w_2N4dXFy8N7EEu4w';

        const plantilla = idioma === 'ingles'
            ? `Today is the day! What day? Day 3️⃣ of the program. Get ready, you’ve already seen that you can do this! Let’s hold out until 1 PM without vaping 💪💪💪💪💪.\n\nYou’re not alone! Today, 6️⃣,2️⃣2️⃣8️⃣ other people are also on Day 3. It’s a great challenge, and remember, when a craving hits, just say CRAVING and we’ll get through it together. LET’S GO! 🚀`
            : `¡Es hoy es hoy! ¿Qué es hoy? El día 3️⃣ del programa. ¡Ármate de valor, ya viste que sí puedes! Aguantemos hasta la 1PM sin vape 💪💪💪💪💪.\n\n¡No estás solo! El día de hoy 6️⃣,2️⃣2️⃣8️⃣ personas más están también en el día 3. Es un buen reto, recuerda que cuando tengas un antojo solo deberás decir ANTOJO y lo superamos juntos. ¡VAMOS! 🚀`;


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
            dia3Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia2_${eventName}_${timestamp}`;
          
            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
          };
          


        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day2',
            languageCode: idioma === 'ingles'
                ? 'en_US'
                : 'es_MX',
        }, times.morning, 'morning');


        // Mensajes dependiendo del nivel
        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Repeat after me: HAKUNA MATATA 🦁 ... 😝\n Okay, maybe better to say:: No vape no vape NO vape NO VAPE"
                    : "Repite conmigo: HAKUNA MATATA 🦁 ... 😝\n Bueno, mejor repite: No vape no vape NO vape NO VAPE"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? `Vaping can affect kidney function. I don't know about you ${nombre} but if vaping might lead to dialysis or a kidney transplant, I’d rather quit.`
                    : `El vaping puede afectar la función renal. No se tú ${nombre} pero si por vapear me van a tener que dializar o buscarme un trasplante de riñon mejor lo dejo.`
            }, times.second, 'second');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? `Hey ${nombre}, how's it going?`
                : `Que onda ${nombre}? Cómo vas?`
        }, times.third, 'third');


        await scheduleMessage({
            senderId,
            type: 'audio',
            audioUrl: audioUrl,
        }, times.third, 'third_Audio');


        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Here’s a tip: keep a bag of peanuts handy and swap the habit of grabbing your vape with grabbing a peanut. This is called reward substitution. It might sound silly, but after 21 days of doing it, you’ll have forgotten all about vaping."
                    : "Te paso un tip: ten a la mano una bolsa de cacahuates y transfiere el hábito de agarrar el vape por agarrar un cacahuate. Se conoce como transferencia de recompensa. Igual y te parece ridículo, pero tras 21 días de hacerlo te habrás olvidado del vapeo."
            }, times.fourth, 'fourth');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Don’t think about vaping. Take a 10-minute walk instead."
                    : "No estés pensando en vapear. Sal a caminar 10 minutos."
            }, times.fifth, 'fifth');
        }



        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? `It's almost time to sleep and relax 🧘. I want to congratulate you, ${nombre}, for your effort today.\nRest up ⚡️ because tomorrow we’re cutting your vaping window by an hour ⏰.\nTomorrow, you can only vape from 1 PM to 11:59 PM.\nNO VAPING IN THE MORNING! I’ll be watching you 👀`
                : `Casi hora de dormir y relajarse 🧘.\nTe felicito ${nombre} por tu esfuerzo de hoy.\nA recargar pilas ⚡️ que mañana cortamos la ventana de vapeo a una hora ⏰.\nMañana solo podrás vapear de 1PM a 11:59PM.\n¡NADA DE VAPEO EN LA MAÑANA! Te estaré observando 👀`
        }, times.sixth, 'sixth');



        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Close your eyes and repeat: Tomorrow, I won’t vape before 1 PM. I’m with you!"
                    : "Cierra los ojos y repite: Mañana no vapearé antes de la 1 PM. ¡Estoy contigo!"
            }, times.seventh, 'seventh');

        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia3', // 🔥 Cambia al siguiente día
            plantilla: plantilla,
        }, times.dia3Transition, 'dia3_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 2 para ${senderId}:`, error);
    }
};

module.exports = dia2;
