import { byId } from './dom.js';

let toastTimer = null;

export function showToast(msg, type = 'neutral') {
  const toast = byId('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type === 'success' ? 'success' : type === 'error' ? 'error' : ''}`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = 'toast';
  }, 2800);
}
