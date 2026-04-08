export const USERS = {
  'alek@cepillacheck.app': {
    id: 'alek',
    nombre: 'Alek',
    password: 'Alek@CC2024',
    partner: 'cata',
  },
  'cata@cepillacheck.app': {
    id: 'cata',
    nombre: 'Cata',
    password: 'Cata@CC2024',
    partner: 'alek',
  },
};

export function getUserById(userId) {
  return USERS[`${userId}@cepillacheck.app`] ?? null;
}
