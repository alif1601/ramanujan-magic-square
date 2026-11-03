
import { db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  increment
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const statsRef = doc(db, "stats", "global");

// Count one browser profile once.
export async function trackVisitorOnce() {
  const visitorKey = "rms_visitor_counted_v1";

  // Already counted in this browser
  if (localStorage.getItem(visitorKey) === "1") {
    return;
  }

  // Increment without resetting existing statistics
  await setDoc(
    statsRef,
    {
      visitors: increment(1)
    },
    { merge: true }
  );

  // Save after successful Firestore write
  localStorage.setItem(visitorKey, "1");
}

// Track generated squares
export async function trackSquareGenerated() {
  await setDoc(
    statsRef,
    {
      squaresGenerated: increment(1)
    },
    { merge: true }
  );
}

// Track share-link actions
export async function trackShareLink() {
  await setDoc(
    statsRef,
    {
      shareLinks: increment(1)
    },
    { merge: true }
  );
}
