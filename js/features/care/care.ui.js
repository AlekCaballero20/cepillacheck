import { byId } from '../../core/dom.js';
import { daysBetween, formatDateShort, getTodayKey } from '../../core/dates.js';

const LABELS = {
  sangrado: 'Sangrado de encías',
  sensibilidad: 'Sensibilidad',
  dolor: 'Dolor',
  mal_aliento: 'Mal aliento',
  boca_seca: 'Boca seca',
  afta: 'Afta o llaga',
  inflamacion: 'Inflamación',
  otro: 'Otro',
  cepillo: 'Cepillo',
  cabezal: 'Cabezal eléctrico',
  crema: 'Crema dental',
  seda: 'Seda dental',
  enjuague: 'Enjuague',
  irrigador: 'Irrigador / boquilla',
  limpieza: 'Limpieza',
  revision: 'Revisión',
  urgencia: 'Urgencia',
  ortodoncia: 'Ortodoncia',
};

export function prepareCareDefaults() {
  byId('kit-start').value ||= getTodayKey();
  byId('visit-date').value ||= getTodayKey();
}

export function renderSymptoms(items) {
  byId('symptom-list').innerHTML = items.length ? items.map((item) => `
    <div class="care-list-item">
      <div><strong>${LABELS[item.type] ?? item.type}</strong><span>${formatDateShort(item.dayKey)} · ${item.zone}</span></div>
      <em>${item.intensity}/5</em>
      ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ''}
    </div>
  `).join('') : '<div class="empty-state">Sin señales registradas.</div>';
}

export function renderKit(items) {
  const today = getTodayKey();
  byId('kit-list').innerHTML = items.length ? items.map((item) => {
    const usedDays = daysBetween(item.startDate, today);
    const remaining = Number(item.reminderDays ?? 90) - usedDays;
    const status = remaining < 0 ? `Vencido hace ${Math.abs(remaining)} días` : `Cambio en ${remaining} días`;
    return `
      <div class="care-list-item ${remaining <= 7 ? 'warning' : ''}">
        <div><strong>${LABELS[item.type] ?? item.type}</strong><span>${item.name || 'Sin referencia'} · desde ${formatDateShort(item.startDate)}</span></div>
        <em>${status}</em>
      </div>
    `;
  }).join('') : '<div class="empty-state">Aún no hay insumos guardados.</div>';
}

export function renderVisits(items) {
  byId('visit-list').innerHTML = items.length ? items.map((item) => `
    <div class="care-list-item">
      <div><strong>${LABELS[item.type] ?? item.type}</strong><span>${formatDateShort(item.date)}${item.nextDate ? ` · próximo ${formatDateShort(item.nextDate)}` : ''}</span></div>
      ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ''}
    </div>
  `).join('') : '<div class="empty-state">Sin visitas registradas.</div>';
}

export function readSymptomForm() {
  return {
    type: byId('symptom-type').value,
    zone: byId('symptom-zone').value,
    intensity: Number(byId('symptom-intensity').value),
    notes: byId('symptom-notes').value.trim(),
  };
}

export function readKitForm() {
  return {
    type: byId('kit-type').value,
    name: byId('kit-name').value.trim(),
    startDate: byId('kit-start').value || getTodayKey(),
    reminderDays: Number(byId('kit-reminder').value || 90),
  };
}

export function readVisitForm() {
  return {
    date: byId('visit-date').value || getTodayKey(),
    type: byId('visit-type').value,
    notes: byId('visit-notes').value.trim(),
    nextDate: byId('visit-next').value,
  };
}

export function resetSymptomForm() { byId('symptom-notes').value = ''; byId('symptom-intensity').value = 2; byId('symptom-intensity-label').textContent = '2'; }
export function resetKitForm() { byId('kit-name').value = ''; byId('kit-reminder').value = 90; byId('kit-start').value = getTodayKey(); }
export function resetVisitForm() { byId('visit-notes').value = ''; byId('visit-next').value = ''; byId('visit-date').value = getTodayKey(); }

function escapeHtml(text) {
  return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
