export const firebaseConfig = {
  apiKey: "AIzaSyCSyA6y3WsKe_M5rdNeqmV4eFjD_k98Gmc",
  authDomain: "seguimiento-dientes-ac.firebaseapp.com",
  projectId: "seguimiento-dientes-ac",
  storageBucket: "seguimiento-dientes-ac.firebasestorage.app",
  messagingSenderId: "211553558762",
  appId: "1:211553558762:web:f6e4018f69ad858e387793",
};

if (!window.firebase?.apps?.length) {
  window.firebase.initializeApp(firebaseConfig);
}

export const firebase = window.firebase;
export const auth = firebase.auth();
export const db = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
