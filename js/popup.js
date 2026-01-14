document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('firstVisitPopup');
    const closeBtn = document.querySelector('.popup-close');
    const popupKey = 'hasVisitedBefore';

    // Cek apakah user sudah pernah berkunjung
    if (!localStorage.getItem(popupKey)) {
        // Tampilkan popup
        popup.style.display = 'flex';

        // Trigger reflow untuk animasi
        setTimeout(() => {
            popup.classList.add('popup-visible');
        }, 10);
    }

    // Fungsi menutup popup
    function closePopup() {
        popup.classList.remove('popup-visible');

        // Tunggu animasi selesai baru hide element
        setTimeout(() => {
            popup.style.display = 'none';
            // Simpan status sudah berkunjung
            localStorage.setItem(popupKey, 'true');
        }, 300);
    }

    // Event listener tombol close
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }

    // Opsional: Tutup jika klik di luar gambar
    if (popup) {
        popup.addEventListener('click', function (e) {
            if (e.target === popup) {
                closePopup();
            }
        });
    }
});
