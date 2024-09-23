const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const fuzz = require('fuzzball');
const { faqs, generalDoubtKeywords, synonyms, questionKeywords, removeAccents } = require('./faqs/faqData'); // Importar los datos

const findBestMatch = (question, faqs) => {
  // Opciones para la búsqueda con fuzzball
  const options = {
    scorer: fuzz.token_set_ratio,
    limit: 3 // Ajustar el límite para manejar posibles respuestas cercanas
  };

  const matches = fuzz.extract(question, Object.keys(faqs), options);
  return matches.filter(match => match[1] > 60); // Ajustar el umbral según sea necesario
};

const handleFaq = async (senderId, question) => {
  try {
    // Obtener la información del usuario incluyendo el idioma
    const { idioma } = await getUserInfo(senderId);

    const lowerQuestion = removeAccents(question.toLowerCase());

    // Verificar si el mensaje parece una pregunta buscando palabras clave
    const isQuestion = questionKeywords.some(keyword => lowerQuestion.includes(removeAccents(keyword)));

    // Detectar dudas generales buscando coincidencias parciales con las palabras clave
    const generalDoubtDetected = generalDoubtKeywords.some(keyword =>
      lowerQuestion.includes(removeAccents(keyword))
    );

    // Si se detecta una duda general, responder con el mensaje adecuado
    if (generalDoubtDetected) {
      const response = idioma === 'ingles'
        ? "Sure! Let me know how I can help you."
        : "¡Claro! Dime en qué te puedo ayudar.";
      await sendMessage(senderId, response);
      return true;
    }

    // Si no parece una pregunta, no proceder con la búsqueda
    if (!isQuestion) {
      return false;
    }

    // Buscar coincidencias exactas y por sinónimos
    let matches = findBestMatch(lowerQuestion, faqs);

    // Agregar soporte para sinónimos
    for (const [key, variations] of Object.entries(synonyms)) {
      if (variations.some(variation => lowerQuestion.includes(removeAccents(variation)))) {
        matches = findBestMatch(key, faqs);
        break;
      }
    }

    if (matches.length > 0) {
      const bestMatch = matches[0]; // Tomar la mejor coincidencia

      // Verificar si la pregunta contiene más de una palabra para evitar falsos positivos
      const wordCount = lowerQuestion.split(' ').length;

      if (wordCount > 1) {  // Aceptar preguntas con más de 1 palabra
        if (bestMatch[1] >= 95) {  // Aceptar coincidencias cercanas al 100%
          const answer = faqs[bestMatch[0]];
          await sendMessage(senderId, answer);
        } else {
          // Lógica de aclaración
          const possibleQuestions = matches.length > 0 ? matches.map(match => match[0]) : [];
          if (possibleQuestions.length > 0) {
            const clarification = idioma === 'ingles'
              ? `Do you mean "${possibleQuestions[0]}" : ${faqs[possibleQuestions[0]]}`
              : `¿Te refieres a "${possibleQuestions[0]}" : ${faqs[possibleQuestions[0]]}`;
            await sendMessage(senderId, clarification);
          }
        }
        return true;
      }
      
    }

    // Si no se encontró ninguna coincidencia, enviar el mensaje de "no entiendo"
    const response = idioma === 'ingles'
      ? "Oops! I didn't get that. Can you be more specific on what you're looking for?"
      : "Ooops! No te entiendo, ¿me puedes especificar lo que buscas?";
    await sendMessage(senderId, response);
    return false;

  } catch (error) {
    console.error('Error al manejar las preguntas frecuentes:', error);
    return false;
  }
};

module.exports = handleFaq;
