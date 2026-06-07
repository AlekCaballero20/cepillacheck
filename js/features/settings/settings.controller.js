import { byId } from '../../core/dom.js';
import { downloadTextFile, toCsv } from '../../core/download.js';
import { state } from '../../core/state.js';
import { showToast } from '../../core/toast.js';
import { logout as signOut } from '../../services/auth.service.js';
import { getAllSessionsAsObject } from '../../services/sessions.service.js';
import { getUserProfile, saveUserSettings } from '../../services/settings.service.js';
import { calculateDayScore } from '../../services/stats.service.js';
import { getSelectedReminderHour, getSelectedScoreGoal, renderSettingsProfile } from './settings.ui.js';

export async function loadSettings() {
  if (!state.currentUser) return;

  try {
    const profile = await getUserProfile(state.currentUser.id);
    renderSettingsProfile(state.currentUser, profile);
  } catch {
    renderSettingsProfile(state.currentUser, null);
  }
}

export function bindSettingsEvents() {
  byId('btn-save-settings').addEventListener('click', saveSettings);
  byId('btn-export-all').addEventListener('click', exportAllSessions);
  byId('btn-logout').addEventListener('click', async () => {
    try {
      await signOut();
    } catch {
      showToast('Error al cerrar sesión', 'error');
    }
  });
}

export async function saveSettings() {
  if (!state.currentUser) return;

  try {
    await saveUserSettings({
      ...state.currentUser,
      hora_recordatorio: getSelectedReminderHour(),
      score_goal: getSelectedScoreGoal(),
    });
    showToast('Ajustes guardados ✓', 'success');
  } catch {
    showToast('Error al guardar', 'error');
  }
}

async function exportAllSessions() {
  if (!state.currentUser) return;
  try {
    const sessions = await getAllSessionsAsObject(state.currentUser.id);
    const rows = Object.entries(sessions).sort(([a], [b]) => a.localeCompare(b)).map(([fecha, data]) => ({
      usuario: state.currentUser.id,
      fecha,
      score: calculateDayScore(data),
      ...data,
    }));
    if (!rows.length) {
      showToast('No hay datos para exportar', 'neutral');
      return;
    }
    downloadTextFile(`cepillacheck-historial-completo-${state.currentUser.id}.csv`, toCsv(rows));
  } catch {
    showToast('No se pudo exportar', 'error');
  }
}
