# PancaQuest Adventure Semi-3D v1.6 — Final 4 Levels + Randomized Questions

## Level lengkap
1. Level 1 — Sekolah: Kenali Nilainya
2. Level 2 — Taman Nilai: Kumpulkan Nilai Baik
3. Level 3 — Ruang Musyawarah: Pilih Solusinya
4. Level 4 — Kelas Aksi: Rancang Tindakan Nyata

## Level 4
Level 4 berfokus pada C6 melalui empat unsur: Tindakan, Pelaksana, Waktu, dan Indikator keberhasilan. Game memilih salah satu dari tiga skenario secara acak: Kelas Saling Menghargai, Budaya Musyawarah Kelas, atau Pentas Budaya yang Memersatukan.

## Randomisasi
Pada setiap reload/restart:
- pertanyaan Level 1 dipilih acak dari bank soal,
- pertanyaan Level 3 dipilih acak dari bank soal,
- skenario Level 4 dipilih acak,
- urutan pilihan jawaban A–D diacak setiap soal ditampilkan.

Urutan tahapan pembelajaran tidak diacak agar alur pedagogis tetap logis.

## Skor akhir
Adventure XP maksimal 175. Skor PancaQuest dinormalisasi menjadi 0–100 berdasarkan jumlah kesalahan. Badge: >=95 Pancasila Pathfinder; >=85 Civic Problem Solver; >=75 Value Detective; lainnya Pancasila Explorer.

Hasil akhir disimpan di localStorage key `pancapath_quest` dan siap dibaca PancaPath/Form B.

## Audio
Backsound dan sound effect menggunakan Web Audio API. Melodi latar berubah menurut level. Browser memulai audio setelah interaksi pertama pengguna.
