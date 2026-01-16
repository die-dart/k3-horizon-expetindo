/**
 * PT Horizon Solusi Expertindo
 * Gallery Page Data & Logic - Custom Backend API Version
 */

// 1. Configuration
const API_BASE_URL = 'http://localhost:9999'; // Update this to your actual API URL

// 2. State Management
let galleryData = [];
let filteredData = [];
let currentImageIndex = 0;
let activeFilter = 'semua';
let isLoading = false;

// 3. DOM Elements
const galleryGrid = document.getElementById('gallery-grid');
const filterContainer = document.getElementById('category-filters');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

// 4. Initialization
async function initGallery() {
    await fetchCategories();
    await fetchGalleryItems();
    setupEventListeners();
}

// 5. Functions

/**
 * Fetch Categories from Backend API
 */
async function fetchCategories() {
    if (!filterContainer) return;

    try {
        // Fetch all galleries to extract unique categories
        const response = await fetch(`${API_BASE_URL}/galleries`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const data = result.data || result; // Handle both {data: [...]} and [...] responses

        // Extract unique categories and filter out nulls
        let uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];

        // Custom sort order definition (normalized keys)
        const sortOrder = ['kemnakerri', 'bnsp', 'nonsertifikasi'];

        const normalize = (s) => s.toLowerCase().replace(/[\s\-_]/g, '');

        // Sort the categories
        uniqueCategories.sort((a, b) => {
            const indexA = sortOrder.indexOf(normalize(a));
            const indexB = sortOrder.indexOf(normalize(b));

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        // Build the dynamic categories list
        const dynamicCategories = [
            { id: 'semua', name: 'Semua' },
            ...uniqueCategories.map(cat => ({
                id: cat.toLowerCase(),
                name: formatCategoryName(cat)
            }))
        ];

        renderFilters(dynamicCategories);
    } catch (err) {
        console.error('Error fetching categories:', err.message);
        // Fallback to basic categories if error occurs
        const fallbackCategories = [
            { id: 'semua', name: 'Semua' }
        ];
        renderFilters(fallbackCategories);
    }
}

/**
 * Helper: Format category string for display
 * Example: 'kemnaker-ri' -> 'Kemnaker RI'
 */
function formatCategoryName(str) {
    if (!str) return '';

    // Check for common acronyms or specific formatting
    const acronyms = {
        'bnsp': 'BNSP',
        'ri': 'RI',
        'k3': 'K3'
    };

    // Split by dash or space
    return str
        .split(/[\-\s]/)
        .map(word => {
            const lower = word.toLowerCase();
            if (acronyms[lower]) return acronyms[lower];

            // Standard Title Case
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

/**
 * Fetch Gallery Items from Backend API
 */
async function fetchGalleryItems() {
    try {
        // Show loading state
        setLoadingState(true);

        const response = await fetch(`${API_BASE_URL}/galleries`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const data = result.data || result; // Handle both {data: [...]} and [...] responses

        galleryData = data || [];
        filteredData = [...galleryData];

        setLoadingState(false);
        renderGallery();
    } catch (err) {
        console.error('Error fetching gallery items:', err.message);
        setLoadingState(false);

        if (galleryGrid) {
            galleryGrid.innerHTML = `
                <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <p style="color: #e74c3c; font-size: 1.2rem; margin-bottom: 1rem;">⚠️ Gagal memuat galeri</p>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">${err.message}</p>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Pastikan backend server berjalan di ${API_BASE_URL}</p>
                </div>
            `;
        }
    }
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    isLoading = loading;

    if (galleryGrid && loading) {
        galleryGrid.innerHTML = `
            <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(0,0,0,0.1); border-left-color: var(--primary-blue); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: var(--text-muted); margin-top: 1rem; font-size: 1rem;">Memuat galeri...</p>
            </div>
        `;
    }
}

function renderFilters(cats) {
    filterContainer.innerHTML = cats.map(cat => `
        <button class="category-btn ${activeFilter === cat.id ? 'active' : ''}" data-filter="${cat.id}">
            ${cat.name}
        </button>
    `).join('');

    // Add click events to filter buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            setActiveFilter(filter);
        });
    });
}

function setActiveFilter(filter) {
    activeFilter = filter;

    // Update UI
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Filter Data
    if (filter === 'semua') {
        filteredData = [...galleryData];
    } else {
        // Match category slug/id
        filteredData = galleryData.filter(item =>
            item.category?.toLowerCase() === filter.toLowerCase()
        );
    }

    renderGallery();
}

function renderGallery() {
    if (!galleryGrid || isLoading) return;

    if (filteredData.length === 0) {
        galleryGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                <p style="color: var(--text-muted); font-size: 1.2rem;">Belum ada dokumentasi untuk kategori ini.</p>
            </div>
        `;
        return;
    }

    galleryGrid.innerHTML = filteredData.map((item, index) => `
        <div class="gallery-card" onclick="openLightbox(${index})">
            <div class="image-wrapper">
                <img src="${convertDriveLink(item.thumbnail || item.image || '')}" alt="${item.title}" class="gallery-thumb" loading="lazy" onerror="this.src='https://via.placeholder.com/800x450?text=No+Image'">
                <div class="card-overlay">
                    <span class="overlay-title">${item.title}</span>
                </div>
            </div>
            <div class="card-info">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-subtitle">${item.category || ''} • ${formatDate(item.published_at)}</p>
            </div>
        </div>
    `).join('');
}

function openLightbox(index) {
    currentImageIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function updateLightboxImage() {
    const item = filteredData[currentImageIndex];
    if (!item) return;

    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        lightboxImg.src = convertDriveLink(item.thumbnail || item.image || '');
        lightboxImg.alt = item.title;
        lightboxImg.style.opacity = '1';
    }, 200);
}

function showNext() {
    if (filteredData.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % filteredData.length;
    updateLightboxImage();
}

function showPrev() {
    if (filteredData.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + filteredData.length) % filteredData.length;
    updateLightboxImage();
}

function setupEventListeners() {
    // Lightbox interactions
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNext();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrev();
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;

        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'Escape') closeLightbox();
    });
}

// Helper: Convert Google Drive Link to displayable image URL
function convertDriveLink(url) {
    if (!url) return 'https://via.placeholder.com/800x450?text=No+Image';

    // If it's already a valid image URL, return it
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && !url.includes('drive.google.com')) {
        return url;
    }

    // Convert Google Drive links to direct image links
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
        if (idMatch && idMatch[1]) {
            return `https://lh3.googleusercontent.com/u/0/d/${idMatch[1]}`;
        }
    }

    return url;
}

// Helper: Format Date
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.getFullYear().toString();
    } catch (e) {
        return '';
    }
}

// Run init
document.addEventListener('DOMContentLoaded', initGallery);
