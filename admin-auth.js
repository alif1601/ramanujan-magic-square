import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const msg = document.getElementById("msg");

async function isAdmin(uid) {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists() && snap.data().active === true;
}

function humanizeAuthError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email format.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      return "Login failed. Please try again.";
  }
}

loginBtn?.addEventListener("click", async () => {
  msg.textContent = "Signing in...";
  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      emailEl.value.trim(),
      passwordEl.value
    );

    const ok = await isAdmin(cred.user.uid);
    if (!ok) {
      await signOut(auth);
      msg.textContent = "This account is not authorized as admin.";
      return;
    }

    window.location.href = "./admin.html";
  } catch (err) {
    msg.textContent = humanizeAuthError(err.code);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const ok = await isAdmin(user.uid);
  if (ok) window.location.href = "./admin.html";
});
