import { byId } from '../../core/dom.js';
import { formatDateShort, formatTimeFromISO } from '../../core/dates.js';
import { calculateDayScore, dayHasSymptoms } from '../../services/stats.service.js';

function yesNo(value) {
  return value ? 'Sí' : 'No';
}

function formatDuration(seconds) {
  const s = Number(seconds ?? 0);
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const rest = String(s % 60).padStart(2, '0');
  return `${m}:${rest}`;
}

export function renderHistorySummary(analysis) {
  byId('history-score').textContent = analysis.avgScore;
  byId('history-complete').textContent = analysis.completeDays;
  byId('history-symptoms').textContent = analysis.symptomDays;
}

export function renderHistoryList(days) {
  const list = byId('history-list');
  const reversed = [...days].reverse();
  if (!reversed.length) {
    list.innerHTML = '<div class="empty-state">No hay días para mostrar. Qué descanso para la base de datos, pero no para las encías.</div>';
    return;
  }

  list.innerHTML = reversed.map(({ key, data }) => {
    const score = calculateDayScore(data);
    const symptoms = dayHasSymptoms(data);
    return `
      <details class="history-item ${symptoms ? 'has-symptom' : ''}">
        <summary>
          <div>
            <strong>${formatDateShort(key)}</strong>
            <span>${data.manana && data.noche ? 'Rutina completa' : data.manana || data.noche ? 'Rutina parcial' : 'Sin registros'}</span>
          </div>
          <div class="history-score ${score >= 75 ? 'good' : score > 0 ? 'mid' : 'low'}">${score}</div>
        </summary>
        <div class="history-detail-grid">
          ${renderMoment('Mañana', 'manana', data)}
          ${renderMoment('Noche', 'noche', data)}
        </div>
      </details>
    `;
  }).join('');
}

function renderMoment(label, moment, data) {
  if (!data[moment]) {
    return `<div class="moment-detail muted"><h4>${label}</h4><p>No registrado</p></div>`;
  }
  return `
    <div class="moment-detail">
      <h4>${label} · ${formatTimeFromISO(data[`${moment}_time`])}</h4>
      <div class="mini-grid">
        <span>Duración</span><strong>${formatDuration(data[`${moment}_duration`])}</strong>
        <span>Seda</span><strong>${yesNo(data[`${moment}_seda`])}</strong>
        <span>Enjuague</span><strong>${yesNo(data[`${moment}_enjuague`])}</strong>
        <span>Irrigador</span><strong>${yesNo(data[`${moment}_irrigador`])}</strong>
        <span>Flúor</span><strong>${yesNo(data[`${moment}_fluor`])}</strong>
        <span>Lengua</span><strong>${yesNo(data[`${moment}_lengua`])}</strong>
        <span>Sangrado</span><strong>${yesNo(data[`${moment}_sangrado`])}</strong>
        <span>Sensibilidad</span><strong>${data[`${moment}_sensibilidad`] ?? 0}/5</strong>
        <span>Mal aliento</span><strong>${yesNo(data[`${moment}_mal_aliento`])}</strong>
      </div>
      ${data[`${moment}_nota`] ? `<p class="history-note">${escapeHtml(data[`${moment}_nota`])}</p>` : ''}
    </div>
  `;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
