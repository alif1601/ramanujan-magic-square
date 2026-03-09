function buildNav() {
  if (document.querySelector(".top-nav")) return;

  const nav = document.createElement("nav");
  nav.className = "top-nav";
  nav.innerHTML = `
    <div class="top-nav-inner">
      <a class="top-nav-brand" href="./index.html">🎩 Ramanujan Magic Square</a>
      <div class="top-nav-links">
        <a class="top-nav-link ${currentPath.endsWith('/index.html') || currentPath.endsWith('/ramanujan-magic-square/') ? 'active' : ''}" href="./index.html">Home</a>
        <a class="top-nav-link ${currentPath.endsWith('/about.html') ? 'active' : ''}" href="./about.html">About</a>
        <a class="top-nav-link ${currentPath.endsWith('/developer.html') ? 'active' : ''}" href="./developer.html">Developer</a>
      </div>
    </div>
  `;
  document.body.prepend(nav);
}
(function () {
  const currentPath = window.location.pathname;

  function buildNav() {
    const nav = document.createElement("nav");
    nav.className = "top-nav";
    nav.innerHTML = `
      <div class="top-nav-inner">
        <a class="top-nav-brand" href="./index.html">🎩 Ramanujan Magic Square</a>
        <div class="top-nav-links">
          <a class="top-nav-link ${currentPath.endsWith('/index.html') || currentPath.endsWith('/ramanujan-magic-square/') ? 'active' : ''}" href="./index.html">Home</a>
          <a class="top-nav-link ${currentPath.endsWith('/about.html') ? 'active' : ''}" href="./about.html">About</a>
          <a class="top-nav-link ${currentPath.endsWith('/developer.html') ? 'active' : ''}" href="./developer.html">Developer</a>
        </div>
      </div>
    `;
    document.body.prepend(nav);
  }

  function buildFloatingShare() {
    const wrap = document.createElement("div");
    wrap.className = "floating-share";
    wrap.innerHTML = `
      <button class="floating-share-btn" id="floatingShareBtn" type="button" aria-label="Share">↗</button>
      <div class="floating-share-menu" id="floatingShareMenu">
        <button class="share-menu-btn" data-share="facebook" type="button">Share on Facebook</button>
        <button class="share-menu-btn" data-share="linkedin" type="button">Share on LinkedIn</button>
        <button class="share-menu-btn" data-share="whatsapp" type="button">Share on WhatsApp</button>
        <button class="share-menu-btn" data-share="copy" type="button">Copy page link</button>
      </div>
    `;
    document.body.appendChild(wrap);

    const btn = wrap.querySelector("#floatingShareBtn");
    const menu = wrap.querySelector("#floatingShareMenu");

    btn.addEventListener("click", () => {
      wrap.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove("open");
      }
    });

    menu.addEventListener("click", async (e) => {
      const target = e.target.closest("[data-share]");
      if (!target) return;

      const pageUrl = window.location.href;
      const title = document.title;
      const shareType = target.getAttribute("data-share");

      if (shareType === "facebook") {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }

      if (shareType === "linkedin") {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }

      if (shareType === "whatsapp") {
        const text = `${title} - ${pageUrl}`;
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }

      if (shareType === "copy") {
        try {
          await navigator.clipboard.writeText(pageUrl);
          showMiniToast("Link copied!");
        } catch {
          showMiniToast("Copy failed!");
        }
      }

      wrap.classList.remove("open");
    });
  }

  function showMiniToast(text) {
    const toast = document.createElement("div");
    toast.textContent = text;
    toast.style.position = "fixed";
    toast.style.left = "50%";
    toast.style.bottom = "88px";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#121b2f";
    toast.style.color = "#e8eeff";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "10px";
    toast.style.fontSize = "13px";
    toast.style.border = "1px solid rgba(255,255,255,.10)";
    toast.style.boxShadow = "0 10px 24px rgba(0,0,0,.28)";
    toast.style.zIndex = "1000";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  buildNav();
  buildFloatingShare();
})();
