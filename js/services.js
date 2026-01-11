document.addEventListener('DOMContentLoaded', () => {
    const categoryItems = document.querySelectorAll('.category-item');
    const serviceCards = document.querySelectorAll('.creative-card');
    const emptyState = document.getElementById('empty-state');
    const servicesGrid = document.querySelector('.program-grid');
    const pageTitle = document.querySelector('.page-title-group h1');
    const pageDesc = document.querySelector('.page-title-group p');
    const searchInput = document.querySelector('.search-input');

    const categoryData = {
        'all': { title: 'Semua Layanan', desc: 'Daftar lengkap program pelatihan dan sertifikasi kami.' },
        'esdm': { title: 'Sertifikasi ESDM', desc: 'Program sertifikasi khusus bidang Energi dan Sumber Daya Mineral.' },
        'iso': { title: 'Sertifikasi ISO', desc: 'Pelatihan dan sertifikasi sistem manajemen standar internasional.' },
        'non-sertifikasi': { title: 'Non Sertifikasi', desc: 'Program pengembangan skill dan kompetensi mandiri.' },
        'sertifikasi-sio': { title: 'Perpanjangan SIO', desc: 'Layanan pembaruan Surat Izin Operasional alat berat dan industri.' },
        'sertifikasi-bnsp': { title: 'Sertifikasi BNSP', desc: 'Sertifikasi kompetensi profesi nasional melalui LSP.' },
        'sertifikasi-kemnaker': { title: 'Sertifikasi Kemnaker RI', desc: 'Program sertifikasi resmi dari Kementerian Tenaga Kerja RI.' }
    };

    function filterServices(category, searchTerm = '') {
        let visibleCount = 0;
        const normalizedSearch = searchTerm.toLowerCase().trim();

        serviceCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
            const cardDesc = card.querySelector('.card-description').textContent.toLowerCase();

            const matchCategory = (category === 'all' || cardCategory === category);
            const matchSearch = cardTitle.includes(normalizedSearch) || cardDesc.includes(normalizedSearch);

            if (matchCategory && matchSearch) {
                card.classList.remove('hide');
                visibleCount++;
            } else {
                card.classList.add('hide');
            }
        });

        // Show/Hide Empty State with animation
        if (visibleCount === 0) {
            servicesGrid.style.display = 'none';
            emptyState.classList.add('show');
        } else {
            servicesGrid.style.display = 'grid';
            emptyState.classList.remove('show');
        }

        // Update Header Info if category changed (only if not search-led)
        if (!searchTerm && categoryData[category]) {
            updateHeader(category);
        }
    }

    function updateHeader(category) {
        const content = document.querySelector('.services-content');
        content.classList.add('fade');

        setTimeout(() => {
            pageTitle.textContent = categoryData[category].title;
            pageDesc.textContent = categoryData[category].desc;
            content.classList.remove('fade');
        }, 300);
    }

    // Category Click Event
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // UI Update
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const selectedCategory = item.dataset.category;
            filterServices(selectedCategory, searchInput.value);

            // Scroll to top of content on mobile
            if (window.innerWidth <= 1024) {
                window.scrollTo({
                    top: document.querySelector('.services-header').offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Search Input Event
    searchInput.addEventListener('input', (e) => {
        const activeCategory = document.querySelector('.category-item.active').dataset.category;
        filterServices(activeCategory, e.target.value);
    });

    // Initial Filter Trigger
    const initialCategory = document.querySelector('.category-item.active').dataset.category;
    filterServices(initialCategory);
});
