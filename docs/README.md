# Dokumentasi Proyek — barber-apps

Ringkasan singkat

- **Nama proyek:** barber-apps
- **Tujuan:** Aplikasi pemesanan layanan barbershop dengan fitur booking, private items (preconfigured bookings), dan waitlist realtime.

Konten dokumen ini

- Struktur kode singkat
- Cara menyiapkan lingkungan pengembangan
- Perintah penting (dev, build, test)
- Database & migrasi (Supabase)
- Lokasi diagram & dokumentasi visual
- Tips pengembangan dan kontribusi

Struktur direktori (ringkasan)

- `src/` — kode aplikasi Next.js (app dir)
  - `app/(dynamic-pages)/...` — halaman, layout, dan komponen terkait routing
  - `app/api/` — route API server-side
  - `data/` — data statis seperti `services.json` (durasi layanan dll.)
  - `supabase-clients/`, `rsc-data/` — utilitas klien Supabase / akses server
- `supabase/` — migrations, seed, dan konfigurasi Supabase
- `docs/` — dokumentasi proyek (diagram, panduan)
- `tests/` — SQL tests atau artefak pengujian DB

Persiapan & dependensi

1. Pasang dependensi

```cmd
pnpm install
```

2. Menjalankan environment (dev)

- Jika menggunakan Supabase lokal (dijalankan via task workspace):

```cmd
pnpm supabase start
pnpm dev
```

- Atau jalankan task VS Code `Development` (yang tergantung pada `Start Supabase` dan `Run Server`).

3. Build untuk produksi

```cmd
pnpm build
pnpm start
```

Testing & linting

- Unit / integrasi: project menyiapkan `vitest` (cek `vitest.config.ts`) — jalankan:

```cmd
pnpm test
```

- Lint & format: jalankan script di `package.json` jika tersedia, mis. `pnpm lint` / `pnpm format`.

Database & Migrasi

- Migrations SQL tersimpan di `supabase/migrations/`.
- Untuk perubahan skema, tambahkan file migration baru sesuai alur Supabase (atau gunakan `supabase` CLI).
- File seed & konfigurasi ada di `supabase/seed.sql` dan `supabase/config.toml`.

Lokasi diagram & dokumentasi visual

- Diagram Use Case & Sequence ada di `docs/diagrams/`.
- File README khusus diagram: `docs/diagrams/README.md` (berisi contoh Mermaid dan petunjuk render).
- Rekomendasi file diagram:
  - `docs/diagrams/use-case.mmd`
  - `docs/diagrams/booking.mmd`
  - `docs/diagrams/private-items-booking.mmd`
  - `docs/diagrams/waitlist.mmd`
  - `docs/diagrams/auth.mmd`

Render Mermaid (opsi cepat)

- Preview di VS Code: pasang ekstensi Mermaid preview.
- CLI render (contoh `cmd.exe`):

```cmd
pnpm add -D @mermaid-js/mermaid-cli
npx mmdc -i docs/diagrams/booking.mmd -o docs/diagrams/booking.png
```

Arsitektur ringkas & mapping penting

- Booking UI: `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/dashboard/booking-form.tsx`
- Private Items: UI `src/app/(dynamic-pages)/(main-pages)/PrivateItemsList.tsx`, API `src/app/api/private-items` (route dan update)
- Waitlist realtime: `src/app/(dynamic-pages)/(main-pages)/waitlist/WaitlistRealtime.tsx`
- Auth: `src/app/(dynamic-pages)/(login-pages)/...`

Catatan teknis penting

- Waktu booking disimpan sebagai local wall-clock di sisi klien (format `YYYY-MM-DDTHH:MM:SS`) sebelum dikirim ke server. Jika Anda perlu menyamakan zona waktu di server, lihat migration dan tipe kolom timestamp pada DB.
- Server menghitung `eta_start` / `eta_end` menggunakan durasi layanan yang diambil dari `src/data/services.json` (fallback durasi apabila service tidak ditemukan).

Contributing

- Buat branch fitur berdasarkan `main`.
- Tambahkan test atau update migrasi bila ada perubahan schema.
- Sertakan update dokumentasi dan diagram bila ada perubahan alur bisnis.

Kontak & bantuan

- Jika perlu bantuan membuat diagram terpisah atau merender gambar, saya bisa bantu membuat `.mmd` dan menghasilkan PNG/SVG.

---

File ini adalah ringkasan dokumentasi proyek. Bila Anda mau, saya bisa:

- Buat file `.mmd` untuk setiap diagram (di `docs/diagrams/`).
- Render diagram menjadi gambar dan masukkan ke README root.
- Tambahkan panduan developer lebih detail (contoh: env vars, secrets, supabase project setup).
