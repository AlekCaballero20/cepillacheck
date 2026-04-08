import { byId } from '../../core/dom.js';

export function renderDashboardHeader(user, formattedDate) {
  const avatar = byId('dash-avatar');
  avatar.textContent = user.nombre[0];
  avatar.className = `dash-avatar avatar-${user.id}`;
  byId('dash-name').textContent = `Hola, ${user.nombre} 👋`;
  byId('dash-date').textContent = formattedDate;
}

export function renderBrushState(todayData) {
  const btnM = byId('btn-manana');
  const stsM = byId('status-manana');
  btnM.classList.toggle('done', Boolean(todayData.manana));
  stsM.textContent = todayData.manana ? '✓ Registrado' : 'Pendiente';

  const btnN = byId('btn-noche');
  const stsN = byId('status-noche');
  btnN.classList.toggle('done', Boolean(todayData.noche));
  stsN.textContent = todayData.noche ? '✓ Registrado' : 'Pendiente';

  const sub = byId('dash-cta-sub');
  const both = todayData.manana && todayData.noche;
  const none = !todayData.manana && !todayData.noche;
  sub.textContent = both ? '¡Completaste los dos hoy! 🎉' : none ? 'Registra tus cepillados de hoy' : 'Ya falta solo uno 💪';
  sub.className = both ? 'all-done' : '';
}

export function renderPartnerState(partnerName, partnerData) {
  byId('partner-label').textContent = `Estado de ${partnerName} hoy`;

  const mananaItem = byId('partner-manana');
  mananaItem.querySelector('.pi-state').textContent = partnerData.manana ? '✓' : '—';
  mananaItem.className = `partner-item ${partnerData.manana ? 'done' : ''}`.trim();

  const nocheItem = byId('partner-noche');
  nocheItem.querySelector('.pi-state').textContent = partnerData.noche ? '✓' : '—';
  nocheItem.className = `partner-item ${partnerData.noche ? 'done' : ''}`.trim();
}

export function renderDashboardStreaks(streaks) {
  byId('streak-current').textContent = streaks.current;
  byId('streak-max').textContent = streaks.max;
}
