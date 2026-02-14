/**
 * Lottie Loader Utility
 * Provides helper functions to render Lottie animations as loading indicators.
 */

/**
 * Initialize a Lottie animation in a container element.
 * @param {string} containerId - The ID of the container element.
 * @param {string} jsonPath - Path to the Lottie JSON file.
 * @returns {object|null} The Lottie animation instance, or null if failed.
 */
function initLottieLoader(containerId, jsonPath) {
    const container = document.getElementById(containerId);
    if (!container || typeof lottie === 'undefined') return null;

    return lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: jsonPath
    });
}

/**
 * Create inline loading HTML string with a Lottie container.
 * After inserting this HTML, call initLottieLoader() to start the animation.
 * @param {string} lottieId - Unique ID for the lottie container div.
 * @param {string} message - Loading message text.
 * @param {string} extraStyle - Optional extra inline style for the wrapper.
 * @returns {string} HTML string.
 */
function createInlineLoaderHTML(lottieId, message, extraStyle) {
    const style = extraStyle ? ` style="${extraStyle}"` : '';
    return `
        <div class="loading-state"${style}>
            <div class="lottie-container" id="${lottieId}"></div>
            <p>${message}</p>
        </div>
    `;
}
