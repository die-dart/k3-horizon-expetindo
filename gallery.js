/**
 * PT Horizon Solusi Expertindo
 * Gallery Page Data & Logic - Dynamic Supabase Version
 */

// 1. Supabase Configuration
const SUPABASE_URL = 'https://fjzzbrqxkprsxjqlpqly.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_c4qv84Kkzdb6g7KJCnyEfg_eeOEFmfx';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. State Management
let galleryData = [];
let filteredData = [];
let currentImageIndex = 0;
let activeFilter = 'semua';

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
 * Fetch Categories from Supabase
 */
async function fetchCategories() {
    if (!filterContainer) return;

    try {
        // Fetch categories from the galleries table
        let { data, error } = await supabaseClient
            .from('galleries')
            .select('category');

        if (error) throw error;

        // Extract unique categories and filter out nulls
        const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];

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
        // Fallback to basic categories if table is empty or error occurs
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

    return str
        .split('-')
        .map(word => {
            const lower = word.toLowerCase();
            return acronyms[lower] || (word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
        })
        .join(' ');
}

/**
 * Fetch Gallery Items from Supabase
 */
async function fetchGalleryItems() {
    try {
        let { data, error } = await supabaseClient
            .from('galleries')
            .select('*')
            .order('published_at', { ascending: false });

        if (error) throw error;

        galleryData = data || [];
        filteredData = [...galleryData];
        renderGallery();
    } catch (err) {
        console.error('Error fetching gallery items:', err.message);
        if (galleryGrid) {
            galleryGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <p>Gagal memuat galeri: ${err.message}</p>
                </div>
            `;
        }
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
    if (!galleryGrid) return;

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
                <img src="${convertDriveLink(item.image)}" alt="${item.title}" class="gallery-thumb">
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
        lightboxImg.src = convertDriveLink(item.image);
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

// Helper: Convert Google Drive Link
function convertDriveLink(url) {
    if (!url) return 'https://via.placeholder.com/800x450?text=No+Image';
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
