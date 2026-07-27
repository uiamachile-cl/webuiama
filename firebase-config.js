/**
 * UIAMA CHILE - FIREBASE CLOUD CONFIGURATION & REALTIME SYNC
 * 
 * Reemplaza las credenciales de abajo por las de tu proyecto gratuito en Firebase Console (https://console.firebase.google.com).
 * Mientras tanto, la aplicación utiliza una arquitectura HÍBRIDA:
 * 1. Intenta conectarse a Firestore en la nube para sincronizar a todos los usuarios del mundo.
 * 2. Si no hay conexión o proyecto creado, opera de forma 100% autónoma en LocalStorage.
 */

window.firebaseConfig = {
  apiKey: "AIzaSyDemoKey_UIAMA_CHILE_2026",
  authDomain: "uiama-chile-app.firebaseapp.com",
  projectId: "uiama-chile-app",
  storageBucket: "uiama-chile-app.appspot.com",
  messagingSenderId: "102938475612",
  appId: "1:102938475612:web:uiamachile2026"
};
