# Youno Wallet UI - Functional Phase 2 Flow (Internal Utility & Assets)

Jika **Phase 0** bertanggung jawab atas keamanan (Auth) dan **Phase 1** sebagai penjembatan Web3 (DApp Interactions), maka **Phase 2** berfokus pada **Fitur Mandiri Internal** dari ekstensi.

Pada fase ini, Youno Extension dirancang agar berfungsi secara utuh (sebagai *stand-alone wallet*), memungkinkan pengguna untuk mengelola portofolio, memindahkan aset, dan mengatur preferensi keamanan tanpa harus bergantung atau terkoneksi pada aplikasi pihak ketiga (DApp).

## 1. Asset Discovery & Dashboard (Portofolio)
Mengubah UI Dashboard utama (yang sebelumnya mungkin hanya menampilkan Address) menjadi pusat kontrol finansial dengan berinteraksi bersama modul internal seperti `ethereum`, `solana`, `youno-api`, dan `currency`.
*   **A. Native Balance:** Melakukan *polling/fetch* RPC memanggil via background untuk mengambil saldo koin *native* dari akun dan chain yang saat ini aktif (contoh: menampilkan total ETH di jaringan Ethereum, atau SOL di jaringan Solana).
*   **B. Token List Explorer:** Membaca metadata token (list token ERC20/SPL) via *indexer* internal, menghitung saldo tiap token milik *current address*, dan menampilkannya sebagai *list view* beserta nilai ekuivalennya dalam *fiat* (USD/IDR).
*   **C. Transaction History (Activity):** Menampilkan log transaksi (Sukses, Gagal, Pending) masa lalu, memberikan akses kepada pengguna ke detail pengiriman lokal tanpa harus repot mengecek Web Explorer (Etherscan/Solscan).

## 2. Multi-Context Management (Account & Network Switcher)
Manajemen state manual, di mana kendali *Context* diserahkan kembali sepenuhnya kepada pengguna (secara internal UI), alih-alih diatur oleh DApp.
*   **A. Network Switcher Dropdown:** Sebuah *selector* di sisi header Dashboard. Mengganti jaringan secara internal akan merender ulang saldo native *Dashboard* dan seketika menembakkan event RPC (`chainChanged`) ke semua DApp yang terbuka.
*   **B. Account Selector & Creation:** Alur UI untuk beralih antara Account 1, Account 2, dst. Termasuk juga kapabilitas memanggil logic background untuk menciptakan derivasi address baru dari *Seed Phrase* yang sama atau sekadar mem-*switch* state address aktif. Mengubah identitas ini men-trigger event (`accountsChanged`).

## 3. Native Send/Transfer Flow
Fungsionalitas mandiri untuk mentransfer aset dari dalam wallet ke *Address* lain.
*   **A. Form & Validation:** Area input Alamat Penerima. Memerlukan *logic* kuat untuk melempar error jika *Address* bukan hex format Ethereum yang tepat, atau karakter Base58 Solana yang divalidasi.
*   **B. Input Amount & Gas Est:** User memasukkan nilai transfer nominal (contoh: kirim 0.5 ETH). Secara otomatis di belakang layar memanggil *Gas Estimation/Fee Calculation* dan merangkum *Total Cost* sebelum disubmit.
*   **C. State Eksekusi:** Menampilkan *loading screen* yang ramah sembari transaksi di-broadcast ke jaringan, lalu kembali ke Dashboard membawa notifikasi sukses.

## 4. Settings & Security Control
Ruang privasi dalam *extension popup* untuk mengelola resiko pengguna.
*   **A. Reveal Secret Recovery Phrase / Private Key:** Halaman krusial (Zona Merah). Modul UI wajib menampilkan sebuah form validasi password ulang terlebih dahulu, sebelum sukses me-request string *Mnemonic/Key* mentah dari decrypter *Background* ke layar UI.
*   **B. Connected DApps Manager:** Menjabarkan domain website ("Origin") mana saja yang sejauh ini Anda berikan persetujuan koneksinya, dengan fungsionalitas mencabut izin tersebut (`revoke permission`).
*   **C. Auto-Lock Timer / Preferences:** Pengaturan sederhana berapa lama ekstensi harus tetap "terbuka" dalam menit setelah *idle*, hingga fungsi Ganti Bahasa UI.
