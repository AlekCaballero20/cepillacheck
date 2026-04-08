import { byId } from '../../core/dom.js';

export function setLoginLoading(isVisible) {
  byId('login-loading').classList.toggle('visible', isVisible);
}
