
const { synonyms } = require('./synonyms');
const { faqs } = require('./faqs');


  
  // Lista de palabras clave para detectar dudas generales
  const generalDoubtKeywords = [
    'duda', 'dudas', 'pregunta', 'preguntas', 'question', 'questions'
  ];
  

  // Palabras clave típicas de preguntas
const questionKeywords = [
  'que', 'como', 'cuanto', 'quien', 'cual', 'cuanto',  'hay', 'puedo', 
  'what', 'how', 'when', 'can', 'is', 'does', 'should'
];


// Function to remove accents for consistent matching
const removeAccents = (text) => {
  const accents = 'ÁÉÍÓÚÜÑáéíóúüñ';
  const noAccents = 'AEIOUUÑaeiouuñ';
  return text.split('').map(char => {
      const index = accents.indexOf(char);
      return index === -1 ? char : noAccents[index];
  }).join('');
};

  
 module.exports = { faqs, generalDoubtKeywords, synonyms, questionKeywords, removeAccents };
  