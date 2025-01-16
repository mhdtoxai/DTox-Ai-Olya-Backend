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

// Obtiene un código por su valor para verificar su existencia
exports.getCode = (userCode) => {
  return db.collection('codigos').doc(userCode).get();
};

// Guarda un código único asociado a un usuario
exports.saveCode = (userCode, userId) => {
  return db.collection('codigos').doc(userCode).set({
    userId: userId
  });
};

// Guarda el uso del cupón, registrando el userId y la fecha
exports.saveCouponUsage = (userCode, checkoutSession,userId) => {
  return db.collection('codigos')
    .doc(userCode)
    .collection('referidos')
    .add({
      userId:userId,
      checkoutSession: checkoutSession,  // ID de la sesión de checkout
      fecha: new Date()  // Fecha del uso
    });
};


// Obtiene un código por el userId para verificar si ya está asignado a un usuario
exports.getCodeByUserId = (userId) => {
  return db.collection('codigos').where('userId', '==', userId).limit(1).get();
};