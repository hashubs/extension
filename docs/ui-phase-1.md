# Youno Wallet UI - Functional Phase 1 Flow (DApp Interactions)

Anda benar, prioritas utama dari sebuah *browser extension wallet* adalah kemampuannya merespons permintaan (requests) dari DApp. Ekstensi ini sejatinya adalah "jembatan" Web3. Oleh karena itu, **Phase 1** harus murni fokus melengkapi semua UI pendukung *DApp Handshake* yang ada di dalam `public-controller.ts`, tanpa perlu repot memikirkan fitur internal seperti *Asset Discovery* atau *Internal Transfer* masuk ke fase ini.

Berdasarkan *routes* yang dipanggil oleh `public-controller.ts` menggunakan API `safeOpenDialogWindow`, ini adalah daftar halaman (Views) fungsional yang WAJIB dibangun di Phase 1 untuk menyelesaikan fungsionalitas jembatan DApp:

## 1. Request Accounts (`/requestAccounts`)
*   *Lanjutan dari Phase 0:* DApp memanggil `eth_requestAccounts` atau `sol_connect`.
*   **Fungsi UI:** Menerima `origin` DApp, menampilkan Address yang sedang aktif, dan memberikan tombol untuk *Connect* / *Reject*. Otomatisasi pengecekan ekosistem (EVM/Solana) harus disempurnakan di tahap ini.

## 2. Select Connected Wallet (`/selectConnectedWallet`)
*   Apabila DApp meminta transaksi yang spesifik untuk rantai Solana (`sol_connect`, `sol_sign`) namun dompet EVM sedang terpilih (begitu pula sebaliknya).
*   **Fungsi UI:** Meminta user secara eksplisit untuk pindah ke Address / Ecosystem yang sesuai dengan *request* DApp saat ini (contoh: DApp minta Solana, tapi wallet lagi di menu EVM).

## 3. Switch Ethereum Chain (`/switchEthereumChain`)
*   DApp memanggil `wallet_switchEthereumChain`.
*   **Fungsi UI:** Menerima `chainId` tujuan, membandingkannya dengan `chainId` saat ini. Menampilkan UI konfirmasi "DApp ingin mengganti jaringan ke [Network Name]". Menyediakan tombol *Approve* (eksekusi ganti ke background) dan *Cancel*.

## 4. Add Ethereum Chain (`/addEthereumChain`)
*   DApp memanggil `wallet_addEthereumChain`.
*   **Fungsi UI:** DApp mengirimkan objek network baru (RPC url, Symbol, ChainId). UI membongkar payload ini, memvalidasinya, dan menampilkannya sebagai peringatan konfirmasi ke user sebelum mengizinkan background menyimpan network tersebut ke setting lokal.

## 5. Sign Message (`/signMessage`)
*   DApp memanggil `personal_sign`, `sol_signMessage`, atau varian raw message lainnya.
*   **Fungsi UI:** Mengambil `message` hexa/base64 dari parameter URL/Background, men-decode-nya menjadi format *human-readable*, dan menyediakan layar *Approve/Reject* sehingga user bisa membaca pesan sebelum menekan Setuju.

## 6. Sign Typed Data (`/signTypedData`)
*   DApp memanggil `eth_signTypedData_v4` atau EIP-712 typed data lainnya.
*   **Fungsi UI:** Mirip dengan *Sign Message*, namun input dari DApp adalah struktur JSON. UI harus bisa mem-parsing struktur hirarki *Domain* dan *Message* JSON ini ke dalam UI yang rapi (format Keys/Values) agar validasi user transparan.

## 7. Send Transaction (`/sendTransaction`)
*   DApp memanggil `eth_sendTransaction`, `sol_signAndSendTransaction`, `sol_signTransaction`, atau `sol_signAllTransactions`.
*   **Fungsi UI:** Ini adalah core *value-transfer*. UI menerima *Transaction Object* lengkap, menampilkan:
    *   Alamat Pengirim (`from`) & Penerima (`to`).
    *   Nominal Token / Aset (`value`).
    *   Estimasi Gas Fee / Network Fee yang dikirimkan bersama payload.
    *   *Approve/Reject actions.*

---
**Objektif Akhir Phase 1:** Youno Extension bisa ditancapkan (`injected`) pada website Web3 manapun (PancakeSwap, OpenSea, Uniswap, Jupiter) dan mampu menampilkan *popup windows* yang mulus dan fungsional untuk setiap request standar tanpa *crash*, *hang*, ataupun *timeout*.
