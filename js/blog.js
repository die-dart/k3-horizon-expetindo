const API_BASE_URL = 'https://horizonexpert.id/dev/api';

// Fetch articles and derive categories from them
async function fetchArticlesAndCategories() {
    const grid = document.getElementById('blog-grid-container');
    const categoryContainer = document.getElementById('category-filters-container');

    try {
        const response = await fetch(`${API_BASE_URL}/articles`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        const articles = json.data || [];

        if (articles.length > 0) {
            // Render Articles
            renderArticles(articles, grid);

            // Derive and Render Unique Categories
            const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];
            renderCategories(categories, categoryContainer);

            // Initialize Filtering Logic
            initFiltering();
        } else {
            showEmptyState(grid, 'Tidak ada artikel ditemukan.');
        }

    } catch (err) {
        console.error('Error fetching articles:', err);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <p>Gagal memuat artikel: ${err.message}</p>
        </div>`;
    }
}

function renderArticles(articles, grid) {
    grid.innerHTML = ''; // Clean start

    // Check if published_at exists, if not use today's date or leave empty
    // Sorting: Newest first (assuming API might not strictly sort, or re-verify)
    // The API seems to just return them, we can sort client side if needed. 
    // Let's sort by ID descending or published_at descending if available.
    articles.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));

    articles.forEach(article => {
        const date = article.published_at ? new Date(article.published_at) : new Date();
        const formattedDate = formatDate(date);

        const card = `
            <article class="post-card" data-category="${(article.category || '').toLowerCase()}">
                <a href="article.html?id=${article.id}" class="post-image-link">
                    <img src="${convertDriveLink(article.thumbnail || '')}" alt="${article.title}" class="post-image" loading="lazy" onerror="this.src='https://via.placeholder.com/800x450?text=No+Image'">
                </a>
                <h2 class="post-title">${article.title}</h2>
                <p class="post-excerpt">${sanitizeExcerpt(article.content)}</p>
                <div class="post-meta" style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="post-date">${formattedDate}</span>
                    <a href="article.html?id=${article.id}" class="read-more-link" style="color: var(--primary-color); font-weight: 600; text-decoration: none; font-size: 0.85rem;">Baca Selengkapnya →</a>
                </div>
            </article>
        `;
        grid.insertAdjacentHTML('beforeend', card);
    });
}

function renderCategories(categories, container) {
    // Keep the "Semua" button if it exists or clear except it?
    // The HTML usually has "Semua" hardcoded or we assume empty container?
    // Let's assume we append to existing or keep "Semua".
    // Checking current HTML: container is empty or has buttons?
    // Usually "Semua" is static or first.
    // Let's look at how the previous script did it: it checked if button exists.

    categories.forEach(categoryName => {
        const filterTarget = categoryName.toLowerCase();

        // Check if button already exists (deduplication)
        if (container.querySelector(`[data-target="${filterTarget}"]`)) {
            return;
        }

        const button = document.createElement('button');
        button.className = 'category-btn';
        button.setAttribute('data-target', filterTarget);
        button.textContent = categoryName;
        container.appendChild(button);
    });
}

function formatDate(date) {
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).toUpperCase();
}

function sanitizeExcerpt(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || "";
    return text.substring(0, 150) + "...";
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

function initFiltering() {
    const filterButtons = document.querySelectorAll('.category-btn');
    const posts = document.querySelectorAll('.post-card');
    const emptyState = document.getElementById('empty-state');
    const blogGrid = document.querySelector('.blog-grid');

    filterButtons.forEach(button => {
        // Remove existing listeners by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            newButton.classList.add('active');

            const target = newButton.getAttribute('data-target');
            let visibleCount = 0;

            posts.forEach(post => {
                const category = post.getAttribute('data-category');
                if (target === 'all' || category === target) {
                    post.classList.remove('hidden');
                    visibleCount++;
                } else {
                    post.classList.add('hidden');
                }
            });

            // Toggle empty state
            if (visibleCount === 0) {
                blogGrid.classList.add('hidden');
                emptyState?.classList.remove('hidden');
            } else {
                blogGrid.classList.remove('hidden');
                emptyState?.classList.add('hidden');
            }
        });
    });
}

function showEmptyState(grid, message) {
    grid.innerHTML = '';
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.classList.remove('hidden');
        emptyState.querySelector('p').textContent = message;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchArticlesAndCategories();
});
