import { byId } from '../../core/dom.js';

export function renderSettingsProfile(user, savedHour = null) {
  const avatar = byId('settings-avatar');
  avatar.textContent = user.nombre[0];
  avatar.className = `settings-avatar avatar-${user.id}`;

  byId('settings-name').textContent = user.nombre;
  byId('settings-email').textContent = `${user.id}@cepillacheck.app`;

  if (savedHour) {
    byId('settings-hora').value = savedHour;
  }
}

export function getSelectedReminderHour() {
  return byId('settings-hora').value;
}
