import { db, firebase } from '../config/firebase.js';
import { getTodayKey } from '../core/dates.js';

export async function getSessionByDay(userId, dayKey) {
  const snap = await db.doc(`users/${userId}/sessions/${dayKey}`).get();
  return snap.exists ? snap.data() : {
    manana: false, manana_seda: false, manana_enjuague: false, manana_irrigador: false,
    noche: false,  noche_seda: false,  noche_enjuague: false,  noche_irrigador: false,
  };
}

export async function getTodaySession(userId) {
  return getSessionByDay(userId, getTodayKey());
}

export async function saveTodaySession(userId, data) {
  const today = getTodayKey();
  return db.doc(`users/${userId}/sessions/${today}`).set({
    manana:          data.manana          ?? false,
    manana_seda:     data.manana_seda     ?? false,
    manana_enjuague: data.manana_enjuague ?? false,
    manana_irrigador:data.manana_irrigador?? false,
    noche:           data.noche           ?? false,
    noche_seda:      data.noche_seda      ?? false,
    noche_enjuague:  data.noche_enjuague  ?? false,
    noche_irrigador: data.noche_irrigador ?? false,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function getMonthSessions(userId, year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const snap = await db.collection(`users/${userId}/sessions`).get();
  const result = {};
  snap.forEach((doc) => {
    if (doc.id.startsWith(prefix)) {
      result[doc.id] = doc.data();
    }
  });
  return result;
}

export async function getAllSessions(userId) {
  return db.collection(`users/${userId}/sessions`).get();
}
