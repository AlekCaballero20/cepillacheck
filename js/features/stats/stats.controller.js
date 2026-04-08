import { state } from '../../core/state.js';
import { getStatsSnapshot } from '../../services/stats.service.js';
import { renderComparison, renderHeatCalendar, renderStatsHeader } from './stats.ui.js';

export async function loadStats() {
  if (!state.currentUser) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const snapshot = await getStatsSnapshot(state.currentUser.id, year, month);
  renderStatsHeader(snapshot.streaks, snapshot.currentPct);
  renderComparison(snapshot.comparison);
  renderHeatCalendar(year, month, snapshot.monthData.alek, snapshot.monthData.cata);
}
