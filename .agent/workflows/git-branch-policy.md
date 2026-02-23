---
description: Development Workflow untuk Fitur, Library, Arsitektur, dan Bugfix (Git Branches)
---

Sesuai dengan instruksi Pengguna pada proyek ini:

1. **JANGAN PERNAH** melakukan penambahan fitur baru, memperbarui layer/library, merombak arsitektur, atau memperbaiki *error* / *bug* langsung di _branch_ utama (`main`). 
   - *(Catatan: Tambahan kode kecil atau penulisan biasa diizinkan langsung di `main`)*.
2. Setiap kali ada permintaan untuk:
   - Tambah fitur baru (*feature*)
   - Update/Tambah Library
   - Bongkar-pasang struktur atau Layer Arsitektur (*refactor*)
   - Perbaikan Bug/Error (*bugfix*)
   **SEGERA buat _branch_ baru terlebih dahulu**.
   - Gunakan format penamaan branch yang jelas sesuai dengan kerjanya.
   - Contoh untuk fitur baru: `feat/nama-fitur-baru`
   - Contoh untuk perbaikan error: `fix/nama-error`
   - Contoh untuk update arsitektur: `refactor/nama-layer`
   - Perintah Git: `git checkout -b nama-branch-baru`.
3. Setelah _branch_ terpisah dibuat, barulah lakukan proses modifikasi *source code* atau perbaikan *error*.
4. Uji coba (*testing*) perubahan di _branch_ tersebut.
5. Laporkan kembali kepada Pengguna jika perubahan telah siap (atau telah di-*commit* ke GitHub pada _branch_ tersebut), dan sampaikan nama _branch_ baru tersebut supaya mereka bisa memverifikasinya sebelum digabungkan (_Merge_) ke `main`.
