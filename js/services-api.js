/**
 * Services Page API Integration
 * Fetches proposal categories and proposals from the PHP API
 * and dynamically populates the services page
 */

const API_BASE_URL = `http://${window.location.hostname}:9999/api`;

// Descriptions and Titles for categories
// Keys must match the generated slugs
const CATEGORY_DETAILS = {
    'all': {
        title: 'Semua Layanan',
        desc: 'Daftar lengkap program pelatihan dan sertifikasi kami.'
    },
    'sertifikasi-bnsp': {
        title: 'Sertifikasi BNSP',
        desc: 'Sertifikasi kompetensi profesi nasional melalui LSP.'
    },
    'sertifikasi-kemnaker': {
        title: 'Sertifikasi Kemnaker RI',
        desc: 'Program sertifikasi resmi dari Kementerian Tenaga Kerja RI.'
    },
    'sertifikasi-migas': {
        title: 'Sertifikasi Migas',
        desc: 'Pelatihan dan sertifikasi khusus industri minyak dan gas.'
    },
    'soft-skill': {
        title: 'Soft Skill',
        desc: 'Pengembangan keahlian interpersonal dan manajemen.'
    },
    // Fallback for strict matches if slug generation varies
    'bnsp': { title: 'Sertifikasi BNSP', desc: 'Sertifikasi kompetensi profesi nasional melalui LSP.' },
    'migas': { title: 'Sertifikasi Migas', desc: 'Pelatihan dan sertifikasi khusus industri minyak dan gas.' },
    'kemnaker': { title: 'Sertifikasi Kemnaker RI', desc: 'Program sertifikasi resmi dari Kementerian Tenaga Kerja RI.' },
    'softskill': { title: 'Soft Skill', desc: 'Pengembangan keahlian interpersonal dan manajemen.' }
};

/**
 * Initialize the services page with API data
 */
async function initServicesPage() {
    try {
        // Fetch all data in parallel
        const results = await Promise.allSettled([
            fetchProposalCategories(),
            fetchBnspProposals(),
            fetchKemnakerProposals()
        ]);

        const categories = results[0].status === 'fulfilled' ? results[0].value : [];
        const bnspProposals = results[1].status === 'fulfilled' ? results[1].value : [];
        const kemnakerProposals = results[2].status === 'fulfilled' ? results[2].value : [];

        // Log errors if any
        if (results[0].status === 'rejected') console.error('Failed to fetch categories:', results[0].reason);
        if (results[1].status === 'rejected') console.error('Failed to fetch BNSP proposals:', results[1].reason);
        if (results[2].status === 'rejected') console.error('Failed to fetch Kemnaker proposals:', results[2].reason);

        // Render Sidebar Categories
        renderSidebar(categories);

        // Normalize and Combine all proposals
        const allProposals = [
            ...bnspProposals.map(p => normalizeProposal(p, 'bnsp')),
            ...kemnakerProposals.map(p => normalizeProposal(p, 'kemnaker'))
        ];

        // Assign proposals to dynamic categories
        // We add a 'categorySlug' property to each proposal for easier filtering
        allProposals.forEach(p => {
            p.categorySlug = createCategorySlug(p.proposal_category);
        });

        // Update category counts in sidebar
        updateCategoryCounts(allProposals, categories);

        // Render program cards
        renderProgramCards(allProposals);

        // Reinitialize filtering logic
        reinitializeFiltering(allProposals);

    } catch (err) {
        console.error('Error initializing services page:', err);
    }
}

/**
 * Fetch proposal categories from API
 */
