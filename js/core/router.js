import { $all, byId } from './dom.js';
import { setCurrentScreen } from './state.js';

let navigateHandler = null;

export function registerNavigateHandler(handler) {
  navigateHandler = handler;
}

export function showScreen(name) {
  $all('.screen').forEach((screen) => screen.classList.remove('active'));
  byId(`screen-${name}`)?.classList.add('active');

  $all('.nav-btn').forEach((btn) => btn.classList.remove('active'));
  byId(`nav-${name}`)?.classList.add('active');

  setCurrentScreen(name);
}

export async function navigate(name) {
  showScreen(name);
  if (navigateHandler) {
    await navigateHandler(name);
  }
}
