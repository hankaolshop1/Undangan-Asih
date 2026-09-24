(() => {
  const stage = document.getElementById("stage");
  const pages = [...document.querySelectorAll(".page")];
  const cover = document.getElementById("cover");
  const openBtn = document.getElementById("openInvitation");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsWrap = document.getElementById("dots");
  const counter = document.getElementById("counter");
  const label = document.getElementById("pageLabel");
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
  for (let i = 0; i < 16; i++) {
    const p = document.createElement("span");
    p.className = "petal" + (i % 3 === 0 ? " blue" : "");
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = 9 + Math.random() * 8 + "s";
    p.style.animationDelay = -Math.random() * 15 + "s";
    p.style.scale = (0.6 + Math.random() * 0.7).toFixed(2);
    petals.appendChild(p);
  }

  // Titik navigasi
  pages.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = "dot";
    d.setAttribute("aria-label", "Halaman " + (i + 1));
    d.addEventListener("click", () => go(i));
    dotsWrap.appendChild(d);
  });
  const dots = [...dotsWrap.children];

  function updateUi() {
    dots.forEach((d, i) => d.classList.toggle("on", i === current));
    counter.innerHTML = `<b>${String(current + 1).padStart(2, "0")}</b> / ${String(pages.length).padStart(2, "0")}`;
    label.textContent = pages[current].dataset.label;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === pages.length - 1;
    // Muat peta hanya saat halaman lokasi dibuka
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
    const to = pages[target];
    document.getElementById("swipeHint").classList.remove("show");

    to.classList.remove("anim");
    to.classList.add(dir === "next" ? "from-next" : "from-prev");
    void to.offsetWidth; // reflow
    from.classList.add("anim");
    to.classList.add("anim");
    requestAnimationFrame(() => {
      from.classList.add(dir === "next" ? "to-next" : "to-prev");
      from.classList.remove("is-active");
      to.classList.remove("from-next", "from-prev");
      to.classList.add("is-active");
      to.querySelector(".page-inner").scrollTop = 0;
    });
    veil.classList.remove("go"); void veil.offsetWidth; veil.classList.add("go");

    current = target;
    updateUi();
    setTimeout(() => {
      from.classList.remove("anim", "to-next", "to-prev");
      busy = false;
    }, 1050);
  }

  prevBtn.addEventListener("click", () => go(current - 1));
  nextBtn.addEventListener("click", () => go(current + 1));

  document.addEventListener("keydown", (e) => {
    if (!stage.classList.contains("ready")) return;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") go(current + 1);
    if (e.key === "ArrowLeft" || e.key === "PageUp") go(current - 1);
  });

  // Geser (swipe) di ponsel
  let sx = 0, sy = 0;
  stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (!stage.classList.contains("ready")) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // Membuka sampul (pintu)
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
      try {
        await navigator.clipboard.writeText(b.dataset.copy);
        b.textContent = "Tersalin ✓";
      } catch {
        b.textContent = b.dataset.copy;
      }
      b.classList.add("ok");
      setTimeout(() => { b.textContent = txt; b.classList.remove("ok"); }, 1800);
    });
  });

  updateUi();
})();
