import { formatDateLong, getTodayKey, isoNow } from '../../core/dates.js';
import { state, setPartnerData, setTodayData } from '../../core/state.js';
import { showToast } from '../../core/toast.js';
import { addBrushEvent, getTodaySession, saveTodaySession } from '../../services/sessions.service.js';
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
  const previous = { ...state.todayData };
  const label = moment === 'manana' ? 'Mañana' : 'Noche';

  if (!turningOn) {
    setTodayData({
      ...state.todayData,
      [moment]: false,
      [`${moment}_seda`]: false,
      [`${moment}_enjuague`]: false,
      [`${moment}_irrigador`]: false,
      [`${moment}_lengua`]: false,
      [`${moment}_sangrado`]: false,
      [`${moment}_mal_aliento`]: false,
      [`${moment}_sensibilidad`]: 0,
      [`${moment}_nota`]: '',
      [`${moment}_time`]: '',
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

  const modalResult = await showExtrasModal(moment, state.todayData);
  if (!modalResult) return;

  const performedAt = isoNow();
  setTodayData({
    ...state.todayData,
    [moment]: true,
    [`${moment}_time`]: performedAt,
    [`${moment}_seda`]: modalResult.seda,
    [`${moment}_enjuague`]: modalResult.enjuague,
    [`${moment}_irrigador`]: modalResult.irrigador,
    [`${moment}_fluor`]: modalResult.fluor,
    [`${moment}_lengua`]: modalResult.lengua,
    [`${moment}_sangrado`]: modalResult.sangrado,
    [`${moment}_mal_aliento`]: modalResult.mal_aliento,
    [`${moment}_sensibilidad`]: modalResult.sensibilidad,
    [`${moment}_duration`]: modalResult.duration,
    [`${moment}_nota`]: modalResult.nota,
  });
  renderBrushState(state.todayData);

  try {
    await saveTodaySession(state.currentUser.id, state.todayData);
    await addBrushEvent(state.currentUser.id, getTodayKey(), moment, { ...modalResult, performedAt });
    showToast(`¡${label} registrada! 🪥`, 'success');
  } catch {
    setTodayData(previous);
    renderBrushState(state.todayData);
    showToast('Sin conexión — intenta de nuevo', 'error');
  }
}
