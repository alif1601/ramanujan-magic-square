import { db } from "./firebase-config.js";
import {
  doc,
  runTransaction,
  increment,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const statsRef = doc(db, "stats", "global");

async function ensureStatsDoc() {
  await setDoc(statsRef, {
    visitors: 0,
    squaresGenerated: 0,
    shareLinks: 0
  }, { merge: true });
}

export async function trackVisitorOnce() {
  const key = "rms_visitor_counted_v1";
  if (localStorage.getItem(key)) return;

  await ensureStatsDoc();
  await setDoc(statsRef, { visitors: increment(1) }, { merge: true });
  localStorage.setItem(key, "1");
}

export async function trackSquareGenerated() {
  await ensureStatsDoc();
  await setDoc(statsRef, { squaresGenerated: increment(1) }, { merge: true });
}

export async function trackShareLink() {
  await ensureStatsDoc();
  await setDoc(statsRef, { shareLinks: increment(1) }, { merge: true });
}
