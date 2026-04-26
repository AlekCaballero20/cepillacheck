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
  byId('extras-manana').textContent = buildExtrasLabel(todayData, 'manana');

  const btnN = byId('btn-noche');
  const stsN = byId('status-noche');
  btnN.classList.toggle('done', Boolean(todayData.noche));
  stsN.textContent = todayData.noche ? '✓ Registrado' : 'Pendiente';
  byId('extras-noche').textContent = buildExtrasLabel(todayData, 'noche');

  const sub = byId('dash-cta-sub');
  const both = todayData.manana && todayData.noche;
  const none = !todayData.manana && !todayData.noche;
  sub.textContent = both ? '¡Completaste los dos hoy! 🎉' : none ? 'Registra tus cepillados de hoy' : 'Ya falta solo uno 💪';
  sub.className = both ? 'all-done' : '';
}

function buildExtrasLabel(data, moment) {
  if (!data[moment]) return '';
  const parts = [];
  if (data[`${moment}_seda`])     parts.push('🦷');
  if (data[`${moment}_enjuague`]) parts.push('💧');
  if (data[`${moment}_irrigador`]) parts.push('Irrigador');
  return parts.join(' ');
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

/**
 * Muestra el modal de seguimiento y retorna los extras al pulsar "Listo".
 */
export function showExtrasModal(moment) {
  return new Promise((resolve) => {
    const modal = byId('extras-modal');
    byId('extras-emoji').textContent  = moment === 'manana' ? '🌅' : '🌙';
    byId('extras-title').textContent  = moment === 'manana' ? 'Mañana registrado 🪥' : 'Noche registrada 🪥';

    // Resetear estado visual de los toggles
    modal.querySelectorAll('.extras-toggle').forEach((btn) => btn.classList.remove('selected'));

    // Escuchar clicks en los toggles (con AbortController para limpiar al cerrar)
    const ac = new AbortController();
    modal.querySelectorAll('.extras-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.extrasKey;
        const val = btn.dataset.value === 'true';
        modal.querySelectorAll(`[data-extras-key="${key}"]`).forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      }, { signal: ac.signal });
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    byId('extras-confirm').onclick = () => {
      const isSelected = (key) => Boolean(
        modal.querySelector(`.extras-toggle.selected[data-extras-key="${key}"][data-value="true"]`)
      );
      ac.abort();
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      resolve({
        seda: isSelected('seda'),
        enjuague: isSelected('enjuague'),
        irrigador: isSelected('irrigador'),
      });
    };
  });
}
