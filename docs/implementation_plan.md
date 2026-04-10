# Migration to Zerion-style Multi-step Onboarding

Sesuai dengan kesepakatan, kita akan memecah Onboarding ke dalam rute vertikal/bertahap 1:1 seperti struktur `Zerion`, dengan **UI Fullscreen, Tailwind CSS, dan layout Split-Screen sesuai gambar referensi**.

## Layout & Styling (Sesuai Referensi)
- **Tema:** Light mode (Tidak perlu dark mode).
- **Layout Dasar:** *Split-Screen* (Layar terbagi dua). Bagian kiri berupa *Surface Putih* yang membungkus konten onboarding, dan bagian kanan berupa *Background Hijau Gelap* (atau sebaliknya sesuai gambar).
- **Mobile Responsive:** Saat ukuran layar mengecil (atau popup view), *UI* menjadi *card* putih penuh yang dikelilingi oleh *border/background* hijau tipis.

## Mnemonic Verification & Display
- **Menampilkan Mnemonic (Backup.tsx):** Kata sandi rahasia (12/24 kata) tidak ditampilkan mentah di dalam *textarea*, melainkan di-mapping ke dalam **Grid 3 Kolom** yang rapi.
- **Verifikasi Kepingan (Verify.tsx):** Sistem tidak akan meminta user mengetik/memasukkan 12 kata penuh. Sistem akan memilih secara acak **3 kata** saja yang disembunyikan. Untuk mengisi 3 kata tersebut, disediakan komponen *Dropdown/Select* berisi daftar kata pengecoh dan 1 kata benar agar user bisa memilihnya.

## Proyeksi 1:1 Folder Hierarchy
Kita akan membuat struktur folder persis seperti Zerion:

```text
src/ui/features/onboarding/
├── Onboarding.tsx        (Route Controller & Split Layout Wrapper)
├── shared/               (Komponen re-usable seperti Tombol, Layout)
├── Welcome/              (Landing View)
├── ShareData/            (Analytics Consent View - Dummy)
├── CreateUser/           (Halaman set Password)
├── Backup/               (Halaman Show Mnemonic & Verify)
├── Import/               (Halaman Import Mnemonic)
├── Hardware/             (Menampilkan opsi Ledger/Trezor - Dummy)
└── Success/              (Layar Sukses dengan React Icons)
```

## Rencana Eksekusi
1. Membuat kerangka *Layout* dan *Router Wrapper* di `Onboarding.tsx`.
2. Menyambungkannya ke `App.tsx` utama.
3. Menciptakan komponen *Welcome* dan *Share Data* statis berbalut desain referensi.
4. Membuat *CreateUser*, di mana form submit-nya menembak `accountPublicRPCPort.request('createUser', { password })`.
5. Membuat *Backup* UI (Generate & Verify), merender `getPendingRecoveryPhrase` di format grid, dan mekanisme test 3-dropdown.
6. Membangun halaman *Import* *(Textarea)* yang memanggil `walletPort.request('uiImportSeedPhrase')`.
7. Menghubungkan semuanya agar diakhiri degan layar *Success* yang men-trigger `accountPublicRPCPort.request('saveUserAndWallet')`.
