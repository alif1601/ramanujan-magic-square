import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
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

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    msg.textContent = "Signing in...";
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        emailEl.value.trim(),
        passwordEl.value
      );

      const ok = await isAdmin(cred.user.uid);
      if (!ok) {
        msg.textContent = "Not authorized as admin.";
        return;
      }

      window.location.href = "./admin.html";
    } catch (err) {
      msg.textContent = err.message || "Login failed.";
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const ok = await isAdmin(user.uid);
  if (ok) {
    window.location.href = "./admin.html";
  }
});
