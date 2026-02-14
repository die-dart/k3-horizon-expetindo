const API_BASE_URL = 'https://horizonexpert.id/api';

async function loadArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) {
        renderError('Artikel tidak ditemukan', 'Parameter ID hilang');
        return;
    }

    setLoadingState(true);

    try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        const article = json.data;

        if (article) {
            renderArticle(article);
        } else {
            renderError('Artikel tidak ditemukan', 'Data artikel tidak tersedia');
        }

    } catch (err) {
        console.error('Error loading article:', err);
        renderError('Gagal memuat artikel', err.message);
    }
    // No finally block to setLoadingState(false) because renderArticle/renderError overwrites the innerHTML anyway
}

function renderArticle(article) {
    const date = article.published_at ? new Date(article.published_at) : new Date();
    const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const layout = `
        <article>
            <header class="article-header">
                <span class="article-category">${article.category || 'Tanpa Kategori'}</span>
                <h1 class="article-title">${article.title}</h1>
                <div class="article-meta">Diterbitkan pada ${formattedDate}</div>
            </header>
            
            <div class="article-hero">
                <img src="${convertDriveLink(article.thumbnail || '')}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/1200x600?text=No+Image'">
            </div>
            
            <div class="article-body">
                ${article.content}
            </div>
        </article>
    `;

    document.getElementById('article-content').innerHTML = layout;
    document.title = `${article.title} - PT Horizon Solusi Expertindo`;
}

function renderError(title, message) {
    const container = document.getElementById('article-content');
    container.innerHTML = `
        <div style="text-align:center; padding: 10rem 2rem;">
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">${title}</h1>
            <p style="font-size: 1.2rem; margin-bottom: 2rem; color: var(--text-secondary);">${message}</p>
            <a href="blog.html" style="color: var(--primary-color); text-decoration: underline; font-weight: 600;">Kembali ke Blog</a>
        </div>
    `;
}

function convertDriveLink(url) {
    if (!url) return '';

    // If it's already a valid image URL, return it
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && !url.includes('drive.google.com')) {
        return url;
    }

    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
        if (idMatch && idMatch[1]) {
            return `https://lh3.googleusercontent.com/u/0/d/${idMatch[1]}`;
        }
    }
    return url;
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    const container = document.getElementById('article-content');
    if (!container) return;

    if (loading) {
        container.innerHTML = createInlineLoaderHTML('lottie-article-inline', 'Memuat artikel...', 'padding: 10rem 2rem;');
        initLottieLoader('lottie-article-inline', 'assets/loading.json');
    }
}

document.addEventListener('DOMContentLoaded', loadArticle);
