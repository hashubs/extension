# Youno Wallet UI - Functional Phase 0 Flow (Account & Auth)

Berdasarkan arsitektur *background script* (khususnya `account.ts` dan `account-public-rpc.ts`), **Phase 0** pada UI terpusat sepenuhnya pada mekanisme Kriptografi, Autentikasi, dan Pengecekan State (*Auth Guard*).

Fokus utama di fase ini adalah memastikan komponen UI berinteraksi dengan API `accountPublicRPCPort` untuk mengontrol siklus hidup (lifecycle) dari *Master Password* dan *Session Memory* dengan aman.

## 1. Pengecekan Awal State (`App.tsx` & Router)
Saat ekstensi dibuka pertama kali, UI menggunakan `useAuthState` untuk memanggil *Remote Procedures* (RPC) ke background guna menentukan *routing* yang tepat:
*   **Cek Ketersediaan User** -> `accountPublicRPCPort.getExistingUser()`
    *   Jika mengembalikan `null`: Artinya local storage kosong/reset. **Pindah ke `OnboardingView`**.
*   **Cek Status Sesi Aktif** -> `accountPublicRPCPort.isAuthenticated()`
    *   Jika User ada tapi fungsi ini mengembalikan `false`: Artinya *vault* ada namun sesi memori terkunci. **Pindah ke `LoginView`**.
    *   Jika `true`: Aplikasi siap, **Pindah ke `DashboardView`**.

## 2. Alur Onboarding (`OnboardingView.tsx`)
Merupakan tahap di mana UI membuat *User* baru, menetapkan kuncian password awal, dan kemudian membuat atau mengimpor dompet kripto.
*   **Step 1: Setup Password.** User menginput password. 
    *   *Action:* Memanggil `accountPublicRPCPort.createUser({ password })`.
    *   *System Event:* Background men-generate `id` dan `salt` internal, serta algoritma turunan untuk `encryptionKey`.
*   **Step 2: Seed Phrase / Mnemonic (Via `walletPort`).**
    *   User mengenerate frasa pemulihan 12/24 kata (Create) atau mem-paste miliknya (Import).
*   **Step 3: Finalisasi & Simpan.**
    *   *Action:* Memanggil `accountPublicRPCPort.saveUserAndWallet()`.
    *   *System Event:* Seluruh data rahasia di-enkripsi di storage disk, instance dompet beralih permanen ke sesi pengguna ini, dan `authenticated` status menjadi aktif.

## 3. Alur Keluar-Masuk (`LoginView.tsx` & Dashboard)
Mekanisme pengamanan di mana aplikasi dapat mengakses brankas terenkripsi menggunakan sandi milik *user*.
*   **Siklus Login (Buka Brankas).**
    *   User menginput `password` di UI.
    *   *Action:* Memanggil `accountPublicRPCPort.login({ user, password })`.
    *   *System Event:* Background memverifikasi hash dari password. Jika valid, `encryptionKey` di-*load* ke dalam session memory, dan state ekstensi menjadi "Unlocked".
*   **Siklus Logout (Kunci Brankas).**
    *   Dipicu otomatis karena *timeout* (jika diaktifkan) atau aksi tombol manual di Dashboard UI.
    *   *Action:* Memanggil `accountPublicRPCPort.logout()`.
    *   *System Event:* Session memory (sementara) yang berisi kunci dekripsi murni akan dihapus (wipe) dari RAM. User harus login kembali untuk masuk.

## 4. Keamanan Tambahan & Pengaturan Sandi (Lanjutan Phase 0)
Adapun fitur keamanan otentikasi yang juga dikontrol di lapis `Account`:
*   **Ubah Password** -> Memerlukan autentikasi ulang `oldPassword` sebelum memanggil `accountPublicRPCPort.changePassword({ user, oldPassword, newPassword })`.
*   **Passkey (Biometrik)** -> Jika didukung, background juga menyediakan port integrasi `setPasskey` dan pengecekan dukungan `getPasskeyEnabled`.
*   **Hard Reset** -> `accountPublicRPCPort.eraseAllData()` yang berfungsi sebagai tombol "kiamat" untuk format ulang ekstensi jika user lupa password lokal sama sekali.
