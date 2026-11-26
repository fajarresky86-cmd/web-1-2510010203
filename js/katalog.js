let katalog = [];

const daftarKatalog = document.querySelector("#daftar-katalog");
const inputCari = document.querySelector("#cari");
const tombolFilter = document.querySelectorAll(".tombol-filter");
const infoJumlah = document.querySelector("#info-jumlah");

let kategoriAktif = "semua";

function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
}

function buatKartu(produk) {
    const kartu = document.createElement("article");
    kartu.className = "product-card";

    const gambar = document.createElement("img");
    gambar.src = produk.gambar;
    gambar.alt = produk.nama;
    gambar.width = 600;
    gambar.height = 400;
    gambar.loading = "lazy";

    const wadahGambar = document.createElement("div");
    wadahGambar.className = "product-image";
    wadahGambar.append(gambar);

    const isi = document.createElement("div");
    isi.className = "product-info";

    const label = document.createElement("span");
    label.className = "label-kategori";
    label.textContent = produk.kategori;

    const judul = document.createElement("h3");
    judul.textContent = produk.nama;

    const deskripsi = document.createElement("p");
    deskripsi.textContent = produk.deskripsi;

    const harga = document.createElement("p");
    harga.className = "price";
    harga.textContent = formatRupiah(produk.harga);

    isi.append(label, judul, deskripsi, harga);
    kartu.append(wadahGambar, isi);

    return kartu;
}

function tampilkanKatalog(daftarProduk) {
    if (!daftarKatalog) return;
    daftarKatalog.replaceChildren();

    if (daftarProduk.length === 0) {
        const kosong = document.createElement("p");
        kosong.textContent = "Produk tidak ditemukan. Coba kata kunci lain.";
        daftarKatalog.append(kosong);
    }

    daftarProduk.forEach((produk) => {
        daftarKatalog.append(buatKartu(produk));
    });

    if (infoJumlah) {
        infoJumlah.textContent =
            `Menampilkan ${daftarProduk.length} dari ${katalog.length} produk`;
    }
}

function saringKatalog() {
    const kataKunci = inputCari ? inputCari.value.trim().toLowerCase() : "";

    const hasil = katalog.filter((produk) => {
        const cocokKategori =
            kategoriAktif === "semua" ||
            produk.kategori === kategoriAktif;

        const cocokKata =
            produk.nama.toLowerCase().includes(kataKunci) ||
            produk.deskripsi.toLowerCase().includes(kataKunci);

        return cocokKategori && cocokKata;
    });

    tampilkanKatalog(hasil);
}

async function muatKatalog() {
    if (!daftarKatalog) return;

    if (infoJumlah) {
        infoJumlah.textContent = "Memuat katalog produk...";
    }

    try {
        const respons = await fetch("data/katalog.json");
        if (!respons.ok) {
            throw new Error(`HTTP error! Status: ${respons.status}`);
        }
        katalog = await respons.json();
        tampilkanKatalog(katalog);
    } catch (galat) {
        console.error("Gagal memuat data katalog:", galat);
        if (infoJumlah) {
            infoJumlah.textContent = "Gagal memuat katalog produk.";
        }
        const pesanError = document.createElement("p");
        pesanError.textContent = "Terjadi kendala saat mengambil data katalog. Silakan muat ulang halaman.";
        daftarKatalog.replaceChildren(pesanError);
    }
}

async function muatJadwalSalat() {
    const wadahSalat = document.querySelector("#isi-jadwal-salat");
    const infoTanggal = document.querySelector("#tanggal-salat");
    if (!wadahSalat) return;

    const ID_KOTA = "2113";
    const sekarang = new Date();
    const tahun = sekarang.getFullYear();
    const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
    const tanggal = String(sekarang.getDate()).padStart(2, "0");

    const url = `https://api.myquran.com/v2/sholat/jadwal/${ID_KOTA}/${tahun}/${bulan}/${tanggal}`;

    try {
        const respons = await fetch(url);
        if (!respons.ok) {
            throw new Error(`HTTP error! Status: ${respons.status}`);
        }
        const hasil = await respons.json();
        if (!hasil.status || !hasil.data || !hasil.data.jadwal) {
            throw new Error("Format jadwal salat tidak valid");
        }

        const jadwal = hasil.data.jadwal;
        if (infoTanggal) {
            infoTanggal.textContent = `${hasil.data.lokasi} — ${jadwal.tanggal}`;
        }

        const waktuSalat = [
            { nama: "Subuh", jam: jadwal.subuh },
            { nama: "Dzuhur", jam: jadwal.dzuhur },
            { nama: "Ashar", jam: jadwal.ashar },
            { nama: "Maghrib", jam: jadwal.maghrib },
            { nama: "Isya", jam: jadwal.isya }
        ];

        wadahSalat.replaceChildren();
        waktuSalat.forEach((item) => {
            const kartu = document.createElement("div");
            kartu.className = "kartu-waktu-salat";

            const nama = document.createElement("span");
            nama.className = "nama-salat";
            nama.textContent = item.nama;

            const jam = document.createElement("strong");
            jam.className = "jam-salat";
            jam.textContent = `${item.jam} WITA`;

            kartu.append(nama, jam);
            wadahSalat.append(kartu);
        });
    } catch (galat) {
        console.error("Gagal memuat jadwal salat:", galat);
        wadahSalat.textContent = "Jadwal salat sementara tidak dapat dimuat.";
    }
}

if (inputCari) {
    inputCari.addEventListener("input", saringKatalog);
}

tombolFilter.forEach((tombol) => {
    tombol.addEventListener("click", () => {
        kategoriAktif = tombol.dataset.kategori;

        tombolFilter.forEach((t) => {
            t.classList.remove("aktif");
            t.setAttribute("aria-pressed", "false");
        });

        tombol.classList.add("aktif");
        tombol.setAttribute("aria-pressed", "true");

        saringKatalog();
    });
});

muatKatalog();
muatJadwalSalat();