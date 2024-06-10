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
