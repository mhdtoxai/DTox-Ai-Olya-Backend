const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const handleCompromise = require('./handleCompromise');


const handleUserSelectionMode = async (senderId, selectedLevel) => {
    try {
        // Obtener la información del usuario incluyendo el nombre y idioma
        const { idioma, estado, nombre } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);


        // Listas de niveles válidos
        const validLevelsEnglish = ['high', 'medium', 'low'];
        const validLevelsSpanish = ['alto', 'medio', 'bajo'];

        // Convertir el nivel seleccionado a minúsculas
        const lowerCaseLevel = selectedLevel.toLowerCase();

        // Verificar si el nivel seleccionado es válido
        const isValidLevel = idioma === 'ingles'
            ? validLevelsEnglish.includes(lowerCaseLevel)
            : validLevelsSpanish.includes(lowerCaseLevel);

        if (!isValidLevel) {
            const errorMessage = idioma === 'ingles'
                ? 'Please choose a valid level from the options provided.'
                : 'Por favor elige un nivel válido de las opciones proporcionadas.';
            await sendMessage(senderId, errorMessage);

            // Volver a enviar las tarjetas
            const buttons = idioma === 'ingles'
                ? [
                    { id: 'high', title: 'High' },
                    { id: 'medium', title: 'Medium' },
                    { id: 'low', title: 'Low' }
                ]
                : [
                    { id: 'alto', title: 'Alto' },
                    { id: 'medio', title: 'Medio' },
                    { id: 'bajo', title: 'Bajo' }
                ];

            const message = idioma === 'ingles'
                ? 'Please select the message intensity level according to your needs. You can adjust it later.'
                : 'Por favor selecciona el nivel de intensidad de mensajes de acuerdo a tus necesidades. Lo puedes ajustar más adelante.';

            await sendMessageTarget(senderId, message, buttons);
            return;
        }

        // Actualizar el nivel seleccionado en la base de datos y el estado del usuario
        await userService.updateUser(senderId, { nivel: lowerCaseLevel, estado: 'confirmarcompromiso' });
        userContext[senderId].nivel = lowerCaseLevel;
        userContext[senderId].estado = 'confirmarcompromiso';

        // Enviar un mensaje de confirmación al usuario
        const confirmationMessage = idioma === 'ingles'
            ? `You have selected the ${lowerCaseLevel} level. Sounds good! Everything is set up for the moment.`
            : `Has seleccionado el nivel ${lowerCaseLevel}. ¡Suena bien! Todo está configurado por el momento.`;

        const additionalMessage1 = idioma === 'ingles'
            ? 'The method we will use is to reduce the consumption window. Tomorrow you will take the vape as late as you can.'
            : 'El método que utilizaremos será reduciendo la ventana de consumo. Mañana tomarás el vape lo más tarde que puedas.';

        const additionalMessage2 = idioma === 'ingles'
            ? 'Or at least, one hour later than you usually do. At the moment of your first craving of the day, follow these steps:\n\n1️⃣ Take your device and observe it.\n2️⃣ Let it know that even though it is there, you will not use it until in an hour.\n3️⃣ Do not hate or curse it, just say: see you soon.\n4️⃣ Leave it in the same place, do not take it with you or if you go out, store it somewhere (not in sight).'
            : 'O por lo menos, una hora más tarde de lo que normalmente lo haces. Al momento de tu primer antojo del día, sigue los siguientes pasos:\n\n1️⃣ Toma tu dispositivo y obsérvalo.\n2️⃣ Hazle saber que aún estando ahí, no lo consumirás hasta dentro de una hora.\n3️⃣ No lo odies ni maldigas, simplemente dile: nos vemos pronto.\n4️⃣ Déjalo en ese mismo lugar, no lo lleves contigo o si vas a salir, guárdalo en cualquier lado (no a la vista).';

        const additionalMessage3 = idioma === 'ingles'
            ? 'Does it all make sense? It’s very simple and will help you realize you can manage without it. Even having it within reach.'
            : '¿Queda claro lo que debes hacer? Es muy sencillo y te ayudará a darte cuenta que puedes sin él. Aún teniéndolo a tu alcance.';

        const additionalMessage4 = idioma === 'ingles'
            ? 'I will support you, and tomorrow I will remind you of your commitment when you wake up.'
            : 'Yo te apoyaré, mañana te recordaré sobre tu compromiso cuando despiertes.';

        await sendMessage(senderId, confirmationMessage);
        await delay(2000);
        await sendMessage(senderId, additionalMessage1);
        await delay(2000);
        await sendMessage(senderId, additionalMessage2);
        await delay(3000);
        await sendMessage(senderId, additionalMessage3);
        await delay(2000);
        await sendMessage(senderId, additionalMessage4);
        await delay(2000);
    // Llamar a la función para manejar el estado 'consentimientoaceptado'
    await handleCompromise(senderId);


    } catch (error) {
        console.error('Error al manejar la respuesta del usuario:', error);
    }
    // Imprimir todo el contexto del usuario en la consola
    console.log(`Contexto del usuario ${senderId} después de seleccionar nivel:`, userContext[senderId]);
};
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleUserSelectionMode;
