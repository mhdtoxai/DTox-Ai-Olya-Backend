const db = require('../database/firebaseConfig');

// Obtener el usuario por ID (documento)
const getUser = async (userId) => {
  try {
    const userDoc = await db.collection('usuarios').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('Usuario no encontrado');
    }
    return userDoc.data();
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw error;
  }
};

const createBackup = async (userId, userData) => {
  try {
    // Generar un ID único usando el método 'doc()' sin argumentos
    const backupRef = db.collection('backup_usuarios').doc(userId).collection('backups').doc();

    // Crear un nuevo documento en la subcolección 'backups' dentro del documento 'backup_usuarios/{userId}'
    await backupRef.set({
      ...userData,
      backupTimestamp: new Date().toISOString(), // Guardar la fecha de creación del backup
    });

    // Función auxiliar para copiar subcolecciones
    const copySubcollections = async (docRef) => {
      const subcollections = await docRef.listCollections();
      for (const subcol of subcollections) {
        const subcolSnapshot = await subcol.get();
        for (const subdoc of subcolSnapshot.docs) {
          const newSubdocRef = backupRef.collection(subcol.id).doc(subdoc.id);
          await newSubdocRef.set(subdoc.data());
          // Recursivamente copiar subcolecciones dentro del subdocumento
          await copySubcollections(subdoc.ref);
        }
      }
    };

    // Copiar subcolecciones del documento original
    const originalDocRef = db.collection('usuarios').doc(userId); // Cambiar 'usuarios' a la colección original
    await copySubcollections(originalDocRef);

  } catch (error) {
    console.error('Error al crear el backup del usuario:', error);
    throw error;
  }
};


const deleteUser = async (userId) => {
  try {
    // Función auxiliar para eliminar subcolecciones y documentos
    const deleteSubcollections = async (docRef) => {
      const subcollections = await docRef.listCollections();
      for (const subcol of subcollections) {
        const subcolSnapshot = await subcol.get();
        for (const subdoc of subcolSnapshot.docs) {
          // Recursivamente eliminar subdocumentos y sus subcolecciones
          await deleteSubcollections(subdoc.ref);
          await subdoc.ref.delete();
        }
      }
    };

    // Obtener la referencia al documento del usuario
    const userDocRef = db.collection('usuarios').doc(userId);

    // Eliminar subcolecciones del documento
    await deleteSubcollections(userDocRef);

    // Finalmente, eliminar el documento del usuario
    await userDocRef.delete();

    console.log(`Usuario ${userId} eliminado exitosamente.`);
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw error;
  }
};


// Controlador para gestionar el backup y la eliminación del usuario
const eliminarUsuario = async (req, res) => {
  const { senderId } = req.body;

  if (!senderId) {
    return res.status(400).json({ error: 'El senderId es requerido' });
  }

  try {
    // Paso 1: Obtener el usuario de la colección original
    const userData = await getUser(senderId);

    // Paso 2: Crear un backup en la subcolección 'backups' dentro de 'backup_usuarios/{userId}'
    await createBackup(senderId, userData);

    // Paso 3: Eliminar el usuario de la colección original 'usuarios'
    await deleteUser(senderId);

    // Responder con éxito
    return res.status(200).json({ mensaje: 'Usuario eliminado y backup creado exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


module.exports = {eliminarUsuario };