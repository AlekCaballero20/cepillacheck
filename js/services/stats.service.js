import { dateToKey, daysInMonth, keyToDate } from '../core/dates.js';
import { getAllSessions, getMonthSessions } from './sessions.service.js';

export function momentHasSymptoms(day, moment) {
  return Boolean(day[`${moment}_sangrado`] || day[`${moment}_mal_aliento`] || Number(day[`${moment}_sensibilidad`] ?? 0) > 0);
}

export function dayHasSymptoms(day) {
  return momentHasSymptoms(day, 'manana') || momentHasSymptoms(day, 'noche');
}

export function calculateDayScore(day = {}) {
  let score = 0;
  ['manana', 'noche'].forEach((moment) => {
    if (!day[moment]) return;
    score += 25;
    if (Number(day[`${moment}_duration`] ?? 0) >= 120) score += 5;
    if (day[`${moment}_fluor`] !== false) score += 3;
    if (day[`${moment}_lengua`]) score += 4;
    if (day[`${moment}_seda`]) score += 6;
    if (day[`${moment}_enjuague`]) score += 3;
    if (day[`${moment}_irrigador`]) score += 3;
    if (day[`${moment}_sangrado`]) score -= 4;
    if (day[`${moment}_mal_aliento`]) score -= 3;
    score -= Math.min(5, Number(day[`${moment}_sensibilidad`] ?? 0));
  });
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getScoreLabel(score) {
  if (score >= 90) return { title: 'Rutina excelente', desc: 'Día muy completo. Los dientes casi mandan carta de agradecimiento.' };
  if (score >= 75) return { title: 'Buen cuidado', desc: 'Vas bien; revisa si falta seda, lengua o duración.' };
  if (score >= 50) return { title: 'Rutina incompleta', desc: 'Hay base, pero todavía quedaron huecos en el cuidado.' };
  if (score > 0) return { title: 'Día flojito', desc: 'Un cepillado salva algo, pero los molares están tomando acta.' };
  return { title: 'Sin registros', desc: 'Marca tu rutina para empezar el seguimiento de hoy.' };
}

export async function calcStreaks(userId) {
  const snap = await getAllSessions(userId);
  const completeSet = new Set();

  snap.forEach((doc) => {
    const data = doc.data();
    if (data.manana === true && data.noche === true) completeSet.add(doc.id);
  });

  if (completeSet.size === 0) return { current: 0, max: 0 };

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayKey = dateToKey(today);
  let current = 0;
  const startDate = new Date(today);
  if (!completeSet.has(todayKey)) startDate.setDate(startDate.getDate() - 1);

  const cursor = new Date(startDate);
  while (completeSet.has(dateToKey(cursor)) && current < 1000) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = Array.from(completeSet).sort();
  let temp = sorted.length ? 1 : 0;
  let max = temp;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = keyToDate(sorted[i - 1]);
    const curr = keyToDate(sorted[i]);
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) temp += 1;
    else temp = 1;
    max = Math.max(max, temp);
  }

  return { current, max: Math.max(max, current) };
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
  const totals = { seda: 0, enjuague: 0, irrigador: 0, lengua: 0, fluor: 0 };
  Object.values(monthData).forEach((day) => {
    ['manana', 'noche'].forEach((moment) => {
      if (!day[moment]) return;
      totalBrushings += 1;
      Object.keys(totals).forEach((key) => {
        if (day[`${moment}_${key}`]) totals[key] += 1;
      });
    });
  });
  const pct = (count) => totalBrushings > 0 ? Math.round((count / totalBrushings) * 100) : 0;
  return {
    totalBrushings,
    sedaCount: totals.seda,
    enjuagueCount: totals.enjuague,
    irrigadorCount: totals.irrigador,
    lenguaCount: totals.lengua,
    fluorCount: totals.fluor,
    sedaPct: pct(totals.seda),
    enjuaguePct: pct(totals.enjuague),
    irrigadorPct: pct(totals.irrigador),
    lenguaPct: pct(totals.lengua),
    fluorPct: pct(totals.fluor),
  };
}

export function analyzeMonthData(monthData, year, month) {
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  const totalDays = isCurrentMonth ? now.getDate() : daysInMonth(year, month);
  const maxBrushings = totalDays * 2;
  const days = [];

  for (let d = 1; d <= totalDays; d += 1) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const data = monthData[key] ?? {};
    const score = calculateDayScore(data);
    const brushings = (data.manana ? 1 : 0) + (data.noche ? 1 : 0);
    days.push({ key, data, score, brushings });
  }

  const totalBrushings = days.reduce((sum, day) => sum + day.brushings, 0);
  const pct = maxBrushings > 0 ? Math.round((totalBrushings / maxBrushings) * 100) : 0;
  const avgScore = totalDays > 0 ? Math.round(days.reduce((sum, day) => sum + day.score, 0) / totalDays) : 0;
  const completeDays = days.filter((day) => day.data.manana && day.data.noche).length;
  const perfectDays = days.filter((day) => day.score >= 90).length;
  const symptomDays = days.filter((day) => dayHasSymptoms(day.data)).length;
  const morningPct = totalDays > 0 ? Math.round((days.filter((day) => day.data.manana).length / totalDays) * 100) : 0;
  const nightPct = totalDays > 0 ? Math.round((days.filter((day) => day.data.noche).length / totalDays) * 100) : 0;
  const durations = [];
  days.forEach(({ data }) => {
    ['manana', 'noche'].forEach((moment) => {
      if (data[moment]) durations.push(Number(data[`${moment}_duration`] ?? 0));
    });
  });
  const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const extras = countExtras(monthData);

  const weekStats = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((label) => ({ label, got: 0, possible: 0 }));
  days.forEach(({ key, brushings }) => {
    const date = keyToDate(key);
    const index = date.getDay() === 0 ? 6 : date.getDay() - 1;
    weekStats[index].got += brushings;
    weekStats[index].possible += 2;
  });

  return {
    totalDays,
    maxBrushings,
    totalBrushings,
    pct,
    avgScore,
    completeDays,
    perfectDays,
    symptomDays,
    morningPct,
    nightPct,
    avgDuration,
    extras,
    weekStats: weekStats.map((item) => ({ ...item, pct: item.possible ? Math.round((item.got / item.possible) * 100) : 0 })),
    days,
  };
}

export async function getStatsSnapshot(currentUserId, year, month, allUsers = ['alek', 'cata']) {
  const streaks = await calcStreaks(currentUserId);
  const [alekData, cataData] = await Promise.all([
    getMonthSessions('alek', year, month),
    getMonthSessions('cata', year, month),
  ]);

  const alekAnalysis = analyzeMonthData(alekData, year, month);
  const cataAnalysis = analyzeMonthData(cataData, year, month);
  const currentAnalysis = currentUserId === 'alek' ? alekAnalysis : cataAnalysis;

  return {
    streaks,
    currentPct: currentAnalysis.pct,
    currentAnalysis,
    comparison: { alekPct: alekAnalysis.pct, cataPct: cataAnalysis.pct },
    monthData: { alek: alekData, cata: cataData },
    analysis: { alek: alekAnalysis, cata: cataAnalysis },
    extras: { alek: alekAnalysis.extras, cata: cataAnalysis.extras },
    calendarMeta: { year, month, totalDays: daysInMonth(year, month), users: allUsers },
  };
}
