**README Diagram: Use Case & Sequence Diagrams**

Deskripsi singkat

- **Tujuan:** Dokumen ini menyediakan panduan, template, dan contoh untuk membuat Use Case dan Sequence Diagram untuk proyek `barber-apps`.
- **Format contoh:** Mermaid (mudah dirender di VS Code atau diekspor menjadi gambar menggunakan mermaid-cli).

**Diagrams Included**

- **Use Case Diagram:** gambaran aktor & fungsi utama (Booking, Waitlist, Authentication, Private Items management).
- **Sequence Diagrams:** skenario alur: Booking (standalone), Booking dari Private Items, Waitlist processing (realtime), dan Auth (login/signup).

**Mapping kode ↔ use cases**

- **Booking (UI):** `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/dashboard/booking-form.tsx`
- **Private Items API & UI:** `src/app/api/private-items/route.ts`, `src/app/api/private-items/update/[id]/route.ts`, `src/app/(dynamic-pages)/(main-pages)/PrivateItemsList.tsx`
- **Waitlist (realtime):** `src/app/(dynamic-pages)/(main-pages)/waitlist/WaitlistRealtime.tsx`, `src/app/(dynamic-pages)/(main-pages)/waitlist/page.tsx`
- **Auth (login/signup):** `src/app/(dynamic-pages)/(login-pages)/(login-pages)/login/*` & `src/app/(dynamic-pages)/(login-pages)/(login-pages)/sign-up/*`
- **Data/durations:** `src/data/services.json` (dipakai server & client untuk menghitung ETA/durasi layanan)

**Use Case (ringkasan aktor & use cases)**

- **Aktor:** Customer, Staff, System
- **Use Cases Utama:**
  - **Browse Services** — customer melihat daftar layanan
  - **Create Booking** — customer membuat booking (dengan wall-clock lokal)
  - **Book From Private Items** — booking yang dipicu dari daftar private items
  - **Manage Private Items** — tambah / edit / delete private item
  - **Auth: Sign Up / Login** — otentikasi pengguna
  - **View Waitlist** — lihat antrean & ETA realtime

**Contoh Use Case (Mermaid)**

```mermaid
%% Use Case (converted to flowchart for GitHub mermaid compatibility)
graph LR
  Customer[Customer]
  Staff[Staff]
  Browse(Browse Services)
  Create(Create Booking)
  View(View Waitlist)
  ManagePrivate(Manage Private Items)
  Auth(Sign Up / Login)
  ManageBookings(Manage Bookings)
  UpdateETA(Update ETA / Process Waitlist)

  Customer --> Browse
  Customer --> Create
  Customer --> View
  Customer --> ManagePrivate
  Customer --> Auth
  Staff --> ManageBookings
  Staff --> UpdateETA
```

**Sequence Diagrams (template Mermaid & penjelasan)**

1. Booking — user memilih service dan submit

```mermaid
sequenceDiagram
  participant C as Customer (Browser)
  participant UI as BookingForm
  participant API as /api/private-items
  participant DB as Supabase

  C->>UI: pilih layanan dan set waktu lokal YYYY-MM-DDTHH:MM:SS
  UI->>API: POST /api/private-items (service_id, service_time_local)
  API->>DB: insert private_item
  API->>DB: compute eta_start and eta_end (use services.json)
  DB->>API: success (private_item)
  API->>UI: 201 created
  UI->>C: tampilkan konfirmasi
```

2. Booking via Private Items (Book from list)

```mermaid
sequenceDiagram
  participant C as Customer
  participant PList as PrivateItemsList
  participant Modal as BookingForm (Dialog)
  participant API as /api/private-items
  participant DB as Supabase

  C->>PList: klik "Book" di header
  PList->>Modal: open dialog (pre-filled items)
  C->>Modal: konfirmasi booking (kirim waktu lokal)
  Modal->>API: POST /api/private-items/book
  API->>DB: create booking
  API->>DB: compute eta_end
  DB->>API: ok
  API->>Modal: success
  Modal->>PList: close and show toast
```

3. Waitlist realtime — client menerima update ETA dari Supabase

```mermaid
sequenceDiagram
  participant Client as Browser
  participant Realtime as Supabase Realtime
  participant DB as Supabase

  Client->>Realtime: subscribe to waitlist channel
  Realtime->>Client: push updates (row changes with eta_end)
  Client->>UI: re-render WaitlistRealtime component
```

4. Auth (login / signup)

```mermaid
sequenceDiagram
  participant User
  participant UI
  participant AuthAPI
  participant DB

  User->>UI: submit credentials
  UI->>AuthAPI: POST /api/auth (login or signup)
  AuthAPI->>DB: verify or create user
  DB->>AuthAPI: ok
  AuthAPI->>UI: session or token
  UI->>User: redirect or show success
```

**Rekomendasi struktur file diagram**

- `docs/diagrams/use-case.mmd`
- `docs/diagrams/booking.mmd`
- `docs/diagrams/private-items-booking.mmd`
- `docs/diagrams/waitlist.mmd`
- `docs/diagrams/auth.mmd`

**Cara merender / preview**

- VS Code: pasang ekstensi `vstirbu.vscode-mermaid-preview` atau `yzhang.mermaid-markdown-preview` untuk preview Mermaid di editor.
- CLI (rekomendasi pnpm): pasang `@mermaid-js/mermaid-cli` sebagai dev dependency dan render ke PNG/SVG.

Contoh (Windows `cmd.exe`):

```
pnpm add -D @mermaid-js/mermaid-cli
npx mmdc -i docs/diagrams/booking.mmd -o docs/diagrams/booking.png
```

Catatan: jika `mmdc` tidak ditemukan, jalankan `npx @mermaid-js/mermaid-cli -i <in> -o <out>` atau gunakan `npm`/`pnpm` sesuai preferensi.

**Tips & Best Practices**

- Konsistenkan format waktu di sequence: gunakan local wall-clock (`YYYY-MM-DDTHH:mm:ss`) ketika menggambarkan interaksi UI dan simpan di DB sebagai `timestamp without time zone` jika tujuan adalah mencatat waktu lokal yang dimasukkan user.
- Tandai pada diagram apabila ada asumsi (mis. fallback durasi 30 menit jika service tidak ditemukan).
- Sertakan referensi ke file kode di caption diagram saat commit (mis. `booking-form.tsx`, `private-items` API) supaya reviewer mudah menelusuri implementasi.

**Next steps (opsional yang bisa saya bantu)**

- Saya bisa membuat file Mermaid terpisah (`.mmd`) untuk tiap diagram.
- Saya bisa merender PNG/SVG untuk dimasukkan ke dokumentasi.
- Saya bisa menambahkan diagram ke README root atau ke wiki repo.

---

File ini dibuat sebagai titik awal. Jika Anda mau, saya bisa lanjut membuat file `.mmd` per diagram dan merendernya.