async function fetchProposalCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/proposalCategorys`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        return json.data || [];
    } catch (err) {
        console.error('Error fetching categories:', err);
        return [];
    }
}

/**
 * Fetch BNSP proposals from API
 */
async function fetchBnspProposals() {
    try {
        const response = await fetch(`${API_BASE_URL}/bnspProposals`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        return json.data || [];
    } catch (err) {
        console.error('Error fetching BNSP proposals:', err);
        return [];
    }
}

/**
 * Fetch Kemnaker proposals from API
 */
async function fetchKemnakerProposals() {
    try {
        const response = await fetch(`${API_BASE_URL}/kemnakerProposals`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        return json.data || [];
    } catch (err) {
        console.error('Error fetching Kemnaker proposals:', err);
        return [];
    }
}

/**
 * Convert Google Drive view URL to direct image URL
 * Uses lh3.googleusercontent.com for better CORS support
 */
function formatGoogleDriveUrl(url) {
    if (!url) return null;

    let fileId = null;

    // Check for standard view URL: https://drive.google.com/file/d/ID/view...
    const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (viewMatch && viewMatch[1]) {
        fileId = viewMatch[1];
    }

    // Check for id param: id=ID
    if (!fileId) {
        const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            fileId = idMatch[1];
        }
    }

    if (fileId) {
        // Use thumbnail format with large size - better CORS support
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }

    // If it's already a direct link or different format
    return url;
}

/**
 * Normalize proposal data to a common structure
 */
function normalizeProposal(proposal, type) {
    // Prioritize image_title (converted from Drive URL if needed), then online, then offline, then default
    const imageSrc = formatGoogleDriveUrl(proposal.image_title) ||
        proposal.image_online ||
        proposal.image_offline ||
        getDefaultImage(type);

    return {
        ...proposal,
        type: type,
        // Ensure properties exist and fallback
        proposal_category: proposal.proposal_category || (type === 'bnsp' ? 'BNSP' : 'Kemnaker'),
        image: imageSrc,
        // Create detail URL
        detailUrl: type === 'bnsp'
            ? `proposal/bnsp.html?id=${proposal.id}`
            : `proposal/kemnaker.html?id=${proposal.id}`
    };
}

/**
 * Create a URL-friendly slug from string
 */
function createCategorySlug(name) {
    if (!name) return 'other';
    const normalized = name.toLowerCase().trim();

    // Map API names to desired slugs
    if (normalized === 'bnsp') return 'sertifikasi-bnsp';
    if (normalized === 'kemnaker') return 'sertifikasi-kemnaker';
    if (normalized === 'migas') return 'sertifikasi-migas';
    if (normalized === 'softskill') return 'soft-skill';

    return normalized.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Render Sidebar Categories dynamically
 */
function renderSidebar(categories) {
    const sidebarList = document.querySelector('.category-list');
    if (!sidebarList) return;

    // Start with 'All'
    let html = `
        <a href="#" class="category-item active" data-category="all">
            Tampilkan Semua <span class="category-count">0</span>
        </a>
    `;

    // Add dynamic categories
    categories.forEach(cat => {
        const slug = createCategorySlug(cat.name);
        const details = CATEGORY_DETAILS[slug] || CATEGORY_DETAILS[cat.name.toLowerCase()] || {};
        const displayName = details.title || cat.name;

        html += `
            <a href="#" class="category-item" data-category="${slug}">
                ${displayName} <span class="category-count">0</span>
            </a>
        `;
    });

    sidebarList.innerHTML = html;
}

/**
 * Update category counts in sidebar
 */
function updateCategoryCounts(proposals, categories) {
    // Count 'all'
    const allCountBadge = document.querySelector('.category-item[data-category="all"] .category-count');
    if (allCountBadge) allCountBadge.textContent = proposals.length;

    // Count specific categories
    categories.forEach(cat => {
        const slug = createCategorySlug(cat.name);
        const count = proposals.filter(p => p.categorySlug === slug).length;

        const badge = document.querySelector(`.category-item[data-category="${slug}"] .category-count`);
        if (badge) badge.textContent = count;
    });
}

/**
 * Render program cards from API data
 */
function renderProgramCards(proposals) {
    const grid = document.querySelector('.program-grid');
    if (!grid) return;

    // Clear existing cards
    grid.innerHTML = '';

    if (proposals.length === 0) {
        showEmptyState();
        return;
    }

    proposals.forEach(proposal => {
        const card = createProgramCard(proposal);
        grid.insertAdjacentHTML('beforeend', card);
    });
}

/**
 * Create a program card HTML
 */
function createProgramCard(proposal) {
    const slug = proposal.categorySlug;
    const details = CATEGORY_DETAILS[slug] || {};
    // If we have a mapped title (e.g. Sertifikasi BNSP), use it. Otherwise use api value.
    const categoryLabel = details.title || proposal.proposal_category;

    const description = sanitizeDescription(proposal.training_description || '');

    // Choose appropriate image placeholder
    const imageSrc = proposal.image || getDefaultImage(proposal.type);

    return `
        <div class="program-card" data-category="${proposal.categorySlug}">
            <div class="card-image-wrapper">
                <img src="${imageSrc}" alt="${proposal.title}" class="card-image" 
                     onerror="this.src='assets/images/logo-he.png'">
            </div>
            <div class="card-badges">
                <span class="badge-category">${categoryLabel}</span>
            </div>
            <div class="card-content">
                <h3 class="card-title">${proposal.title}</h3>
                <div class="card-meta">
                    <svg class="meta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>${proposal.timetable1 || 'Jadwal Tersedia'}</span>
                </div>
                <p class="card-description">${description}</p>
                <a href="${proposal.detailUrl}" class="btn-card-detail">Lihat Detail Kelas</a>
            </div>
        </div>
    `;
}

/**
 * Get default image based on proposal type
 */
function getDefaultImage(type) {
    return type === 'bnsp'
        ? 'assets/images/lca2.png'
        : 'assets/images/muda-linker.png';
}

/**
 * Sanitize and truncate description
 */
function sanitizeDescription(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
}

/**
 * Show empty state when no proposals
 */
function showEmptyState() {
    const grid = document.querySelector('.program-grid');
    const emptyState = document.getElementById('empty-state');

    if (grid) grid.style.display = 'none';
    if (emptyState) emptyState.classList.add('show');
}

/**
 * Reinitialize filtering after dynamic content load
 */
function reinitializeFiltering(allProposals) {
    const categoryItems = document.querySelectorAll('.category-item');
    const searchInput = document.querySelector('.search-input');

    categoryItems.forEach(item => {
        // Clone to remove existing event listeners
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);

        newItem.addEventListener('click', (e) => {
            e.preventDefault();

            // Update active state
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            newItem.classList.add('active');

            const categorySlug = newItem.dataset.category;
            filterPrograms(categorySlug, searchInput?.value || '');

            // Update header
            updatePageHeader(categorySlug);
        });
    });

    // Search input handler
    if (searchInput) {
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);

        newSearchInput.addEventListener('input', (e) => {
            const activeCategory = document.querySelector('.category-item.active')?.dataset.category || 'all';
            filterPrograms(activeCategory, e.target.value);
        });
    }
}

/**
 * Filter programs by category and search term
 */
function filterPrograms(categorySlug, searchTerm = '') {
    const cards = document.querySelectorAll('.program-card');
    const emptyState = document.getElementById('empty-state');
    const grid = document.querySelector('.program-grid');
    const normalizedSearch = searchTerm.toLowerCase().trim();

    let visibleCount = 0;

    cards.forEach(card => {
        const cardCategory = card.dataset.category;
        const cardTitle = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const cardDesc = card.querySelector('.card-description')?.textContent.toLowerCase() || '';

        const isCategoryMatch = categorySlug === 'all' || cardCategory === categorySlug;
        const isSearchMatch = cardTitle.includes(normalizedSearch) || cardDesc.includes(normalizedSearch);

        if (isCategoryMatch && isSearchMatch) {
            card.style.display = 'flex';
            card.classList.remove('hide');
            visibleCount++;
        } else {
            card.classList.add('hide');
            setTimeout(() => card.style.display = 'none', 300);
        }
    });

    // Toggle empty state
    if (visibleCount === 0) {
        if (grid) grid.style.display = 'none';
        if (emptyState) emptyState.classList.add('show');
    } else {
        if (grid) grid.style.display = 'grid';
        if (emptyState) emptyState.classList.remove('show');
    }
}

/**
 * Update page header based on selected category
 */
function updatePageHeader(categorySlug) {
    const defaultInfo = { title: 'Layanan Kami', desc: 'Daftar program pelatihan dan sertifikasi.' };

    // Look up by slug or by normalized name
    const info = CATEGORY_DETAILS[categorySlug] || defaultInfo;

    // If still not found, fallback to auto-title
    if (!CATEGORY_DETAILS[categorySlug] && categorySlug !== 'all') {
        const autoTitle = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        info.title = autoTitle; // Use auto-generated title but keep default description
    }

    const pageTitle = document.querySelector('.page-title-group h1');
    const pageDesc = document.querySelector('.page-title-group p');

    if (pageTitle) pageTitle.textContent = info.title;
    if (pageDesc) pageDesc.textContent = info.desc;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initServicesPage();
});
