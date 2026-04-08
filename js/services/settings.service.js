import { db } from '../config/firebase.js';

export async function getUserProfile(userId) {
  const snap = await db.doc(`users/${userId}/profile`).get();
  return snap.exists ? snap.data() : null;
}

export async function saveUserSettings(user) {
  return db.doc(`users/${user.id}/profile`).set({
    nombre: user.nombre,
    email: `${user.id}@cepillacheck.app`,
    hora_recordatorio: user.hora_recordatorio,
  }, { merge: true });
}
