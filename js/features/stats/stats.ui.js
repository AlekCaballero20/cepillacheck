import { byId } from '../../core/dom.js';
import { dateToKey } from '../../core/dates.js';
import { dayHasSymptoms } from '../../services/stats.service.js';

export function renderStatsHeader(streaks, analysis) {
  byId('stat-score').textContent = analysis.avgScore;
  byId('stat-streak').textContent = streaks.current;
  byId('stat-perfect-days').textContent = analysis.perfectDays;
}

export function renderInsight(analysis) {
  const title = byId('stats-insight-title');
  const desc = byId('stats-insight-desc');
  if (analysis.totalBrushings === 0) {
    title.textContent = 'Todavía no hay datos este mes';
    desc.textContent = 'Cuando registres rutinas, aquí aparecerán tendencias reales. La estadística, ese chisme con Excel.';
    return;
  }
  if (analysis.symptomDays >= 3) {
    title.textContent = 'Varias señales reportadas';
    desc.textContent = `Hay ${analysis.symptomDays} días con sangrado, sensibilidad o mal aliento. Vale la pena mirar el historial y encontrar patrones.`;
    return;
  }
  if (analysis.nightPct < analysis.morningPct) {
    title.textContent = 'La noche se está quedando atrás';
    desc.textContent = `Mañanas: ${analysis.morningPct}%. Noches: ${analysis.nightPct}%. El cansancio nocturno, enemigo histórico de las encías.`;
    return;
  }
  if (analysis.extras.sedaPct < 50) {
    title.textContent = 'La seda dental pide protagonismo';
    desc.textContent = `La seda aparece en ${analysis.extras.sedaPct}% de los cepillados registrados. Pequeño hilo, gran drama.`;
    return;
  }
  title.textContent = 'Buen patrón general';
  desc.textContent = `Score promedio ${analysis.avgScore}/100 con ${analysis.completeDays} días completos. Esto ya parece seguimiento adulto, increíblemente.`;
}

export function renderComparison({ alekPct, cataPct }) {
  byId('bar-alek').style.width = `${alekPct}%`;
  byId('pct-alek').textContent = `${alekPct}%`;
  byId('bar-cata').style.width = `${cataPct}%`;
  byId('pct-cata').textContent = `${cataPct}%`;
}

export function renderHabits(analysis) {
  byId('habit-morning').textContent = `${analysis.morningPct}%`;
  byId('habit-night').textContent = `${analysis.nightPct}%`;
  byId('habit-floss').textContent = `${analysis.extras.sedaPct}%`;
  byId('habit-tongue').textContent = `${analysis.extras.lenguaPct}%`;
  byId('habit-duration').textContent = analysis.avgDuration ? `${analysis.avgDuration}s` : '—';
  byId('habit-symptoms').textContent = analysis.symptomDays;
}

export function renderExtrasStats({ alek, cata }) {
  const set = (id, value) => {
    const el = byId(id);
    if (el) el.style.width = `${value}%`;
  };
  const setText = (id, value) => {
    const el = byId(id);
    if (el) el.textContent = `${value}%`;
  };
  set('bar-seda-alek', alek.sedaPct); setText('pct-seda-alek', alek.sedaPct);
  set('bar-seda-cata', cata.sedaPct); setText('pct-seda-cata', cata.sedaPct);
  set('bar-enjuague-alek', alek.enjuaguePct); setText('pct-enjuague-alek', alek.enjuaguePct);
  set('bar-enjuague-cata', cata.enjuaguePct); setText('pct-enjuague-cata', cata.enjuaguePct);
  set('bar-irrigador-alek', alek.irrigadorPct); setText('pct-irrigador-alek', alek.irrigadorPct);
  set('bar-irrigador-cata', cata.irrigadorPct); setText('pct-irrigador-cata', cata.irrigadorPct);
}

export function renderWeeklyBars(weekStats) {
  const max = Math.max(1, ...weekStats.map((item) => item.pct));
  byId('weekly-bars').innerHTML = weekStats.map((item) => `
    <div class="week-bar-item">
      <div class="week-bar-track"><div class="week-bar-fill" style="height:${Math.max(4, (item.pct / max) * 100)}%"></div></div>
      <strong>${item.pct}%</strong>
      <span>${item.label}</span>
    </div>
  `).join('');
}

export function renderHeatCalendar(year, month, alekData, cataData) {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  byId('heat-month-name').textContent = `${monthNames[month]} ${year}`;

  const grid = byId('heat-grid');
  grid.innerHTML = '';

  ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach((label) => {
    const el = document.createElement('div');
    el.className = 'heat-day-label';
    el.textContent = label;
    grid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < offset; i += 1) {
    const empty = document.createElement('div');
    empty.className = 'heat-cell empty';
    grid.appendChild(empty);
  }

  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayKey = dateToKey(today);

  for (let day = 1; day <= totalDays; day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'heat-cell';
    cell.textContent = day;

    const currentDate = new Date(year, month, day, 23, 59, 59);
    const isFuture = currentDate > today && key !== todayKey;
    const isToday = key === todayKey;
    if (isToday) cell.classList.add('today');

    if (!isFuture || isToday) {
      const alek = alekData[key] || {};
      const cata = cataData[key] || {};
      const alekAny = alek.manana || alek.noche;
      const cataAny = cata.manana || cata.noche;
      const symptom = dayHasSymptoms(alek) || dayHasSymptoms(cata);

      if (symptom) cell.classList.add('purple', 'has-data');
      else if (alekAny && cataAny) cell.classList.add('green', 'has-data');
      else if (alekAny || cataAny) cell.classList.add('yellow', 'has-data');
      else cell.classList.add('red');
    } else {
      cell.classList.add('future');
    }

    grid.appendChild(cell);
  }
}
