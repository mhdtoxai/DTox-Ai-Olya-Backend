const db = require('../database/firebaseConfig');
const handleReportVape = require('../handlers/Onboarding/handleReportVape'); // Importar la función


const registerTest = async (req, res) => {
  try {
    const { userId, score, testId } = req.body;  // Asegúrate de que testId sea algo como "primeraprueba", "segundaprueba", etc.
    const timestamp = new Date().toISOString();
    const userRef = db.collection('usuarios').doc(userId).collection('testrespiracion').doc(testId);
    await userRef.set({
      score,
      timestamp,
      completado: true  // Campo adicional "completado"

    });
    // Llamar a la función handleTestVape después de guardar el test
    await handleReportVape(userId);
    res.status(201).json({ message: 'Test registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar el test:', error);
    res.status(500).json({ message: 'Error al registrar el test', error });
  }
};

const getTests = async (req, res) => {
  try {
    const { userId } = req.body;
    const testsSnapshot = await db.collection('usuarios').doc(userId).collection('testrespiracion').get();
    if (testsSnapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron tests' });
    }

    const tests = [];
    testsSnapshot.forEach(doc => {
      tests.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(tests);
  } catch (error) {
    console.error('Error al obtener los tests:', error);
    res.status(500).json({ message: 'Error al obtener los tests', error });
  }
};


const getTestCount = async (req, res) => {
  try {
    const { userId } = req.body;
    const testsSnapshot = await db.collection('usuarios').doc(userId).collection('testrespiracion').get();
    const testCount = testsSnapshot.size;  // Obtener el número de documentos en la colección
    res.status(200).json({ testCount });
  } catch (error) {
    console.error('Error al obtener el número de pruebas:', error);
    res.status(500).json({ message: 'Error al obtener el número de pruebas', error });
  }
};

module.exports = {
  registerTest,
  getTests,
  getTestCount
};