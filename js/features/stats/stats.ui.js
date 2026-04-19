import { byId } from '../../core/dom.js';
import { dateToKey } from '../../core/dates.js';

export function renderStatsHeader(streaks, currentPct) {
  byId('stat-streak').textContent = streaks.current;
  byId('stat-max').textContent = streaks.max;
  byId('stat-pct').textContent = `${currentPct}%`;
}

export function renderComparison({ alekPct, cataPct }) {
  byId('bar-alek').style.width = `${alekPct}%`;
  byId('pct-alek').textContent = `${alekPct}%`;
  byId('bar-cata').style.width = `${cataPct}%`;
  byId('pct-cata').textContent = `${cataPct}%`;
}

export function renderExtrasStats({ alek, cata }) {
  byId('bar-seda-alek').style.width = `${alek.sedaPct}%`;
  byId('pct-seda-alek').textContent = `${alek.sedaPct}%`;
  byId('bar-seda-cata').style.width = `${cata.sedaPct}%`;
  byId('pct-seda-cata').textContent = `${cata.sedaPct}%`;

  byId('bar-enjuague-alek').style.width = `${alek.enjuaguePct}%`;
  byId('pct-enjuague-alek').textContent = `${alek.enjuaguePct}%`;
  byId('bar-enjuague-cata').style.width = `${cata.enjuaguePct}%`;
  byId('pct-enjuague-cata').textContent = `${cata.enjuaguePct}%`;
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
    const cell = document.createElement('div');
    cell.className = 'heat-cell';
    cell.textContent = day;

    const currentDate = new Date(year, month, day);
    const isFuture = currentDate > today;
    const isToday = key === todayKey;
    if (isToday) cell.classList.add('today');

    if (!isFuture || isToday) {
      const alek = alekData[key] || {};
      const cata = cataData[key] || {};
      const alekAny = alek.manana || alek.noche;
      const cataAny = cata.manana || cata.noche;

      if (alekAny && cataAny) {
        cell.classList.add('green', 'has-data');
      } else if (alekAny || cataAny) {
        cell.classList.add('yellow', 'has-data');
      } else {
        cell.classList.add('red');
      }
    } else {
      cell.classList.add('future');
    }

    grid.appendChild(cell);
  }
}
