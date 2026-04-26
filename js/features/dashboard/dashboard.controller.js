import { formatDateLong } from '../../core/dates.js';
import { state, setPartnerData, setTodayData } from '../../core/state.js';
import { showToast } from '../../core/toast.js';
import { getTodaySession, saveTodaySession } from '../../services/sessions.service.js';
import { calcStreaks } from '../../services/stats.service.js';
import { renderBrushState, renderDashboardHeader, renderDashboardStreaks, renderPartnerState, showExtrasModal } from './dashboard.ui.js';

export async function loadDashboard() {
  if (!state.currentUser) return;

  renderDashboardHeader(state.currentUser, formatDateLong());

  const todayData = await getTodaySession(state.currentUser.id);
  setTodayData(todayData);
  renderBrushState(state.todayData);

  const partnerId = state.currentUser.partner;
  const partnerData = await getTodaySession(partnerId);
  setPartnerData(partnerData);
  renderPartnerState(partnerId === 'cata' ? 'Cata' : 'Alek', state.partnerData);

  const streaks = await calcStreaks(state.currentUser.id);
  renderDashboardStreaks(streaks);
}

export function bindDashboardEvents() {
  document.querySelectorAll('[data-brush-moment]').forEach((button) => {
    button.addEventListener('click', async () => {
      await toggleBrush(button.dataset.brushMoment);
    });
  });
}

export async function toggleBrush(moment) {
  if (!state.currentUser) return;

  const turningOn = !state.todayData[moment];
  const previous  = { ...state.todayData };
  const label     = moment === 'manana' ? 'Mañana' : 'Noche';

  if (!turningOn) {
    // Desactivar: limpiar cepillado + extras del mismo momento
    setTodayData({
      ...state.todayData,
      [moment]:                  false,
      [`${moment}_seda`]:        false,
      [`${moment}_enjuague`]:    false,
      [`${moment}_irrigador`]:   false,
    });
    renderBrushState(state.todayData);
    try {
      await saveTodaySession(state.currentUser.id, state.todayData);
      showToast('Registro eliminado', 'neutral');
    } catch {
      setTodayData(previous);
      renderBrushState(state.todayData);
      showToast('Sin conexión — intenta de nuevo', 'error');
    }
    return;
  }

  // Activar: marcar cepillado y mostrar preguntas de seguimiento
  setTodayData({ ...state.todayData, [moment]: true, [`${moment}_seda`]: false, [`${moment}_enjuague`]: false, [`${moment}_irrigador`]: false });
  renderBrushState(state.todayData);

  const extras = await showExtrasModal(moment);

  setTodayData({
    ...state.todayData,
    [`${moment}_seda`]: extras.seda,
    [`${moment}_enjuague`]: extras.enjuague,
    [`${moment}_irrigador`]: extras.irrigador,
  });
  renderBrushState(state.todayData);

  try {
    await saveTodaySession(state.currentUser.id, state.todayData);
    showToast(`¡${label} registrado! 🪥`, 'success');
  } catch {
    setTodayData(previous);
    renderBrushState(state.todayData);
    showToast('Sin conexión — intenta de nuevo', 'error');
  }
}
