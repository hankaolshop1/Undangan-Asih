(() => {
  const stage = document.getElementById("stage");
  const pages = [...document.querySelectorAll(".page")];
  const cover = document.getElementById("cover");
  const openBtn = document.getElementById("openInvitation");
  const tabs = [...document.querySelectorAll(".tab")];
  const counter = document.getElementById("counter");
  const veil = document.getElementById("veil");
  const music = document.getElementById("weddingMusic");
  const musicBtn = document.getElementById("musicToggle");
  const KEY = "undangan-asih-page";
  let current = 0;
  let busy = false;

  // Nama tamu dari URL: ?to=Nama+Tamu
  const to = new URLSearchParams(location.search).get("to");
  if (to) document.getElementById("guestTo").textContent = to;

  // Kelopak berjatuhan
  const petals = document.getElementById("petals");
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("span");
    p.className = "petal" + (i % 3 === 0 ? " blue" : "");
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = 9 + Math.random() * 8 + "s";
    p.style.animationDelay = -Math.random() * 15 + "s";
    p.style.scale = (0.6 + Math.random() * 0.7).toFixed(2);
    petals.appendChild(p);
  }

  document.querySelectorAll(".page-petals").forEach((layer, pageIndex) => {
    for (let i = 0; i < 7; i++) {
      const petal = document.createElement("span");
      petal.className = "page-petal" + ((i + pageIndex) % 4 === 0 ? " blue" : "");
      petal.style.left = `${8 + Math.random() * 84}%`;
      petal.style.animationDuration = `${11 + Math.random() * 8}s`;
      petal.style.animationDelay = `${-(Math.random() * 14 + pageIndex * .7)}s`;
      petal.style.setProperty("--drift", `${-35 + Math.random() * 70}px`);
      petal.style.setProperty("--scale", `${(.55 + Math.random() * .55).toFixed(2)}`);
      layer.appendChild(petal);
    }
  });

  function updateUi() {
    tabs.forEach((t, i) => {
      const on = i === current;
      t.classList.toggle("on", on);
      if (on) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
    counter.innerHTML = `<b>${String(current + 1).padStart(2, "0")}</b> / ${String(pages.length).padStart(2, "0")}`;
    const iframe = pages[current].querySelector("iframe[data-src]");
    if (iframe && !iframe.src) iframe.src = iframe.dataset.src;
    try { localStorage.setItem(KEY, current); } catch {}
  }

  function show(i) {
    pages.forEach((p, k) => p.classList.toggle("is-active", k === i));
    current = i;
    updateUi();
  }

  function go(target) {
    if (busy || target === current || target < 0 || target >= pages.length) return;
    busy = true;
    const dir = target > current ? "next" : "prev";
    const from = pages[current];
    const toP = pages[target];

    toP.classList.remove("anim");
    toP.classList.add(dir === "next" ? "from-next" : "from-prev");
    void toP.offsetWidth;
    from.classList.add("anim");
    toP.classList.add("anim");
    requestAnimationFrame(() => {
      from.classList.add(dir === "next" ? "to-next" : "to-prev");
      from.classList.remove("is-active");
      toP.classList.remove("from-next", "from-prev");
      toP.classList.add("is-active");
      toP.querySelector(".page-inner").scrollTop = 0;
    });
    veil.classList.remove("go"); void veil.offsetWidth; veil.classList.add("go");

    current = target;
    updateUi();
    setTimeout(() => {
      from.classList.remove("anim", "to-next", "to-prev");
      busy = false;
    }, 1050);
  }

  tabs.forEach((t) => t.addEventListener("click", () => go(+t.dataset.go)));

  document.addEventListener("keydown", (e) => {
    if (!stage.classList.contains("ready")) return;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") go(current + 1);
    if (e.key === "ArrowLeft" || e.key === "PageUp") go(current - 1);
  });

  // Geser (swipe) tetap berfungsi di ponsel
  let sx = 0, sy = 0;
  stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (!stage.classList.contains("ready")) return;
    if (e.target.closest(".tabbar")) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  openBtn.addEventListener("click", () => {
    cover.classList.add("is-open");
    let saved = 0;
    try { saved = Math.min(pages.length - 1, parseInt(localStorage.getItem(KEY) || "0", 10) || 0); } catch {}
    show(saved);
    setTimeout(() => { stage.classList.add("ready"); }, 500);
    setTimeout(() => { cover.classList.add("is-gone"); }, 1900);
    music.play().then(() => musicBtn.classList.add("playing")).catch(() => {});
  });

  musicBtn.addEventListener("click", () => {
    if (music.paused) music.play().then(() => musicBtn.classList.add("playing")).catch(() => {});
    else { music.pause(); musicBtn.classList.remove("playing"); }
  });

  // Hitung mundur
  const target = new Date("2026-11-14T09:00:00+07:00").getTime();
  const ids = ["days", "hours", "minutes", "seconds"];
  function tick() {
    const r = Math.max(0, target - Date.now());
    [r / 864e5, (r / 36e5) % 24, (r / 6e4) % 60, (r / 1e3) % 60].forEach((v, i) => {
      document.getElementById(ids[i]).textContent = String(Math.floor(v)).padStart(2, "0");
    });
  }
  tick(); setInterval(tick, 1000);

  // Salin nomor rekening
  document.querySelectorAll(".copy-btn").forEach((b) => {
    b.addEventListener("click", async () => {
      const txt = b.textContent;
      try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "Tersalin ✓"; }
      catch { b.textContent = b.dataset.copy; }
      b.classList.add("ok");
      setTimeout(() => { b.textContent = txt; b.classList.remove("ok"); }, 1800);
    });
  });

  updateUi();
})();
