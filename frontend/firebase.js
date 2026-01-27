// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "fletto-food-delivery-website.firebaseapp.com",
  projectId: "fletto-food-delivery-website",
  storageBucket: "fletto-food-delivery-website.firebasestorage.app",
  messagingSenderId: "1054536322198",
  appId: "1:1054536322198:web:54d2a1fcba7c579a9a46b7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
