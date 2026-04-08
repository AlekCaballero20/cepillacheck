import { loginAs as signIn } from '../../services/auth.service.js';
import { showToast } from '../../core/toast.js';
import { setLoginLoading } from './login.ui.js';

export function bindLoginEvents() {
  document.querySelectorAll('[data-login-user]').forEach((button) => {
    button.addEventListener('click', async () => {
      const userId = button.dataset.loginUser;
      setLoginLoading(true);
      try {
        await signIn(userId);
      } catch (err) {
        setLoginLoading(false);
        const msg = err.code === 'auth/user-not-found'
          ? 'Usuario no encontrado. ¿Creaste los usuarios en Firebase Auth?'
          : err.code === 'auth/wrong-password'
            ? 'Contraseña incorrecta.'
            : `Error: ${err.message}`;
        showToast(msg, 'error');
      }
    });
  });
}

export function resetLoginState() {
  setLoginLoading(false);
}
