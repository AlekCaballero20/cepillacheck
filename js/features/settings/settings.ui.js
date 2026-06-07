import { byId } from '../../core/dom.js';

export function renderSettingsProfile(user, profile = null) {
  const avatar = byId('settings-avatar');
  avatar.textContent = user.nombre[0];
  avatar.className = `settings-avatar avatar-${user.id}`;

  byId('settings-name').textContent = user.nombre;
  byId('settings-email').textContent = `${user.id}@cepillacheck.app`;

  if (profile?.hora_recordatorio) byId('settings-hora').value = profile.hora_recordatorio;
  if (profile?.score_goal) byId('settings-goal').value = profile.score_goal;
}

export function getSelectedReminderHour() {
  return byId('settings-hora').value;
}

export function getSelectedScoreGoal() {
  return Number(byId('settings-goal').value || 85);
}
