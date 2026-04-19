import { dateToKey, daysInMonth } from '../core/dates.js';
import { getAllSessions, getMonthSessions } from './sessions.service.js';

export async function calcStreaks(userId) {
  const snap = await getAllSessions(userId);
  const completeSet = new Set();

  snap.forEach((doc) => {
    const data = doc.data();
    if (data.manana === true && data.noche === true) {
      completeSet.add(doc.id);
    }
  });

  if (completeSet.size === 0) {
    return { current: 0, max: 0 };
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayKey = dateToKey(today);

  let current = 0;
  const startDate = new Date(today);
  if (!completeSet.has(todayKey)) {
    startDate.setDate(startDate.getDate() - 1);
  }

  const cursor = new Date(startDate);
  while (completeSet.has(dateToKey(cursor)) && current < 500) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = Array.from(completeSet).sort();
  let temp = 1;
  let max = 0;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) {
      temp += 1;
    } else {
      max = Math.max(max, temp);
      temp = 1;
    }
  }

  max = Math.max(max, temp, current);
  return { current, max };
}

export function countSessions(monthData) {
  let count = 0;
  Object.values(monthData).forEach((day) => {
    if (day.manana) count += 1;
    if (day.noche) count += 1;
  });
  return count;
}

export function countExtras(monthData) {
  let totalBrushings = 0;
  let sedaCount = 0;
  let enjuagueCount = 0;

  Object.values(monthData).forEach((day) => {
    if (day.manana) {
      totalBrushings += 1;
      if (day.manana_seda) sedaCount += 1;
      if (day.manana_enjuague) enjuagueCount += 1;
    }
    if (day.noche) {
      totalBrushings += 1;
      if (day.noche_seda) sedaCount += 1;
      if (day.noche_enjuague) enjuagueCount += 1;
    }
  });

  const sedaPct = totalBrushings > 0 ? Math.round((sedaCount / totalBrushings) * 100) : 0;
  const enjuaguePct = totalBrushings > 0 ? Math.round((enjuagueCount / totalBrushings) * 100) : 0;

  return { sedaCount, enjuagueCount, totalBrushings, sedaPct, enjuaguePct };
}

export async function getStatsSnapshot(currentUserId, year, month, allUsers = ['alek', 'cata']) {
  const streaks = await calcStreaks(currentUserId);
  const [alekData, cataData] = await Promise.all([
    getMonthSessions('alek', year, month),
    getMonthSessions('cata', year, month),
  ]);

  const now = new Date();
  const maxPossible = now.getDate() * 2;
  const alekCount = countSessions(alekData);
  const cataCount = countSessions(cataData);
  const alekExtras = countExtras(alekData);
  const cataExtras = countExtras(cataData);
  const alekPct = maxPossible > 0 ? Math.round((alekCount / maxPossible) * 100) : 0;
  const cataPct = maxPossible > 0 ? Math.round((cataCount / maxPossible) * 100) : 0;
  const currentPct = currentUserId === 'alek' ? alekPct : cataPct;

  return {
    streaks,
    currentPct,
    comparison: {
      alekPct,
      cataPct,
    },
    monthData: {
      alek: alekData,
      cata: cataData,
    },
    extras: {
      alek: alekExtras,
      cata: cataExtras,
    },
    calendarMeta: {
      year,
      month,
      totalDays: daysInMonth(year, month),
      users: allUsers,
    },
  };
}
