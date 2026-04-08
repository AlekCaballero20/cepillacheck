import { auth } from '../config/firebase.js';
import { USERS, getUserById } from '../constants/users.js';

export function onAuthChanged(handler) {
  return auth.onAuthStateChanged(handler);
}

export async function loginAs(userId) {
  const email = `${userId}@cepillacheck.app`;
  const user = USERS[email];
  if (!user) {
    throw new Error('Usuario no válido');
  }

  await auth.signInWithEmailAndPassword(email, user.password);
}

export async function logout() {
  await auth.signOut();
}

export function resolveCurrentUser(firebaseUser) {
  return firebaseUser?.email ? getUserById(firebaseUser.email.split('@')[0]) ?? USERS[firebaseUser.email] ?? null : null;
}
