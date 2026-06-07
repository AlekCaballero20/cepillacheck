import { byId } from '../../core/dom.js';
import { monthInputValue, parseMonthInput } from '../../core/dates.js';
import { state } from '../../core/state.js';
import { getStatsSnapshot } from '../../services/stats.service.js';
import { renderComparison, renderExtrasStats, renderHabits, renderHeatCalendar, renderInsight, renderStatsHeader, renderWeeklyBars } from './stats.ui.js';

let bound = false;

export function bindStatsEvents() {
  if (bound) return;
  bound = true;
  byId('stats-month')?.addEventListener('change', loadStats);
}

export async function loadStats() {
  if (!state.currentUser) return;

  const monthInput = byId('stats-month');
  if (!monthInput.value) monthInput.value = monthInputValue();
  const { year, month } = parseMonthInput(monthInput.value);

  const snapshot = await getStatsSnapshot(state.currentUser.id, year, month);
  renderStatsHeader(snapshot.streaks, snapshot.currentAnalysis);
  renderInsight(snapshot.currentAnalysis);
  renderComparison(snapshot.comparison);
  renderHabits(snapshot.currentAnalysis);
  renderExtrasStats(snapshot.extras);
  renderWeeklyBars(snapshot.currentAnalysis.weekStats);
  renderHeatCalendar(year, month, snapshot.monthData.alek, snapshot.monthData.cata);
}
