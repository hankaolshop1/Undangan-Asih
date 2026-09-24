import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { addDoc, collection, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const form = document.getElementById("guestbookForm");
const list = document.getElementById("guestbookList");
const submit = document.getElementById("guestbookSubmit");
const status = document.getElementById("formStatus");

const esc = (v) => { const d = document.createElement("div"); d.textContent = v ?? ""; return d.innerHTML; };
const fmt = (t) => (t?.toDate ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(t.toDate()) : "Baru saja");

function render(entries) {
  if (!entries.length) { list.innerHTML = '<p class="muted">Jadilah yang pertama mengirim ucapan.</p>'; return; }
  list.innerHTML = entries.map(({ name, message, attendance, createdAt }) => `
    <article class="wish">
      <div class="wish-head"><strong>${esc(name)}</strong>
        <span class="att ${attendance === "hadir" ? "present" : "absent"}">${attendance === "hadir" ? "Hadir" : "Belum bisa hadir"}</span></div>
      <p>${esc(message).replace(/\n/g, "<br>")}</p><time>${fmt(createdAt)}</time>
    </article>`).join("");
}

const configured = !Object.values(firebaseConfig).some((v) => String(v).includes("GANTI_DENGAN"));

if (!configured) {
  list.innerHTML = '<p class="muted">Buku tamu aktif setelah Firebase dikonfigurasi.</p>';
} else {
  try {
    const db = getFirestore(initializeApp(firebaseConfig));
    const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"), limit(50));
    onSnapshot(q, (s) => render(s.docs.map((d) => d.data())), () => {
      list.innerHTML = '<p class="muted">Ucapan belum dapat dimuat.</p>';
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name")).trim();
      const message = String(fd.get("message")).trim();
      if (!name || !message) return;
      submit.disabled = true; status.textContent = "Mengirim…";
      try {
        await addDoc(collection(db, "guestbook"), { name, message, attendance: fd.get("attendance"), createdAt: serverTimestamp() });
        form.reset(); status.textContent = "Terima kasih, ucapan Anda terkirim.";
      } catch { status.textContent = "Gagal mengirim, coba lagi."; }
      finally { submit.disabled = false; }
    });
  } catch {
    list.innerHTML = '<p class="muted">Ucapan belum dapat dimuat.</p>';
  }
}
