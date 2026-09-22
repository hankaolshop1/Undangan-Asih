# Undangan Pernikahan Asih & Fahri

Situs undangan pernikahan statis bertema **Luxury Burgundy & Gold Royal Wedding**, tanpa proses build dan siap di-host di GitHub Pages. Desain menggunakan CSS sehingga tidak membutuhkan aset gambar tambahan: sampul amplop, wax seal, ornamen floral, efek petals, dan frame venue dirender langsung di browser.

## Publikasi ke GitHub Pages

1. Buat repositori GitHub baru, lalu unggah seluruh file dalam folder ini ke repositori tersebut.
2. Di repositori, buka **Settings** → **Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch `main`, folder `/ (root)`, lalu klik **Save**.
5. GitHub akan menampilkan URL undangan setelah deployment selesai.

Data undangan dan tautan Google Maps sudah dimasukkan. Situs memakai musik opsional `leberch-wedding-piano-595793.mp3`; jika ingin musik aktif, unggah file tersebut di folder yang sama dengan `index.html`. Edit `index.html` jika ada pembaruan informasi acara atau nama keluarga.

## Mengaktifkan buku tamu Firebase

1. Buat proyek di [Firebase Console](https://console.firebase.google.com/), lalu tambahkan **Web App**.
2. Aktifkan **Cloud Firestore** dengan lokasi database yang Anda pilih.
3. Salin konfigurasi Web App ke `firebase-config.js`, menggantikan seluruh nilai `GANTI_DENGAN_...`.
4. Pada **Firestore Database** → **Rules**, gunakan aturan berikut, kemudian klik **Publish**:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guestbook/{entry} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['name', 'message', 'attendance', 'createdAt'])
        && request.resource.data.name is string && request.resource.data.name.size() > 0 && request.resource.data.name.size() <= 50
        && request.resource.data.message is string && request.resource.data.message.size() > 0 && request.resource.data.message.size() <= 500
        && request.resource.data.attendance in ['hadir', 'tidak-hadir'];
      allow update, delete: if false;
    }
  }
}
```

5. Unggah ulang `index.html`, `style.css`, `script.js`, dan `firebase-config.js` ke repositori GitHub Anda.
