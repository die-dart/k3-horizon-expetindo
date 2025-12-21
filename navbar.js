/**
 * ===== MOBILE NAVIGATION MENU =====
 * Handles mobile menu toggle functionality
 * Features:
 * - Hamburger menu animation
 * - Body scroll prevention when menu is open
 * - Auto-close on navigation link click
 * - Auto-close on window resize above mobile breakpoint
 */

document.addEventListener('DOMContentLoaded', function () {
    // ===== DOM ELEMENT REFERENCES =====
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const navLinks = document.querySelectorAll('.nav-link, .btn-contact');

    // Check if mobile menu elements exist
    if (!mobileMenuToggle || !navbarMenu) {
        return;
    }

    // ===== MOBILE MENU TOGGLE =====
    /**
     * Toggle mobile menu open/close
     * Also prevents body scrolling when menu is open
     */
    mobileMenuToggle.addEventListener('click', function () {
        // Toggle active class for hamburger animation
        this.classList.toggle('active');
        navbarMenu.classList.toggle('active');

        // Prevent body scroll when mobile menu is open
        if (navbarMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // ===== AUTO-CLOSE ON LINK CLICK =====
    /**
     * Close mobile menu when user clicks on a nav link
     * Only applies on mobile devices (width <= 768px)
     */
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                mobileMenuToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ===== AUTO-CLOSE ON WINDOW RESIZE =====
    /**
     * Close mobile menu when window is resized above mobile breakpoint
     * Prevents menu from staying open when switching to desktop view
     */
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            mobileMenuToggle.classList.remove('active');
            navbarMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
