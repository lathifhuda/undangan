// --- 1. KONFIGURASI UTAMA ---
const openBtn = document.getElementById("open-btn");
const cover = document.getElementById("cover");
const music = document.getElementById("music");
const musicControl = document.getElementById("music-control");
const body = document.body;

// --- 2. ANIMASI PEMBUKA (COVER LOAD) ---
// Menjalankan animasi foto dan teks segera setelah halaman dibuka
document.addEventListener("DOMContentLoaded", function () {
  const animateElements = document.querySelectorAll(".animate-on-load");

  setTimeout(() => {
    animateElements.forEach((el) => {
      el.classList.add("active");
    });
  }, 200); // Delay kecil agar transisi terlihat halus
});

// Custom Tamu Undangan
function getGuestName() {
  // Mengambil teks setelah tanda '?'
  const queryString = window.location.search.substring(1);

  if (queryString) {
    // Mengubah %20 atau _ menjadi spasi agar rapi
    const name = decodeURIComponent(queryString).replace(/_/g, " ");
    document.getElementById("guest-name").innerText = name;
  }
}
window.addEventListener("DOMContentLoaded", getGuestName);

// --- 3. FUNGSI BUKA UNDANGAN ---
if (openBtn) {
  openBtn.addEventListener("click", () => {
    // Geser cover ke atas
    cover.classList.add("open");

    // Izinkan scroll halaman
    body.style.overflow = "auto";

    // Pemicu awal animasi scroll agar konten di bawah langsung terdeteksi
    revealOnScroll();

    // Mulai musik otomatis
    if (music) {
      music
        .play()
        .then(() => updateMusicIcon(true))
        .catch((error) => {
          console.log("Autoplay dicegah browser:", error);
          updateMusicIcon(false);
        });
    }
  });
}

// --- 4. KONTROL MUSIK (PLAY/PAUSE) ---
// --- 4. KONTROL MUSIK (PLAY/PAUSE) & SYNC VIDEO ---

// Fungsi pendukung untuk update tampilan tombol musik (Harus ada agar tidak error)
function updateMusicIcon(isPlaying) {
  if (!musicControl) return;
  if (isPlaying) {
    musicControl.innerHTML = '<i class="fas fa-compact-disc fa-spin"></i>';
    musicControl.style.animation = "spin 3s linear infinite";
  } else {
    musicControl.innerHTML = '<i class="fas fa-pause-circle"></i>';
    musicControl.style.animation = "none";
  }
}

// Event listener untuk tombol musik manual
if (musicControl && music) {
  musicControl.addEventListener("click", () => {
    if (music.paused) {
      music.play().then(() => updateMusicIcon(true));
    } else {
      music.pause();
      updateMusicIcon(false);
    }
  });
}

// Logika Otomatis Video vs Musik
const videoElement = document.querySelector("video");

if (videoElement && music) {
  // 1. Saat video mulai diputar (Play)
  videoElement.addEventListener("play", () => {
    if (!music.paused) {
      music.pause();
      updateMusicIcon(false);
    }
  });

  // 2. Saat video dijeda (Pause)
  videoElement.addEventListener("pause", () => {
    // Hanya putar balik jika cover sudah terbuka
    if (cover.classList.contains("open")) {
      music
        .play()
        .then(() => updateMusicIcon(true))
        .catch(() => {});
    }
  });

  // 3. Saat video selesai (Ended)
  videoElement.addEventListener("ended", () => {
    if (cover.classList.contains("open")) {
      music
        .play()
        .then(() => updateMusicIcon(true))
        .catch(() => {});
    }
  });
}
// --- 5. HITUNG MUNDUR (COUNTDOWN) ---
// Target: 24 Mei 2026, Jam 08:00 Pagi (Sudah disesuaikan ke tanggal Akad)
const targetDate = new Date(2026, 4, 24, 8, 0, 0).getTime();

const timer = setInterval(function () {
  const now = new Date().getTime();
  const distance = targetDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const elDays = document.getElementById("days");
  if (elDays) {
    elDays.innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;
  }

  if (distance < 0) {
    clearInterval(timer);
    const countdownElem = document.getElementById("countdown");
    if (countdownElem) {
      countdownElem.innerHTML =
        "<div style='color:var(--accent-color); font-size:1.5rem; padding:20px;'>Alhamdulillah, Acara Telah Selesai</div>";
    }
  }
}, 1000);

// --- 6. SISTEM ONE CLICK ATTENDANCE ---
const scriptURL =
  "https://script.google.com/macros/s/AKfycbxgw7-8Wl7a28uoa6gajeq9XaXfSioHWLvjuCLCVho4Ls91MvyerZQcb569jcy00qBNnw/exec";
const btnHadir = document.getElementById("btn-hadir");
const pesanSukses = document.getElementById("pesan-sukses");

// Fungsi pengecekan agar tombol muncul kembali jika sedang testing
// Hapus baris di bawah ini jika sudah fiks agar fitur anti-spam aktif
// localStorage.removeItem("sudah_klik_hadir");
/*
if (localStorage.getItem("sudah_klik_hadir") === "true") {
  if (btnHadir) btnHadir.style.display = "none";
  if (pesanSukses) pesanSukses.style.display = "block";
}
*/
if (btnHadir) {
  btnHadir.addEventListener("click", () => {
    // Memberi feedback visual saat loading
    btnHadir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencatat...';
    btnHadir.disabled = true;

    // Menggunakan fetch dengan parameter yang lebih kompatibel untuk Google Apps Script
    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors", // Tetap gunakan no-cors untuk Google Script agar tidak kena blokir kebijakan CORS
      body: new FormData(),
    })
      .then(() => {
        // Karena menggunakan no-cors, kita anggap pengiriman berhasil jika tidak masuk ke .catch
        localStorage.setItem("sudah_klik_hadir", "true");
        btnHadir.style.display = "none";
        if (pesanSukses) pesanSukses.style.display = "block";
        console.log("Data kehadiran berhasil dikirim ke Google Sheets.");
      })
      .catch((error) => {
        console.error("Error saat mengirim data:", error);
        alert("Gagal terhubung ke server. Pastikan koneksi internet aktif.");
        btnHadir.disabled = false;
        btnHadir.innerHTML =
          '<i class="fas fa-check-circle"></i> Insya Allah, Saya Hadir';
      });
  });
}

// --- 7. ANIMASI SCROLL REVEAL ---
function revealOnScroll() {
  const reveals = document.querySelectorAll(
    ".reveal-text, .reveal-image, .reveal-left, .reveal-right",
  );

  reveals.forEach((el) => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    const elementVisible = 50;

    if (elementTop < windowHeight - elementVisible) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// Fungsi salin nomor rekening (Tetap sama)
// --- FUNGSI SALIN NOMOR DENGAN TOAST ESTETIK ---
function copyText(elementId) {
  const text = document.getElementById(elementId).innerText;
  const toast = document.getElementById("toast");

  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Tampilkan Toast
      toast.className = "toast show";

      // Hilangkan Toast setelah 3 detik
      setTimeout(function () {
        toast.className = toast.className.replace("show", "");
      }, 3000);

      console.log("Berhasil menyalin: " + text);
    })
    .catch((err) => {
      console.error("Gagal menyalin: ", err);
    });
}
