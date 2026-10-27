# Panduan Pengelolaan Aset Gambar & Video Zeevisual

Folder ini telah dipisahkan berdasarkan kategori agar Anda (Ziyad) dapat mengelola foto dan hasil desain dengan rapi.

## 1. Lokasi Penyimpanan File yang Sudah Dipisah:
- **Foto Profil Anda**: `public/images/profile/ziyad-fadhillah.jpg` (Sudah terpasang!)
- **Khusus Hasil Fotografi**: Simpan di `public/images/foto/` (contoh: `potret-1.jpg`, `pernikahan-1.jpg`)
- **Khusus Hasil Desain Grafis**: Simpan di `public/images/desain/` (contoh: `poster-1.jpg`, `kemasan-kopi.jpg`)
- **Khusus Video (.mp4 / .webm)**: Simpan di `public/videos/` (contoh: `reel-gentar.mp4`)
- **Berkas CV (PDF)**: Simpan di `public/cv/CV-Ziyad-Fadhillah-Zeevisual.pdf`

## 2. Cara Mengubah Data di Website:
- **Biodata & Profil**: Buka `src/data/profile.ts`
- **Daftar Karya Foto, Desain, & Video**: Buka `src/data/projects.ts`

Contoh penggunaan path gambar lokal:
- Untuk Fotografi: `image: "/images/foto/nama-foto.jpg"`
- Untuk Desain Grafis: `image: "/images/desain/nama-desain.jpg"`
