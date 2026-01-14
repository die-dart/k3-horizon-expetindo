document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('firstVisitPopup');
    const closeBtn = document.querySelector('.popup-close');

    // Selalu tampilkan popup setiap kali halaman dimuat
    popup.style.display = 'flex';

    // Trigger reflow untuk animasi
    setTimeout(() => {
        popup.classList.add('popup-visible');
    }, 10);

    // Fungsi menutup popup
    function closePopup() {
        popup.classList.remove('popup-visible');

        // Tunggu animasi selesai baru hide element
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
    }

    // Event listener tombol close
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }

    // Tutup jika klik di luar gambar
    if (popup) {
        popup.addEventListener('click', function (e) {
            if (e.target === popup) {
                closePopup();
            }
        });
    }
});
