export const state = {
  currentUser: null,
  todayData: {
    manana: false,
    manana_seda: false,
    manana_enjuague: false,
    manana_irrigador: false,
    noche: false,
    noche_seda: false,
    noche_enjuague: false,
    noche_irrigador: false,
  },
  partnerData: {
    manana: false,
    manana_seda: false,
    manana_enjuague: false,
    manana_irrigador: false,
    noche: false,
    noche_seda: false,
    noche_enjuague: false,
    noche_irrigador: false,
  },
  currentScreen: '',
};

export function setCurrentUser(user) {
  state.currentUser = user;
}

export function setTodayData(data = {}) {
  state.todayData = {
    manana: Boolean(data.manana),
    manana_seda: Boolean(data.manana_seda),
    manana_enjuague: Boolean(data.manana_enjuague),
    manana_irrigador: Boolean(data.manana_irrigador),
    noche: Boolean(data.noche),
    noche_seda: Boolean(data.noche_seda),
    noche_enjuague: Boolean(data.noche_enjuague),
    noche_irrigador: Boolean(data.noche_irrigador),
  };
}

export function setPartnerData(data = {}) {
  state.partnerData = {
    manana: Boolean(data.manana),
    manana_seda: Boolean(data.manana_seda),
    manana_enjuague: Boolean(data.manana_enjuague),
    manana_irrigador: Boolean(data.manana_irrigador),
    noche: Boolean(data.noche),
    noche_seda: Boolean(data.noche_seda),
    noche_enjuague: Boolean(data.noche_enjuague),
    noche_irrigador: Boolean(data.noche_irrigador),
  };
}

export function setCurrentScreen(screen) {
  state.currentScreen = screen;
}
