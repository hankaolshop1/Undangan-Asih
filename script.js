import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const targetDate = new Date("2026-11-14T09:00:00+07:00").getTime();
const ids = ["days", "hours", "minutes", "seconds"];
const cover = document.getElementById("invitationCover");
const openButton = document.getElementById("openInvitation");
const music = document.getElementById("weddingMusic");
const musicToggle = document.getElementById("musicToggle");
const guestbookForm = document.getElementById("guestbookForm");
const guestbookList = document.getElementById("guestbookList");
const guestbookSubmit = document.getElementById("guestbookSubmit");
const formStatus = document.getElementById("formStatus");

function updateCountdown() {
  const remaining = Math.max(0, targetDate - Date.now());
  const units = [
    Math.floor(remaining / 86400000),
    Math.floor((remaining / 3600000) % 24),
    Math.floor((remaining / 60000) % 60),
    Math.floor((remaining / 1000) % 60),
  ];
  ids.forEach((id, index) => {
    document.getElementById(id).textContent = String(units[index]).padStart(2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

document.body.classList.add("no-scroll");

openButton.addEventListener("click", () => {
  cover.classList.add("is-open");
  document.body.classList.remove("no-scroll");
  musicToggle.classList.add("is-visible");
  music.play().catch(() => {
    musicToggle.setAttribute("aria-label", "Putar musik");
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.classList.add("is-muted");
  });
});

musicToggle.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    musicToggle.setAttribute("aria-label", "Matikan musik");
    musicToggle.setAttribute("aria-pressed", "true");
    musicToggle.classList.remove("is-muted");
  } else {
    music.pause();
    musicToggle.setAttribute("aria-label", "Putar musik");
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.classList.add("is-muted");
  }
});

const hasFirebaseConfig = !Object.values(firebaseConfig).some((value) => value.includes("GANTI_DENGAN"));

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "Baru saja";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(timestamp.toDate());
}

function renderGuestbook(entries) {
  if (!entries.length) {
    guestbookList.innerHTML = '<p class="guestbook-loading">Jadilah tamu pertama yang mengirim ucapan.</p>';
    return;
  }

  guestbookList.innerHTML = entries.map(({ name, message, attendance, createdAt }) => `
    <article class="guest-message">
      <div class="guest-message-head">
        <strong>${escapeHtml(name)}</strong>
        <span class="attendance ${attendance === "hadir" ? "present" : "absent"}">${attendance === "hadir" ? "Akan hadir" : "Belum bisa hadir"}</span>
      </div>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      <time>${formatDate(createdAt)}</time>
    </article>
  `).join("");
}

function initializeGuestbook() {
  if (!hasFirebaseConfig) {
    guestbookList.innerHTML = '<p class="guestbook-loading">Buku tamu akan aktif setelah Firebase dikonfigurasi.</p>';
    formStatus.textContent = "Konfigurasi Firebase belum diisi.";
    return;
  }

  const app = initializeApp(firebaseConfig);
  const database = getFirestore(app);
  const entriesQuery = query(collection(database, "guestbook"), orderBy("createdAt", "desc"), limit(50));

  onSnapshot(entriesQuery, (snapshot) => {
    renderGuestbook(snapshot.docs.map((document) => document.data()));
  }, () => {
    guestbookList.innerHTML = '<p class="guestbook-loading">Ucapan belum dapat dimuat. Silakan coba lagi nanti.</p>';
  });

  guestbookForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(guestbookForm);
    const name = formData.get("name").trim();
    const message = formData.get("message").trim();
    const attendance = formData.get("attendance");
    if (!name || !message) return;

    guestbookSubmit.disabled = true;
    formStatus.textContent = "Mengirim ucapan...";
    try {
      await addDoc(collection(database, "guestbook"), { name, message, attendance, createdAt: serverTimestamp() });
      guestbookForm.reset();
      formStatus.textContent = "Terima kasih, ucapan Anda sudah terkirim.";
    } catch {
      formStatus.textContent = "Ucapan belum terkirim. Silakan coba lagi.";
    } finally {
      guestbookSubmit.disabled = false;
    }
  });
}

initializeGuestbook();

const revealSections = document.querySelectorAll("main section:not(.hero)");
revealSections.forEach((section) => section.classList.add("reveal-section"));
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealSections.forEach((section) => revealObserver.observe(section));
