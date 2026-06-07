import { normalizeSession } from '../services/sessions.service.js';

export const state = {
  currentUser: null,
  todayData: normalizeSession(),
  partnerData: normalizeSession(),
  currentScreen: '',
};

export function setCurrentUser(user) {
  state.currentUser = user;
}

export function setTodayData(data = {}) {
  state.todayData = normalizeSession(data);
}

export function setPartnerData(data = {}) {
  state.partnerData = normalizeSession(data);
}

export function setCurrentScreen(screen) {
  state.currentScreen = screen;
}
