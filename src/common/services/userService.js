const db = require('../database/firebaseConfig');

exports.getUser = (userId) => {
  return db.collection('usuarios').doc(userId).get();
};

exports.createUser = (userId) => {
  return db.collection('usuarios').doc(userId).set({
    estado: 'idiomaseleccionado',
    idioma: null
  });
};

exports.updateUser = (userId, data) => {
  return db.collection('usuarios').doc(userId).update(data);
};

exports.getUsersByState = async (estado, batchSize, startAfter) => {
  try {
    let query = db.collection('usuarios')
      .where('estado', '==', estado)
      .limit(batchSize);

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const usersSnapshot = await query.get();
    return usersSnapshot;
  } catch (error) {
    console.error('Error al obtener usuarios por estado:', error);
    throw error;
  }
};