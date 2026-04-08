import { formatDateLong } from '../../core/dates.js';
import { state, setPartnerData, setTodayData } from '../../core/state.js';
import { showToast } from '../../core/toast.js';
import { getTodaySession, saveTodaySession } from '../../services/sessions.service.js';
import { calcStreaks } from '../../services/stats.service.js';
import { renderBrushState, renderDashboardHeader, renderDashboardStreaks, renderPartnerState } from './dashboard.ui.js';

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

  const previous = { ...state.todayData };
  setTodayData({
    ...state.todayData,
    [moment]: !state.todayData[moment],
  });
  renderBrushState(state.todayData);

  try {
    await saveTodaySession(state.currentUser.id, state.todayData);
    const label = moment === 'manana' ? 'Mañana' : 'Noche';
    showToast(state.todayData[moment] ? `¡${label} registrado! 🪥` : 'Registro eliminado', state.todayData[moment] ? 'success' : 'neutral');
  } catch (error) {
    setTodayData(previous);
    renderBrushState(state.todayData);
    showToast('Sin conexión — intenta de nuevo', 'error');
  }
}
