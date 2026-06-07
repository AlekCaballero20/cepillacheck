import { byId } from '../../core/dom.js';
import { formatTimeFromISO } from '../../core/dates.js';
import { calculateDayScore, getScoreLabel } from '../../services/stats.service.js';

export function renderDashboardHeader(user, formattedDate) {
  const avatar = byId('dash-avatar');
  avatar.textContent = user.nombre[0];
  avatar.className = `dash-avatar avatar-${user.id}`;
  byId('dash-name').textContent = `Hola, ${user.nombre} 👋`;
  byId('dash-date').textContent = formattedDate;
}

export function renderBrushState(todayData) {
  ['manana', 'noche'].forEach((moment) => {
    const btn = byId(`btn-${moment}`);
    const sts = byId(`status-${moment}`);
    btn.classList.toggle('done', Boolean(todayData[moment]));
    const time = formatTimeFromISO(todayData[`${moment}_time`]);
    sts.textContent = todayData[moment] ? `✓ ${time}` : 'Pendiente';
    byId(`extras-${moment}`).textContent = buildExtrasLabel(todayData, moment);
  });

  const sub = byId('dash-cta-sub');
  const both = todayData.manana && todayData.noche;
  const none = !todayData.manana && !todayData.noche;
  sub.textContent = both ? 'Completaste los dos cepillados de hoy 🎉' : none ? 'Registra tus cepillados de hoy' : 'Ya falta solo uno, qué epopeya tan dental';
  sub.className = both ? 'all-done' : '';
  renderTodayScore(todayData);
  renderDailyActions(todayData);
}

export function renderTodayScore(todayData) {
  const score = calculateDayScore(todayData);
  const label = getScoreLabel(score);
  byId('today-score').textContent = score;
  byId('dash-score-mini-num').textContent = score;
  byId('today-score-title').textContent = label.title;
  byId('today-score-desc').textContent = label.desc;
  byId('today-score-ring').style.setProperty('--score', `${score}%`);
}

function buildExtrasLabel(data, moment) {
  if (!data[moment]) return '';
  const parts = [];
  if (data[`${moment}_seda`]) parts.push('🦷');
  if (data[`${moment}_enjuague`]) parts.push('💧');
  if (data[`${moment}_irrigador`]) parts.push('🌊');
  if (data[`${moment}_lengua`]) parts.push('👅');
  if (Number(data[`${moment}_duration`] ?? 0) >= 120) parts.push('⏱️');
  if (data[`${moment}_sangrado`] || data[`${moment}_mal_aliento`] || Number(data[`${moment}_sensibilidad`] ?? 0) > 0) parts.push('⚠️');
  return parts.join(' ');
}

function renderDailyActions(data) {
  const actions = [];
  if (!data.manana) actions.push('Registrar cepillado de la mañana.');
  if (!data.noche) actions.push('Registrar cepillado de la noche.');
  if ((data.manana || data.noche) && !data.manana_seda && !data.noche_seda) actions.push('Aún no hay seda dental registrada hoy.');
  if ((data.manana || data.noche) && !data.manana_lengua && !data.noche_lengua) actions.push('Falta registrar limpieza de lengua.');
  if (data.manana_sangrado || data.noche_sangrado || data.manana_sensibilidad > 0 || data.noche_sensibilidad > 0) actions.push('Hay señales reportadas; déjalas trazadas en Cuidado si quieres seguimiento fino.');
  if (!actions.length) actions.push('Todo al día. Qué milagro administrativo de la boca.');

  byId('daily-actions').innerHTML = actions.map((item) => `<div class="action-item">${item}</div>`).join('');
}

export function renderPartnerState(partnerName, partnerData) {
  byId('partner-label').textContent = `Estado de ${partnerName} hoy`;

  ['manana', 'noche'].forEach((moment) => {
    const item = byId(`partner-${moment}`);
    item.querySelector('.pi-state').textContent = partnerData[moment] ? '✓' : '—';
    item.className = `partner-item ${partnerData[moment] ? 'done' : ''}`.trim();
  });

  const score = calculateDayScore(partnerData);
  const scoreItem = byId('partner-score');
  scoreItem.querySelector('.pi-state').textContent = `${score}`;
  scoreItem.className = `partner-item ${score >= 75 ? 'done' : ''}`.trim();
}

export function renderDashboardStreaks(streaks) {
  byId('streak-current').textContent = streaks.current;
  byId('streak-max').textContent = streaks.max;
}

export function showExtrasModal(moment, existing = {}) {
  return new Promise((resolve) => {
    const modal = byId('extras-modal');
    const durationLabel = byId('extras-duration-label');
    const sensitivity = byId('extras-sensitivity');
    const sensitivityLabel = byId('extras-sensitivity-label');
    const note = byId('extras-note');
    let duration = Number(existing[`${moment}_duration`] ?? 120);

    const renderDuration = () => {
      const minutes = Math.floor(duration / 60);
      const seconds = String(duration % 60).padStart(2, '0');
      durationLabel.textContent = `${minutes}:${seconds}`;
    };

    byId('extras-emoji').textContent = moment === 'manana' ? '🌅' : '🌙';
    byId('extras-title').textContent = moment === 'manana' ? 'Mañana registrada 🪥' : 'Noche registrada 🪥';
    note.value = existing[`${moment}_nota`] ?? '';
    sensitivity.value = existing[`${moment}_sensibilidad`] ?? 0;
    sensitivityLabel.textContent = sensitivity.value;
    renderDuration();

    const ac = new AbortController();
    const boolKeys = ['seda', 'enjuague', 'irrigador', 'fluor', 'lengua', 'sangrado', 'mal_aliento'];

    modal.querySelectorAll('.extras-toggle').forEach((btn) => {
      const key = btn.dataset.extrasKey;
      const value = btn.dataset.value === 'true';
      const current = existing[`${moment}_${key}`];
      btn.classList.toggle('selected', current === value || (current === undefined && key === 'fluor' && value));
      btn.addEventListener('click', () => {
        modal.querySelectorAll(`[data-extras-key="${key}"]`).forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      }, { signal: ac.signal });
    });

    modal.querySelectorAll('[data-duration-delta]').forEach((btn) => {
      btn.addEventListener('click', () => {
        duration = Math.min(900, Math.max(15, duration + Number(btn.dataset.durationDelta)));
        renderDuration();
      }, { signal: ac.signal });
    });

    sensitivity.addEventListener('input', () => {
      sensitivityLabel.textContent = sensitivity.value;
    }, { signal: ac.signal });

    const close = (value) => {
      ac.abort();
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      resolve(value);
    };

    byId('extras-cancel').onclick = () => close(null);
    byId('extras-confirm').onclick = () => {
      const result = { duration, sensibilidad: Number(sensitivity.value), nota: note.value.trim() };
      boolKeys.forEach((key) => {
        const selected = modal.querySelector(`.extras-toggle.selected[data-extras-key="${key}"]`);
        result[key] = selected ? selected.dataset.value === 'true' : false;
      });
      close(result);
    };

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  });
}
