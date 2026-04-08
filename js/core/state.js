export const state = {
  currentUser: null,
  todayData: { manana: false, noche: false },
  partnerData: { manana: false, noche: false },
  currentScreen: '',
};

export function setCurrentUser(user) {
  state.currentUser = user;
}

export function setTodayData(data = {}) {
  state.todayData = {
    manana: Boolean(data.manana),
    noche: Boolean(data.noche),
  };
}

export function setPartnerData(data = {}) {
  state.partnerData = {
    manana: Boolean(data.manana),
    noche: Boolean(data.noche),
  };
}

export function setCurrentScreen(screen) {
  state.currentScreen = screen;
}
