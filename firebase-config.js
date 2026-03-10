// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNU6W9kwEZiRyKZry5Fnqn5SZRNvrZBZ0",
  authDomain: "ramanujan-magic-square.firebaseapp.com",
  projectId: "ramanujan-magic-square",
  storageBucket: "ramanujan-magic-square.firebasestorage.app",
  messagingSenderId: "900356184530",
  appId: "1:900356184530:web:9eecb08e24d50cd409100b",
  measurementId: "G-GFSKWC41RL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
