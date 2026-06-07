import { byId } from '../../core/dom.js';
import { downloadTextFile, toCsv } from '../../core/download.js';
import { monthInputValue, parseMonthInput } from '../../core/dates.js';
import { state } from '../../core/state.js';
import { getMonthSessions } from '../../services/sessions.service.js';
import { analyzeMonthData } from '../../services/stats.service.js';
import { renderHistoryList, renderHistorySummary } from './history.ui.js';

let currentRows = [];
let bound = false;

export function bindHistoryEvents() {
  if (bound) return;
  bound = true;
  byId('history-month')?.addEventListener('change', loadHistory);
  byId('history-user')?.addEventListener('change', loadHistory);
  byId('btn-export-history')?.addEventListener('click', exportCurrentHistory);
}

function selectedUserId() {
  const value = byId('history-user').value;
  if (value === 'current') return state.currentUser.id;
  return value;
}

export async function loadHistory() {
  if (!state.currentUser) return;
  const monthInput = byId('history-month');
  if (!monthInput.value) monthInput.value = monthInputValue();
  const { year, month } = parseMonthInput(monthInput.value);
  const userId = selectedUserId();
  const monthData = await getMonthSessions(userId, year, month);
  const analysis = analyzeMonthData(monthData, year, month);
  renderHistorySummary(analysis);
  renderHistoryList(analysis.days);
  currentRows = buildRows(userId, analysis.days);
}

function buildRows(userId, days) {
  return days.map(({ key, data, score }) => ({
    usuario: userId,
    fecha: key,
    score,
    manana: data.manana,
    manana_hora: data.manana_time,
    manana_duracion: data.manana_duration,
    manana_seda: data.manana_seda,
    manana_enjuague: data.manana_enjuague,
    manana_irrigador: data.manana_irrigador,
    manana_fluor: data.manana_fluor,
    manana_lengua: data.manana_lengua,
    manana_sangrado: data.manana_sangrado,
    manana_sensibilidad: data.manana_sensibilidad,
    manana_mal_aliento: data.manana_mal_aliento,
    manana_nota: data.manana_nota,
    noche: data.noche,
    noche_hora: data.noche_time,
    noche_duracion: data.noche_duration,
    noche_seda: data.noche_seda,
    noche_enjuague: data.noche_enjuague,
    noche_irrigador: data.noche_irrigador,
    noche_fluor: data.noche_fluor,
    noche_lengua: data.noche_lengua,
    noche_sangrado: data.noche_sangrado,
    noche_sensibilidad: data.noche_sensibilidad,
    noche_mal_aliento: data.noche_mal_aliento,
    noche_nota: data.noche_nota,
  }));
}

function exportCurrentHistory() {
  if (!currentRows.length) return;
  const filename = `cepillacheck-historial-${selectedUserId()}-${byId('history-month').value}.csv`;
  downloadTextFile(filename, toCsv(currentRows));
}
