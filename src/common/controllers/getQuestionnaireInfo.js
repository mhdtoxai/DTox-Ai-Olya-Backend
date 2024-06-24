const db = require('../database/firebaseConfig');

const getOnboardingData = async (req, res) => {
  const { senderId } = req.body; // Aquí se espera que senderId esté en el cuerpo de la solicitud

  try {
    if (!senderId) {
      return res.status(400).send('El senderId es requerido en el cuerpo de la solicitud');
    }

    // Acceder al documento 'onboarding' para el senderId especificado
    const docRef = db.collection('usuarios').doc(senderId).collection('cuestionario').doc('onboarding');
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send('No se encontró el documento de onboarding para el usuario');
    }

    // Obtener todos los datos del documento
    const data = doc.data();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener los datos de onboarding:', error);
    res.status(500).send('Error al obtener los datos de onboarding');
  }
};

module.exports = getOnboardingData;