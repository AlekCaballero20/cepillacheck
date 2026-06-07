import { db, firebase } from '../config/firebase.js';
import { getTodayKey, isoNow, monthRangeKeys } from '../core/dates.js';

export const MOMENTS = ['manana', 'noche'];

export function defaultSession() {
  return {
    manana: false,
    manana_seda: false,
    manana_enjuague: false,
    manana_irrigador: false,
    manana_fluor: true,
    manana_lengua: false,
    manana_sangrado: false,
    manana_mal_aliento: false,
    manana_sensibilidad: 0,
    manana_duration: 120,
    manana_time: '',
    manana_nota: '',
    noche: false,
    noche_seda: false,
    noche_enjuague: false,
    noche_irrigador: false,
    noche_fluor: true,
    noche_lengua: false,
    noche_sangrado: false,
    noche_mal_aliento: false,
    noche_sensibilidad: 0,
    noche_duration: 120,
    noche_time: '',
    noche_nota: '',
  };
}

export function normalizeSession(data = {}) {
  const base = defaultSession();
  MOMENTS.forEach((moment) => {
    base[moment] = Boolean(data[moment]);
    ['seda', 'enjuague', 'irrigador', 'lengua', 'sangrado', 'mal_aliento'].forEach((key) => {
      base[`${moment}_${key}`] = Boolean(data[`${moment}_${key}`] ?? data[key] ?? data[`${key}_${moment}`]);
    });
    base[`${moment}_fluor`] = data[`${moment}_fluor`] !== undefined ? Boolean(data[`${moment}_fluor`]) : true;
    base[`${moment}_sensibilidad`] = clampNumber(data[`${moment}_sensibilidad`] ?? data.sensibilidad ?? 0, 0, 5);
    base[`${moment}_duration`] = clampNumber(data[`${moment}_duration`] ?? data.duration ?? 120, 0, 900);
    base[`${moment}_time`] = data[`${moment}_time`] ?? '';
    base[`${moment}_nota`] = data[`${moment}_nota`] ?? '';
  });
  return { ...base, ...preserveMeta(data) };
}

function preserveMeta(data) {
  const meta = {};
  ['timestamp', 'lastUpdated', 'score'].forEach((key) => {
    if (data[key] !== undefined) meta[key] = data[key];
  });
  return meta;
}

function clampNumber(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

export async function getSessionByDay(userId, dayKey) {
  const snap = await db.doc(`users/${userId}/sessions/${dayKey}`).get();
  return normalizeSession(snap.exists ? snap.data() : {});
}

export async function getTodaySession(userId) {
  return getSessionByDay(userId, getTodayKey());
}

export async function saveTodaySession(userId, data) {
  const today = getTodayKey();
  return saveSessionByDay(userId, today, data);
}

export async function saveSessionByDay(userId, dayKey, data) {
  return db.doc(`users/${userId}/sessions/${dayKey}`).set({
    ...normalizeSession(data),
    lastUpdated: isoNow(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function addBrushEvent(userId, dayKey, moment, payload) {
  return db.collection(`users/${userId}/events`).add({
    type: 'brushing',
    dayKey,
    moment,
    ...payload,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    performedAt: payload.performedAt ?? isoNow(),
  });
}

export async function getMonthSessions(userId, year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const snap = await db.collection(`users/${userId}/sessions`).get();
  const result = {};
  snap.forEach((doc) => {
    if (doc.id.startsWith(prefix)) {
      result[doc.id] = normalizeSession(doc.data());
    }
  });
  return result;
}

export async function getRangeSessions(userId, startKey, endKey) {
  const snap = await db.collection(`users/${userId}/sessions`).get();
  const result = {};
  snap.forEach((doc) => {
    if (doc.id >= startKey && doc.id <= endKey) {
      result[doc.id] = normalizeSession(doc.data());
    }
  });
  return result;
}

export async function getAllSessions(userId) {
  return db.collection(`users/${userId}/sessions`).get();
}

export async function getAllSessionsAsObject(userId) {
  const snap = await getAllSessions(userId);
  const result = {};
  snap.forEach((doc) => {
    result[doc.id] = normalizeSession(doc.data());
  });
  return result;
}

export async function getCurrentMonthSessions(userId) {
  const now = new Date();
  const { start, end } = monthRangeKeys(now.getFullYear(), now.getMonth());
  return getRangeSessions(userId, start, end);
}
