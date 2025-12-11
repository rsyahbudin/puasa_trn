# 🚀 Panduan Deploy ke Vercel - Teras Rumah Nenek

## 📋 Persiapan Sebelum Deploy

### Apa yang Dibutuhkan:

- ✅ Akun GitHub (gratis)
- ✅ Akun Vercel (gratis)
- ✅ Database MySQL cloud (gratis)

---

## 📖 Langkah-Langkah Detail

### STEP 1: Buat Akun GitHub

1. Buka **https://github.com**
2. Klik **Sign up**
3. Masukkan email, password, dan username
4. Verifikasi email Anda

---

### STEP 2: Upload Project ke GitHub

Buka Terminal di Mac dan jalankan perintah berikut:

```bash
# 1. Masuk ke folder project
cd /Users/macbookairm2/Documents/RSyahbudin/NFC/TRN/puasa_nextjs

# 2. Inisialisasi Git (jika belum)
git init

# 3. Tambahkan semua file
git add .

# 4. Buat commit pertama
git commit -m "Initial commit - Teras Rumah Nenek Booking System"

# 5. Buat repository baru di GitHub:
#    - Buka https://github.com/new
#    - Repository name: puasa_nextjs (atau nama lain)
#    - Pilih: Private atau Public
#    - JANGAN centang "Add a README file"
#    - Klik "Create repository"

# 6. Setelah repository dibuat, jalankan:
git remote add origin https://github.com/USERNAME_ANDA/puasa_nextjs.git
git branch -M main
git push -u origin main
```

---

### STEP 3: Setup Database (PlanetScale - FREE)

1. Buka **https://planetscale.com**
2. Klik **Sign up** → Pilih "Continue with GitHub"
3. Klik **Create a new database**
4. Isi:
   - Database name: `puasa_trn`
   - Region: `AWS ap-southeast-1 (Singapore)` ← terdekat
5. Klik **Create database**
6. Tunggu hingga status menjadi **Ready**

#### Dapatkan Connection String:

1. Klik database yang baru dibuat
2. Klik **Connect**
3. Pilih **Prisma** dari dropdown "Connect with"
4. Copy nilai `DATABASE_URL`
   ```
   mysql://username:password@aws.connect.psdb.cloud/puasa_trn?sslaccept=strict
   ```
5. SIMPAN connection string ini, akan digunakan nanti

---

### STEP 4: Deploy ke Vercel

1. Buka **https://vercel.com**
2. Klik **Sign Up** → Pilih **Continue with GitHub**
3. Izinkan Vercel mengakses GitHub Anda
4. Klik **Add New** → **Project**
5. Pilih repository **puasa_nextjs** → Klik **Import**

#### Configure Project:

Di halaman konfigurasi:

1. **Framework Preset**: Next.js (sudah otomatis terdeteksi)
2. **Build and Output Settings**: Biarkan default
3. **Environment Variables** (PENTING!):

   Klik **"Environment Variables"** dan tambahkan satu per satu:

   | Key                            | Value                                                                                            |
   | ------------------------------ | ------------------------------------------------------------------------------------------------ |
   | `DATABASE_URL`                 | `mysql://username:password@aws.connect.psdb.cloud/puasa_trn?sslaccept=strict` (dari PlanetScale) |
   | `NEXT_PUBLIC_RESTAURANT_NAME`  | `Teras Rumah Nenek`                                                                              |
   | `NEXT_PUBLIC_RESTAURANT_PHONE` | `6281804040684`                                                                                  |
   | `ADMIN_USERNAME`               | `admin`                                                                                          |
   | `ADMIN_PASSWORD`               | (password aman Anda)                                                                             |

4. Klik **Deploy**
5. Tunggu 2-3 menit hingga deployment selesai

---

### STEP 5: Setup Database Schema

Setelah deploy berhasil, perlu migrate database:

**Opsi A: Menggunakan Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Jalankan migrate
vercel env pull  # Download env dari Vercel
npx prisma generate
npx prisma migrate deploy
```

**Opsi B: Menggunakan PlanetScale Console**

1. Buka PlanetScale dashboard
2. Pilih database Anda
3. Klik **Console**
4. Copy-paste SQL dari `prisma/migrations/*/migration.sql`

---

### STEP 6: Test Website

1. Setelah deploy selesai, Vercel akan memberikan URL seperti:
   `https://puasa-nextjs-xxx.vercel.app`
2. Buka URL tersebut
3. Test halaman:
   - Home: `https://your-site.vercel.app`
   - Admin: `https://your-site.vercel.app/admin`
   - Booking: `https://your-site.vercel.app/booking`

---

### STEP 7: Custom Domain (Opsional)

Jika Anda punya domain sendiri (misal: terasrumahnenek.com):

1. Di Vercel, buka project Anda
2. Klik **Settings** → **Domains**
3. Klik **Add**
4. Masukkan domain: `terasrumahnenek.com`
5. Vercel akan menampilkan DNS records yang perlu ditambahkan

**Di Niagahoster (jika domain di sana):**

1. Login ke **member.niagahoster.co.id**
2. Pilih domain Anda
3. Klik **DNS / Nameservers**
4. Pilih **Manage DNS Records**
5. Tambahkan record sesuai instruksi Vercel

ATAU gunakan nameserver Vercel:

- NS1: `ns1.vercel-dns.com`
- NS2: `ns2.vercel-dns.com`

---

## 🔐 Keamanan

### Password Admin

Gunakan password yang kuat untuk `ADMIN_PASSWORD`:

- Minimal 12 karakter
- Kombinasi huruf besar, kecil, angka, simbol
- Contoh: `TeR@s_2024!RmhNn3k`

### Environment Variables

- JANGAN commit file `.env` ke GitHub
- File `.env.example` AMAN untuk di-commit (tidak berisi password asli)

---

## 💰 Biaya

| Service     | Biaya  | Limit Gratis                     |
| ----------- | ------ | -------------------------------- |
| Vercel      | **$0** | 100GB bandwidth/bulan            |
| PlanetScale | **$0** | 5GB storage, 1 billion row reads |
| GitHub      | **$0** | Unlimited private repos          |
| **TOTAL**   | **$0** | ✅                               |

---

## 🆘 Troubleshooting

### Error: "PrismaClientInitializationError"

- Pastikan DATABASE_URL sudah benar
- Cek connection string dari PlanetScale

### Error: "Module not found"

- Pastikan `npm install` sudah dijalankan
- Cek package.json ada dependency yang diperlukan

### Halaman Admin tidak bisa login

- Pastikan ADMIN_USERNAME dan ADMIN_PASSWORD sudah diset di Vercel
- Refresh browser (Ctrl+Shift+R)

### Database kosong

- Jalankan: `npx prisma migrate deploy`
- Seed data: `npx prisma db seed`

---

## 📞 Bantuan

Jika ada kendala, bisa:

1. Buka issue di GitHub repository
2. Cek dokumentasi: https://vercel.com/docs
3. PlanetScale docs: https://planetscale.com/docs

---

**Selamat! Website Anda sekarang online dan gratis! 🎉**
