const { removeAccents } = require('../faqs/faqData'); // Importar removeAccents si es necesario

const { insultWords } = require('./insultWords'); // Importar removeAccents si es necesario


// Función para detectar insultos en un texto
const containsInsult = (text) => {
  const lowerText = removeAccents(text.toLowerCase());  // Usar la función existente

  // Dividir el texto en palabras usando una expresión regular para eliminar puntuaciones y múltipes espacios
  const words = lowerText.match(/\b(\w+)\b/g);

  // Combinar las palabras para buscar frases como "fuck off"
  const combinedText = words.join(' ');

  // Verificar si alguna de las palabras clave en español o inglés está presente en el texto
  const insultFound = insultWords.spanish.some(insult => combinedText.includes(removeAccents(insult))) ||
    insultWords.english.some(insult => combinedText.includes(removeAccents(insult)));

  return insultFound;
};

module.exports = containsInsult;
