const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const fuzz = require('fuzzball');
const { faqs, generalDoubtKeywords, synonyms } = require('./faqData'); // Importar los datos

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
    const { idioma, estado } = await getUserInfo(senderId);

    const lowerQuestion = question.toLowerCase();

    // Detectar dudas generales buscando coincidencias parciales con las palabras clave
    const generalDoubtDetected = generalDoubtKeywords.some(keyword =>
      lowerQuestion.includes(keyword)
    );

    if (generalDoubtDetected) {
      const response = idioma === 'ingles'
        ? "Sure! Let me know how I can help you."
        : "¡Claro! Dime en qué te puedo ayudar.";
      await sendMessage(senderId, response);
      return true;
    }

    // Buscar coincidencias exactas y por sinónimos
    let matches = findBestMatch(lowerQuestion, faqs);
    
    // Agregar soporte para sinónimos
    for (const [key, variations] of Object.entries(synonyms)) {
      if (variations.some(variation => lowerQuestion.includes(variation))) {
        matches = findBestMatch(key, faqs);
        break;
      }
    }

    if (matches.length > 0) {
      const bestMatch = matches[0]; // Tomar la mejor coincidencia

      // Verificar si la pregunta contiene más de una palabra para evitar falsos positivos
      const wordCount = lowerQuestion.split(' ').length;

      if (wordCount > 2) { // Ajustar el número mínimo de palabras según sea necesario
        // Verificar si hay coincidencia exacta
        if (bestMatch[1] === 100) {
          const answer = faqs[bestMatch[0]];
          await sendMessage(senderId, answer);
        } else {
          // Manejar respuesta para preguntas alternativas
          const possibleQuestions = matches.map(match => match[0]);
          const clarification = idioma === 'ingles'
            ? `Do you mean "${possibleQuestions[0]}"? If so, the answer is: ${faqs[possibleQuestions[0]]}`
            : `¿Te refieres a "${possibleQuestions[0]}"? Si es así, la respuesta es: ${faqs[possibleQuestions[0]]}`;
          await sendMessage(senderId, clarification);
        }
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error al manejar las preguntas frecuentes:', error);
    return false;
  }
};

module.exports = handleFaq;
