import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCvizPvVLHUkmoFD1zq39kfyz3eEm7Zn6Q",
  authDomain: "rentease-8c021.firebaseapp.com",
  projectId: "rentease-8c021",
  storageBucket: "rentease-8c021.firebasestorage.app",
  messagingSenderId: "746827385607",
  appId: "1:746827385607:web:9a9ee4333d3f25422293a2",
};

const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

export default app;