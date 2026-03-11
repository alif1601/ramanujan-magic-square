import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const visitorsEl = document.getElementById("visitors");
const squaresEl = document.getElementById("squares");
const sharesEl = document.getElementById("shares");
const adminMsg = document.getElementById("adminMsg");
const logoutBtn = document.getElementById("logoutBtn");

async function isAdmin(uid) {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists() && snap.data().active === true;
}

async function loadStats() {
  const snap = await getDoc(doc(db, "stats", "global"));

  if (!snap.exists()) {
    adminMsg.textContent = "Logged in, but stats/global document was not found.";
    return;
  }

  const data = snap.data();
  visitorsEl.textContent = data.visitors ?? 0;
  squaresEl.textContent = data.squaresGenerated ?? 0;
  sharesEl.textContent = data.shareLinks ?? 0;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./admin-login.html";
    return;
  }

  const ok = await isAdmin(user.uid);

  if (!ok) {
    await signOut(auth);
    window.location.href = "./admin-login.html";
    return;
  }

  adminMsg.textContent = `Logged in as ${user.email} | UID: ${user.uid}`;
  await loadStats();
});

logoutBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = "./admin-login.html";
});
