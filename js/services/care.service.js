import { db, firebase } from '../config/firebase.js';
import { getTodayKey, isoNow } from '../core/dates.js';

function collectionRef(userId, name) {
  return db.collection(`users/${userId}/${name}`);
}

export async function addSymptom(userId, payload) {
  return collectionRef(userId, 'symptoms').add({
    dayKey: getTodayKey(),
    type: payload.type,
    zone: payload.zone,
    intensity: Number(payload.intensity ?? 1),
    notes: payload.notes ?? '',
    createdAtISO: isoNow(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

export async function getSymptoms(userId, limit = 20) {
  const snap = await collectionRef(userId, 'symptoms').orderBy('createdAtISO', 'desc').limit(limit).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addCareItem(userId, payload) {
  return collectionRef(userId, 'careItems').add({
    type: payload.type,
    name: payload.name ?? '',
    startDate: payload.startDate || getTodayKey(),
    reminderDays: Number(payload.reminderDays ?? 90),
    active: true,
    createdAtISO: isoNow(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

export async function getCareItems(userId, limit = 30) {
  const snap = await collectionRef(userId, 'careItems').orderBy('createdAtISO', 'desc').limit(limit).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addDentalVisit(userId, payload) {
  return collectionRef(userId, 'dentalVisits').add({
    date: payload.date || getTodayKey(),
    type: payload.type,
    notes: payload.notes ?? '',
    nextDate: payload.nextDate || '',
    createdAtISO: isoNow(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

export async function getDentalVisits(userId, limit = 20) {
  const snap = await collectionRef(userId, 'dentalVisits').orderBy('date', 'desc').limit(limit).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
