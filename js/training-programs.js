/**
 * ===== TRAINING PROGRAMS CAROUSEL =====
 * Manages the training programs carousel functionality
 * Features:
 * - Fetches data from API (BNSP & Kemnaker)
 * - Dynamic card rendering
 * - Responsive card display (3 on desktop, 2 on tablet, 1 on mobile)
 * - Previous/Next navigation
 * - Touch swipe support
 */

const API_BASE_URL = `http://${window.location.hostname}:9999/api`;

document.addEventListener('DOMContentLoaded', function () {
    initCarousel();
});

async function initCarousel() {
    try {
        // Fetch data from API
        const [bnspData, kemnakerData] = await Promise.all([
            fetchProposals('bnspProposals'),
            fetchProposals('kemnakerProposals')
        ]);

        // Normalize and combine data
        const allProposals = [
            ...bnspData.map(p => normalizeProposal(p, 'bnsp')),
            ...kemnakerData.map(p => normalizeProposal(p, 'kemnaker'))
        ];

        // Render cards to DOM
        renderCarouselCards(allProposals);

        // Initialize Carousel Logic (after content is loaded)
        setupCarouselLogic();

    } catch (error) {
        console.error('Failed to initialize carousel:', error);
        // Optional: Render error state or fallback content
    }
}

async function fetchProposals(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();
        return json.data || [];
    } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
        return [];
    }
}

function normalizeProposal(proposal, type) {
    // Choose appropriate image placeholder
    const defaultImage = type === 'bnsp' ? 'assets/images/lca2.png' : 'assets/images/muda-linker.png';

    // Format image URL if needed (e.g. Google Drive)
    const imageSrc = formatGoogleDriveUrl(proposal.image_title) ||
        proposal.image_online ||
        proposal.image_offline ||
        defaultImage;

    return {
        id: proposal.id,
        title: proposal.title,
        description: proposal.training_description || '',
        image: imageSrc,
        type: type,
        detailUrl: type === 'bnsp'
            ? `proposal/bnsp.html?id=${proposal.id}`
            : `proposal/kemnaker.html?id=${proposal.id}`
    };
}

function formatGoogleDriveUrl(url) {
    if (!url) return null;
    let fileId = null;
    const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (viewMatch && viewMatch[1]) fileId = viewMatch[1];

    if (!fileId) {
        const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) fileId = idMatch[1];
    }

    if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;
    }
    return url;
}

function renderCarouselCards(proposals) {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    if (proposals.length === 0) {
        track.innerHTML = '<div style="text-align:center; width:100%; padding:20px;">Belum ada program training tersedia.</div>';
        return;
    }

    const html = proposals.map(proposal => {
        // Sanitize description
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = proposal.description;
        const cleanDesc = tempDiv.textContent || tempDiv.innerText || '';
        const shortDesc = cleanDesc.length > 120 ? cleanDesc.substring(0, 120) + '...' : cleanDesc;

        return `
            <article class="training-card">
                <div class="card-image-wrapper">
                    <img src="${proposal.image}" alt="${proposal.title}" class="card-image" onerror="this.src='assets/images/logo-he.png'">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${proposal.title}</h3>
                    <p class="card-description">
                        ${shortDesc}
                    </p>
                    <div class="card-footer">
                        <a href="${proposal.detailUrl}" class="card-link">Lihat Detail Kelas</a>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    track.innerHTML = html;
}

function setupCarouselLogic() {
    // ===== DOM ELEMENT REFERENCES =====
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const cards = document.querySelectorAll('.training-card');

    // Exit early if carousel elements don't exist
    if (!track || !prevBtn || !nextBtn || cards.length === 0) {
        return;
    }

    // ===== CAROUSEL STATE =====
    let currentIndex = 0;
    let cardsPerView = 3; // Default for desktop

    // ===== RESPONSIVE CARD CALCULATION =====
    function updateCardsPerView() {
        const width = window.innerWidth;
        if (width <= 640) {
            cardsPerView = 1;
        } else if (width <= 992) {
            cardsPerView = 2;
        } else {
            cardsPerView = 3;
        }
        updateCarousel();
    }

    // ===== CAROUSEL POSITION UPDATE =====
    function updateCarousel() {
        const cardWidth = cards[0].offsetWidth;
        const computedStyle = window.getComputedStyle(track);
        const gap = parseInt(computedStyle.gap) || 0;
        const offset = currentIndex * (cardWidth + gap);

        track.style.transform = `translateX(-${offset}px)`;

        // Update button disabled states
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= cards.length - cardsPerView;
    }

    // ===== EVENT LISTENERS =====
    prevBtn.addEventListener('click', function () {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', function () {
        if (currentIndex < cards.length - cardsPerView) {
            currentIndex++;
            updateCarousel();
        }
    });

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            currentIndex = 0;
            updateCardsPerView();
        }, 250);
    });

    // Keyboard Navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft' && !prevBtn.disabled) prevBtn.click();
        else if (e.key === 'ArrowRight' && !nextBtn.disabled) nextBtn.click();
    });

    // Touch Swipe
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && !nextBtn.disabled) nextBtn.click();
            else if (diff < 0 && !prevBtn.disabled) prevBtn.click();
        }
    }

    // Initial setup
    updateCardsPerView();
}
