// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqZZMrOF9c4HmWTO4GfH9nXoRqBkqqJj0",
  authDomain: "kataloghijab76.firebaseapp.com",
  projectId: "kataloghijab76",
  storageBucket: "kataloghijab76.firebasestorage.app", // ❗️perhatikan ini
  messagingSenderId: "556973592313",
  appId: "1:556973592313:web:ad7e5da50938674324dc28",
};

// Inisialisasi Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
