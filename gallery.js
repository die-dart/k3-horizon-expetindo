/**
 * PT Horizon Solusi Expertindo
 * Gallery Page Data & Logic
 * Senior Engineer: Antigravity AI
 */

// 1. Gallery Data Model
const galleryData = [
    {
        id: 1,
        image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1470&auto=format&fit=crop',
        title: 'Pelatihan K3 Dasar',
        event_name: 'Sertifikasi BNSP',
        event_year: '2024'
    },
    {
        id: 2,
        image_url: 'https://images.unsplash.com/photo-1544725121-be3b50897ea3?q=80&w=1470&auto=format&fit=crop',
        title: 'Inspeksi Keselamatan Kerja',
        event_name: 'Workshop Teknik',
        event_year: '2024'
    },
    {
        id: 3,
        image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1470&auto=format&fit=crop',
        title: 'Manajemen Risiko Industri',
        event_name: 'Konsultasi Korporat',
        event_year: '2023'
    },
    {
        id: 4,
        image_url: 'https://images.unsplash.com/photo-1573161158365-59b7aa364137?q=80&w=1469&auto=format&fit=crop',
        title: 'Audit Lingkungan Hidup',
        event_name: 'Sertifikasi ISO',
        event_year: '2023'
    },
    {
        id: 5,
        image_url: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=1471&auto=format&fit=crop',
        title: 'Tanggap Darurat Kebakaran',
        event_name: 'Simulasi Lapangan',
        event_year: '2024'
    },
    {
        id: 6,
        image_url: 'https://images.unsplash.com/photo-1454165833762-02c3325619b8?q=80&w=1470&auto=format&fit=crop',
        title: 'Kesehatan Kerja Terpadu',
        event_name: 'Webinar Nasional',
        event_year: '2023'
    },
    {
        id: 7,
        image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop',
        title: 'Kolaborasi Tim K3',
        event_name: 'Internal Training',
        event_year: '2024'
    },
    {
        id: 8,
        image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop',
        title: 'Perencanaan Strategis K3',
        event_name: 'Risk Management Summit',
        event_year: '2024'
    }
];

// 2. State Management
let currentImageIndex = 0;

// 3. DOM Elements
const galleryGrid = document.getElementById('gallery-grid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

// 4. Initialization
function initGallery() {
    renderGallery();
    setupEventListeners();
}

// 5. Functions
function renderGallery() {
    galleryGrid.innerHTML = galleryData.map((item, index) => `
        <div class="gallery-card" onclick="openLightbox(${index})">
            <div class="image-wrapper">
                <img src="${item.image_url}" alt="${item.title}" class="gallery-thumb">
                <div class="card-overlay">
                    <span class="overlay-title">${item.title}</span>
                </div>
            </div>
            <div class="card-info">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-subtitle">${item.event_name} • ${item.event_year}</p>
            </div>
        </div>
    `).join('');
}

function openLightbox(index) {
    currentImageIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function updateLightboxImage() {
    const item = galleryData[currentImageIndex];
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        lightboxImg.src = item.image_url;
        lightboxImg.alt = item.title;
        lightboxImg.style.opacity = '1';
    }, 200);
}

function showNext() {
    currentImageIndex = (currentImageIndex + 1) % galleryData.length;
    updateLightboxImage();
}

function showPrev() {
    currentImageIndex = (currentImageIndex - 1 + galleryData.length) % galleryData.length;
    updateLightboxImage();
}

function setupEventListeners() {
    // Close button
    closeBtn.addEventListener('click', closeLightbox);

    // Navigation buttons
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
    });

    // Close on overlay click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'Escape') closeLightbox();
    });
}

// Run init
document.addEventListener('DOMContentLoaded', initGallery);
