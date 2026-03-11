// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDNU6W9kwEZiRyKZry5Fnqn5SZRNvrZBZ0",
  authDomain: "ramanujan-magic-square.firebaseapp.com",
  projectId: "ramanujan-magic-square",
  storageBucket: "ramanujan-magic-square.firebasestorage.app",
  messagingSenderId: "900356184530",
  appId: "1:900356184530:web:9eecb08e24d50cd409100b",
  measurementId: "G-GFSKWC41RL"
};

const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

 
