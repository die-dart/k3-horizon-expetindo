/**
 * ===== TRAINING PROGRAMS CAROUSEL =====
 * Manages the training programs carousel functionality
 * Features:
 * - Responsive card display (3 on desktop, 2 on tablet, 1 on mobile)
 * - Previous/Next navigation buttons
 * - Keyboard arrow key navigation
 * - Touch swipe support for mobile devices
 * - Automatic recalculation on window resize
 */

document.addEventListener('DOMContentLoaded', function () {
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
    /**
     * Calculate how many cards to show based on screen width
     * Mobile (<=640px): 1 card
     * Tablet (<=992px): 2 cards
     * Desktop (>992px): 3 cards
     */
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
    /**
     * Update carousel position and button states
     * Calculates offset based on card width and gap
     */
    function updateCarousel() {
        const cardWidth = cards[0].offsetWidth;
        const gap = 24; // Must match CSS gap value
        const offset = currentIndex * (cardWidth + gap);

        // Apply transform to slide carousel
        track.style.transform = `translateX(-${offset}px)`;

        // Update button disabled states
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= cards.length - cardsPerView;
    }

    // ===== NAVIGATION BUTTON HANDLERS =====
    /**
     * Previous button: Move carousel left
     */
    prevBtn.addEventListener('click', function () {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    /**
     * Next button: Move carousel right
     */
    nextBtn.addEventListener('click', function () {
        if (currentIndex < cards.length - cardsPerView) {
            currentIndex++;
            updateCarousel();
        }
    });

    // ===== WINDOW RESIZE HANDLER =====
    /**
     * Handle window resize with debounce
     * Resets carousel to first card on resize
     */
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            currentIndex = 0; // Reset to first card on resize
            updateCardsPerView();
        }, 250); // 250ms debounce
    });

    // ===== KEYBOARD NAVIGATION =====
    /**
     * Enable arrow key navigation for accessibility
     * Left Arrow: Previous card
     * Right Arrow: Next card
     */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
            prevBtn.click();
        } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
            nextBtn.click();
        }
    });

    // ===== TOUCH SWIPE SUPPORT =====
    /**
     * Enable swipe gestures on touch devices
     * Swipe left: Next card
     * Swipe right: Previous card
     */
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50; // Minimum distance for swipe detection

    // Capture touch start position
    track.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    // Capture touch end position and handle swipe
    track.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    /**
     * Process swipe gesture and trigger navigation
     */
    function handleSwipe() {
        const diff = touchStartX - touchEndX;

        // Only trigger if swipe exceeds threshold
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && !nextBtn.disabled) {
                // Swipe left - go to next
                nextBtn.click();
            } else if (diff < 0 && !prevBtn.disabled) {
                // Swipe right - go to previous
                prevBtn.click();
            }
        }
    }

    // ===== INITIALIZATION =====
    // Initialize carousel with correct card count and position
    updateCardsPerView();
});
