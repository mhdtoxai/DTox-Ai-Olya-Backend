const db = require('../database/firebaseConfig');
const testOpFinhandle = require('../handlers/Dias/testOpFinhandle');

// Función para guardar preguntas en la colección 'opiniones'
const saveOpinionsQuestion = async (req, res) => {
  const { formId, idioma, preguntas } = req.body;

  // Validación de la entrada
  if (!formId || !idioma || !Array.isArray(preguntas)) {
    return res.status(400).send('Datos de entrada inválidos');
  }

  try {
    // Referencia al documento del formulario en la colección correspondiente
    const formRef = db.collection('cuestionarios').doc(formId).collection('idioma').doc(idioma);

    // Crear un batch para realizar operaciones en lote
    const batch = db.batch();

    // Iterar sobre las preguntas y añadirlas al batch
    preguntas.forEach((question) => {
      const preguntaRef = formRef.collection('preguntas').doc(question.id);
      batch.set(preguntaRef, {
        texto: question.text,
        opciones: question.opciones,
        tipo: question.tipo
      });
    });

    // Ejecutar el batch para guardar las preguntas
    await batch.commit();

    // Responder con éxito
    res.status(200).send('Preguntas guardadas exitosamente en opiniones!');
  } catch (error) {
    console.error('Error guardando preguntas en opiniones:', error);
    res.status(500).send('Error de servidor interno');
  }
};



// Función para obtener el formulario desde la base de datos
const getOpinions = async (req, res) => {
  const { formId, language } = req.params;

  // Validación de la entrada
  if (!formId || !language) {
    return res.status(400).send('Datos de entrada inválidos'); // Enviar error si los datos de entrada son inválidos
  }

  try {
    // Referencia al documento del formulario en la colección correspondiente
    const formRef = db.collection('cuestionarios').doc(formId).collection('idioma').doc(language);

    // Obtener la colección de preguntas
    const preguntasSnapshot = await formRef.collection('preguntas').get();

    // Verificar si no se encontraron preguntas
    if (preguntasSnapshot.empty) {
      return res.status(404).send('No se encontraron preguntas'); // Enviar error si no se encontraron preguntas
    }

    // Crear un array para almacenar las preguntas
    const preguntas = [];
    preguntasSnapshot.forEach(doc => {
      const data = doc.data();
      preguntas.push({
        id: doc.id,
        texto: data.texto,
        opciones: data.opciones,  // Incluir las opciones en la respuesta
        tipo: data.tipo // Incluir el tipo de pregunta en la respuesta

      });
    });

    // Enviar las preguntas como respuesta en formato JSON
    res.status(200).json({ preguntas });
  } catch (error) {
    console.error('Error al obtener el formulario:', error); // Registrar el error en la consola
    res.status(500).send('Error de servidor interno'); // Enviar error de servidor al cliente
  }
};


// Función para guardar las respuestas del cuestionario en un único documento por envío
const saveResponsesgOpinions = async (req, res) => {
  const { userId, respuestas } = req.body;

  // Validación de la entrada
  if (!userId || !respuestas || !Array.isArray(respuestas)) {
    return res.status(400).send('Datos de entrada inválidos'); // Enviar error si los datos de entrada son inválidos
  }

  try {
    const collectionRef = db.collection(`opiniones/${userId}/cuestionario`);

    // Generar un ID automático para el envío
    const docRef = collectionRef.doc(); // Firestore genera un ID único para el documento

    // Crear el documento con todas las respuestas
    const dataToSave = {
      respuestas: respuestas, // Todas las respuestas en un solo arreglo
      completado: true,       // Marca de completado
      timestamp: new Date(),  // Marca de tiempo del envío
    };

    // Guardar el documento
    await docRef.set(dataToSave);
    // Llamar a la función testOpFinhandle para enviar el mensaje de finalización
    await testOpFinhandle(userId);
    // Enviar una respuesta de éxito al cliente
    res.status(200).send('Respuestas del cuestionario guardadas con éxito!');
  } catch (error) {
    console.error('Error guardando respuestas del cuestionario:', error); // Registrar el error en la consola

    // Enviar un mensaje de error detallado al cliente
    res.status(500).send(`Error al guardar respuestas del cuestionario: ${error.message}`);
  }
};


module.exports = {
  saveOpinionsQuestion,
  getOpinions,
  saveResponsesgOpinions

};
