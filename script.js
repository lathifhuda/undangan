// --- LOGIKA UTAMA (script.js) ---

const openBtn = document.getElementById("open-btn");
const cover = document.getElementById("cover");
const music = document.getElementById("music");
const musicControl = document.getElementById("music-control");
const body = document.body;

// 1. FUNGSI BUKA UNDANGAN
openBtn.addEventListener("click", () => {
  // Geser cover ke atas
  cover.classList.add("open");
  // Izinkan scroll
  body.style.overflow = "auto";

  // Mulai musik
  // Kita gunakan promise untuk menangkap error jika browser memblokir
  music
    .play()
    .then(() => {
      // Jika berhasil play, ubah ikon jadi berputar
      updateMusicIcon(true);
    })
    .catch((error) => {
      console.log("Autoplay dicegah atau file tidak ditemukan:", error);
      // Jika gagal play, pastikan ikon dalam mode pause (diam)
      updateMusicIcon(false);
    });
});

// 2. KONTROL MUSIK (TOMBOL PLAY/PAUSE)
// Menggunakan pengecekan 'music.paused' agar lebih akurat
musicControl.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    updateMusicIcon(true); // Ubah jadi ikon disc berputar
  } else {
    music.pause();
    updateMusicIcon(false); // Ubah jadi ikon pause/diam
  }
});

// Fungsi pembantu untuk update tampilan ikon
function updateMusicIcon(isPlaying) {
  if (isPlaying) {
    musicControl.innerHTML = '<i class="fas fa-compact-disc"></i>';
    musicControl.style.animation = "spin 2s linear infinite";
  } else {
    musicControl.innerHTML = '<i class="fas fa-pause"></i>';
    musicControl.style.animation = "none";
  }
}

// 3. INJEKSI ANIMASI CSS (AGAR TIDAK PERLU EDIT STYLE.CSS)
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.fa-compact-disc {
    animation: spin 2s linear infinite;
}
`;
document.head.appendChild(styleSheet);

// 4. HITUNG MUNDUR (COUNTDOWN)
// Ganti tanggal di bawah ini: (Tahun, Bulan-1, Tanggal, Jam, Menit)
// Ingat: Bulan dimulai dari 0 (Januari=0 ... Desember=11)
const targetDate = new Date(2026, 4, 23, 8, 0, 0).getTime();

const timer = setInterval(function () {
  const now = new Date().getTime();
  const distance = targetDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Cek apakah elemen ada sebelum diupdate (mencegah error)
  if (document.getElementById("days")) {
    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;
  }

  // Jika waktu habis
  if (distance < 0) {
    clearInterval(timer);
    const countdownElem = document.getElementById("countdown");
    if (countdownElem) {
      countdownElem.innerHTML =
        "<div style='color:var(--accent-color); font-size:1.5rem; padding:20px;'>Alhamdulillah, Acara Telah Selesai</div>";
    }
  }
}, 1000);

// 5. INJEKSI ANIMASI CSS (AGAR TIDAK PERLU EDIT STYLE.CSS)
const styleSheet2 = document.createElement("style");
styleSheet2.innerText = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleSheet2);

/* --- SISTEM ONE CLICK ATTENDANCE (FIXED NO-CORS) --- */

// Link API Google Apps Script Anda
const scriptURL =
  "https://script.google.com/macros/s/AKfycbxgw7-8Wl7a28uoa6gajeq9XaXfSioHWLvjuCLCVho4Ls91MvyerZQcb569jcy00qBNnw/exec";

const btnHadir = document.getElementById("btn-hadir");
const pesanSukses = document.getElementById("pesan-sukses");

// Cek memori HP (LocalStorage)
if (localStorage.getItem("sudah_klik_hadir") === "true") {
  if (btnHadir) btnHadir.style.display = "none";
  if (pesanSukses) pesanSukses.style.display = "block";
}

if (btnHadir) {
  btnHadir.addEventListener("click", () => {
    // 1. Ubah tampilan tombol jadi loading
    const originalText = btnHadir.innerHTML;
    btnHadir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencatat...';
    btnHadir.style.opacity = "0.7";
    btnHadir.disabled = true; // Matikan tombol sementara

    // 2. Kirim data dengan mode NO-CORS (Anti Error Browser)
    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors", // <--- PENTING: Ini agar browser tidak memblokir
      body: new FormData(),
    })
      .then(() => {
        // Karena pakai no-cors, browser tidak akan menerima balasan "Success" dari Google
        // Jadi kita ASUMSIKAN sukses jika tidak masuk ke catch error
        console.log("Request terkirim (Mode No-CORS)");

        // 3. Simpan tanda di memori HP tamu
        localStorage.setItem("sudah_klik_hadir", "true");

        // 4. Ubah tampilan jadi pesan sukses
        btnHadir.style.display = "none";
        pesanSukses.style.display = "block";
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Gagal terhubung ke server. Pastikan internet lancar.");

        // Kembalikan tombol jika gagal total
        btnHadir.innerHTML = originalText;
        btnHadir.style.opacity = "1";
        btnHadir.disabled = false;
      });
  });
}
/* --- LOGIKA VIDEO & MUSIK --- */
const videoPrewed = document.getElementById("video-prewed");

// Pastikan elemen video ada sebelum menjalankan perintah
if (videoPrewed) {
  videoPrewed.addEventListener("play", () => {
    // 1. Matikan Musik Background
    if (music) {
      music.pause();
    }

    // 2. Ubah Ikon Musik jadi 'Pause' (berhenti berputar)
    if (musicControl) {
      musicControl.innerHTML = '<i class="fas fa-pause"></i>';
      musicControl.style.animation = "none";
    }
  });
}
