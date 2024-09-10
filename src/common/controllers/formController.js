const db = require('../database/firebaseConfig');
const  handleQuestCompleted  = require('../handlers/Onboarding/handleQuestCompleted');
// Función para guardar el formulario en la base de datos
const saveForm = async (req, res) => {
  const { formId, idioma, preguntas } = req.body;

  // Validación de la entrada
  if (!formId || !idioma || !Array.isArray(preguntas)) {
    return res.status(400).send('Datos de entrada inválidos'); // Enviar error si los datos de entrada son inválidos
  }

  try {
    // Referencia al documento del formulario en la colección correspondiente
    const formRef = db.collection('cuestionarios').doc(formId).collection('idioma').doc(idioma);

    // Crear un batch para ejecutar múltiples operaciones como una sola transacción
    const batch = db.batch();

    // Iterar sobre cada pregunta y agregarla al batch
    preguntas.forEach((question) => {
      const questionRef = formRef.collection('preguntas').doc(question.id);
      batch.set(questionRef, {
        texto: question.text,
        opciones: question.opciones,  // Añadir las opciones de la pregunta
        tipo: question.tipo // Agregar el tipo de pregunta al documento
      });
    });

    // Ejecutar el batch para guardar todas las preguntas
    await batch.commit();

    // Enviar una respuesta de éxito al cliente
    res.status(200).send('Formulario guardado con éxito!');
  } catch (error) {
    console.error('Error guardando formulario:', error); // Registrar el error en la consola
    res.status(500).send('Error de servidor interno'); // Enviar error de servidor al cliente
  }
};

// Función para obtener el formulario desde la base de datos
const getForm = async (req, res) => {
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

// Función para guardar las respuestas del cuestionario en la base de datos
const saveResponses = async (req, res) => {
  const { userId, respuestas } = req.body;

  // Validación de la entrada
  if (!userId || !respuestas || !Array.isArray(respuestas)) {
    return res.status(400).send('Datos de entrada inválidos'); // Enviar error si los datos de entrada son inválidos
  }

  try {
    // Referencia al documento del cuestionario en la colección 'usuarios/{userId}/cuestionario/onboarding'
    const questionnaireRef = db.collection(`usuarios/${userId}/cuestionario`).doc('onboarding');

    // Guardar las respuestas en el documento del cuestionario
    await questionnaireRef.set({
      respuestas: respuestas,
      completado: true },
      { merge: true }); 


    // Llamar a la función handleQuestionnaireCompleted después de guardar las respuestas
    await handleQuestCompleted(userId);

    // Enviar una respuesta de éxito al cliente
    res.status(200).send('Respuestas del cuestionario guardadas con éxito!');
  } catch (error) {
    console.error('Error guardando respuestas del cuestionario:', error); // Registrar el error en la consola

    // Enviar un mensaje de error detallado al cliente
    res.status(500).send(`Error al guardar respuestas del cuestionario: ${error.message}`);
  }
};

module.exports = {
  saveForm,
  getForm,
  saveResponses,
};

