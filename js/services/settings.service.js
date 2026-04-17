import { db } from '../config/firebase.js';

function getUserProfileRef(userId) {
  return db.doc(`users/${userId}`);
}

export async function getUserProfile(userId) {
  const snap = await getUserProfileRef(userId).get();
  return snap.exists ? snap.data() : null;
}

export async function saveUserSettings(user) {
  return getUserProfileRef(user.id).set({
    nombre: user.nombre,
    email: `${user.id}@cepillacheck.app`,
    hora_recordatorio: user.hora_recordatorio,
  }, { merge: true });
}
