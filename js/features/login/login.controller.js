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

        let msg = `Error: ${err.message}`;
        const message = String(err.message || '');

        if (err.code === 'auth/user-not-found') {
          msg = 'Usuario no encontrado. Revisa si lo creaste en Firebase Auth.';
        } else if (err.code === 'auth/wrong-password') {
          msg = 'Contrasena incorrecta.';
        } else if (
          err.code === 'auth/invalid-credential'
          || err.code === 'auth/invalid-login-credentials'
          || message.includes('auth/invalid-credential')
        ) {
          msg = `No se pudo entrar como ${userId}. Revisa en Firebase Auth que exista ${userId}@cepillacheck.app y que la contrasena coincida con la del proyecto.`;
        }

        showToast(msg, 'error');
      }
    });
  });
}

export function resetLoginState() {
  setLoginLoading(false);
}
