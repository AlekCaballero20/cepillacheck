import { byId } from '../../core/dom.js';
import { state } from '../../core/state.js';
import { showToast } from '../../core/toast.js';
import { logout as signOut } from '../../services/auth.service.js';
import { getUserProfile, saveUserSettings } from '../../services/settings.service.js';
import { getSelectedReminderHour, renderSettingsProfile } from './settings.ui.js';

export async function loadSettings() {
  if (!state.currentUser) return;

  try {
    const profile = await getUserProfile(state.currentUser.id);
    renderSettingsProfile(state.currentUser, profile?.hora_recordatorio ?? null);
  } catch (error) {
    renderSettingsProfile(state.currentUser, null);
  }
}

export function bindSettingsEvents() {
  byId('btn-save-settings').addEventListener('click', saveSettings);
  byId('btn-logout').addEventListener('click', async () => {
    try {
      await signOut();
    } catch (error) {
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
    });
    showToast('Ajustes guardados ✓', 'success');
  } catch (error) {
    showToast('Error al guardar', 'error');
  }
}
