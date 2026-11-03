
import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  doc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Dashboard elements
const visitorsEl = document.getElementById("visitors");
const squaresEl = document.getElementById("squares");
const sharesEl = document.getElementById("shares");

const adminMsg = document.getElementById("adminMsg");
const logoutBtn = document.getElementById("logoutBtn");

// Analytics elements
const analyticsVisitors =
  document.getElementById("analyticsVisitors");

const analyticsSquares =
  document.getElementById("analyticsSquares");

const analyticsShares =
  document.getElementById("analyticsShares");

// Verify admin access
async function isAdmin(uid) {
  const snap = await getDoc(doc(db, "admins", uid));

  return snap.exists() && snap.data().active === true;
}

// REAL-TIME FIRESTORE LISTENER
function listenStats() {
  const statsRef = doc(db, "stats", "global");

  return onSnapshot(
    statsRef,

    (snap) => {
      const data = snap.exists() ? snap.data() : {};

      const visitors = data.visitors ?? 0;
      const squares = data.squaresGenerated ?? 0;
      const shares = data.shareLinks ?? 0;

      // Dashboard update
      visitorsEl.textContent = visitors;
      squaresEl.textContent = squares;
      sharesEl.textContent = shares;

      // Analytics update
      if (analyticsVisitors) {
        analyticsVisitors.textContent = visitors;
      }

      if (analyticsSquares) {
        analyticsSquares.textContent = squares;
      }

      if (analyticsShares) {
        analyticsShares.textContent = shares;
      }

      console.log("Live stats updated:", {
        visitors,
        squares,
        shares
      });
    },

    (error) => {
      console.error("Firestore listener error:", error);

      adminMsg.textContent =
        "Live statistics unavailable. Check Firestore Rules.";
    }
  );
}

// Sidebar navigation
function setupSidebarTabs() {
  const links = document.querySelectorAll(
    ".sidebar nav a[data-section]"
  );

  const sections = document.querySelectorAll(
    ".panel-section"
  );

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const target = link.dataset.section;

      links.forEach((item) =>
        item.classList.remove("active")
      );

      link.classList.add("active");

      sections.forEach((section) =>
        section.classList.remove("active")
      );

      document
        .getElementById(`section-${target}`)
        ?.classList.add("active");
    });
  });
}

// Authentication
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./admin-login.html";
    return;
  }

  try {
    const authorized = await isAdmin(user.uid);

    if (!authorized) {
      await signOut(auth);
      window.location.href = "./admin-login.html";
      return;
    }

    adminMsg.textContent = `Logged in as ${user.email}`;

    setupSidebarTabs();

    // Start real-time updates
    listenStats();

  } catch (error) {
    console.error("Admin initialization error:", error);

    adminMsg.textContent =
      "Admin initialization failed. Check Console.";
  }
});

// Logout
logoutBtn?.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    await signOut(auth);
    window.location.href = "./admin-login.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
});
