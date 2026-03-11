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

const analyticsVisitors = document.getElementById("analyticsVisitors");
const analyticsSquares = document.getElementById("analyticsSquares");
const analyticsShares = document.getElementById("analyticsShares");

async function isAdmin(uid) {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists() && snap.data().active === true;
}

async function loadStats() {
  const snap = await getDoc(doc(db, "stats", "global"));
  if (!snap.exists()) return;

  const data = snap.data();

  const visitors = data.visitors ?? 0;
  const squares = data.squaresGenerated ?? 0;
  const shares = data.shareLinks ?? 0;

  visitorsEl.textContent = visitors;
  squaresEl.textContent = squares;
  sharesEl.textContent = shares;

  if (analyticsVisitors) analyticsVisitors.textContent = visitors;
  if (analyticsSquares) analyticsSquares.textContent = squares;
  if (analyticsShares) analyticsShares.textContent = shares;
}

function setupSidebarTabs() {
  const links = document.querySelectorAll(".sidebar nav a[data-section]");
  const sections = document.querySelectorAll(".panel-section");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const target = link.dataset.section;

      links.forEach(a => a.classList.remove("active"));
      link.classList.add("active");

      sections.forEach(section => section.classList.remove("active"));
      document.getElementById(`section-${target}`)?.classList.add("active");
    });
  });
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

  adminMsg.textContent = `Logged in as ${user.email}`;
  await loadStats();
  setupSidebarTabs();
});

logoutBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = "./admin-login.html";
});
