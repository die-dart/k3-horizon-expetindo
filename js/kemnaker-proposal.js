/**
 * Kemnaker Proposal API Integration
 * Fetches data from the PHP API and populates the Kemnaker proposal page
 */

const API_BASE_URL = 'http://localhost:9999/api';

/**
 * Fetch Kemnaker proposal by ID from URL parameter
 */
async function fetchKemnakerProposal() {
    const urlParams = new URLSearchParams(window.location.search);
    const proposalId = urlParams.get('id');

    if (!proposalId) {
        console.log('No proposal ID provided, using static content');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/kemnakerProposals/${proposalId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        const proposal = json.data;

        if (proposal) {
            populateKemnakerProposal(proposal);
        }

    } catch (err) {
        console.error('Error fetching Kemnaker proposal:', err);
    } finally {
        if (typeof window.markDataLoaded === 'function') {
            window.markDataLoaded();
        }
    }
}

/**
 * Populate the page with Kemnaker proposal data
 */
function populateKemnakerProposal(proposal) {
    // Update page title
    document.title = `Kemnaker - ${proposal.title} | PT Horizon Expetindo`;

    // Hero section
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.textContent = proposal.title;

    const categoryBadge = document.querySelector('.category-badge');
    if (categoryBadge) categoryBadge.textContent = proposal.proposal_category || 'Sertifikasi Kemnaker';

    /**
     * Convert Google Drive view URL to direct image URL
     * Uses thumbnail format for better CORS support
     */
    function formatGoogleDriveUrl(url) {
        if (!url) return null;

        let fileId = null;

        const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (viewMatch && viewMatch[1]) {
            fileId = viewMatch[1];
        }

        if (!fileId) {
            const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
            if (idMatch && idMatch[1]) {
                fileId = idMatch[1];
            }
        }

        if (fileId) {
            const driveUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
            return `${API_BASE_URL}/imageProxy?url=${encodeURIComponent(driveUrl)}`;
        }

        return url;
    }

    // Hero image - use image_title from kemnaker_proposals table
    const imageSrc = formatGoogleDriveUrl(proposal.image_title) ||
        proposal.image_online ||
        proposal.image_offline;

    if (imageSrc) {
        const heroImage = document.querySelector('.hero-image img');
        if (heroImage) {
            heroImage.src = imageSrc;
            // Add fallback just in case
            heroImage.onerror = function () {
                this.src = '../assets/images/muda-linker.png'; // Default fallback
            };
        }
    }

    // Training description
    const descriptionBlock = document.querySelector('.content-block');
    if (descriptionBlock) {
        // Update training description
        const descriptionP = descriptionBlock.querySelector('p');
        if (descriptionP && proposal.training_description) {
            descriptionP.innerHTML = proposal.training_description;
        }

        // Update legal basis
        const legalBasisP = descriptionBlock.querySelectorAll('p')[1];
        if (legalBasisP && proposal.legal_basis) {
            legalBasisP.innerHTML = proposal.legal_basis;
        }
    }

    // Condition/Requirements card
    if (proposal.condition) {
        const conditionCard = document.querySelector('.sidebar-column .info-card:first-child ul');
        if (conditionCard) {
            conditionCard.innerHTML = parseListContent(proposal.condition);
        }
    }

    // Facility card
    if (proposal.facility) {
        const facilityCard = document.querySelector('.sidebar-column .info-card:last-child ul');
        if (facilityCard) {
            facilityCard.innerHTML = parseListContent(proposal.facility);
        }
    }

    // Training material table (Materi Pelatihan)
    if (proposal.materi_title && (proposal.materi_teori || proposal.materi_praktik)) {
        populateMaterialTable(proposal.materi_title, proposal.materi_teori, proposal.materi_praktik);
    }

    // Schedule section
    if (proposal.timetable1 || proposal.timetable2) {
        const dateBox = document.querySelector('.schedule-box:first-child p');
        if (dateBox) dateBox.textContent = proposal.timetable1 || 'Coming Soon';
    }

    if (proposal.location1 || proposal.location2) {
        const locationBox = document.querySelector('.schedule-box:last-child p');
        if (locationBox) locationBox.textContent = proposal.location1 || 'Coming Soon';
    }

    // Download proposal button
    const downloadBtn = document.getElementById('btn-download-proposal');
    if (downloadBtn) {
        if (proposal.download_proposal) {
            downloadBtn.href = proposal.download_proposal;
            downloadBtn.target = '_blank';
            downloadBtn.rel = 'noopener noreferrer';
        } else {
            downloadBtn.style.display = 'none';
        }
    }
}

/**
 * Parse list content (JSON array or comma-separated)
 */
function parseListContent(content) {
    let items = [];

    try {
        items = JSON.parse(content);
    } catch {
        // Try splitting by comma or newline
        items = content.split(/[,\n]/).map(item => item.trim()).filter(Boolean);
    }

    return items.map(item => `
        <li style="margin-bottom: 1rem; display: flex; align-items: center; color: #555;">
            <i class="fas fa-check-circle" style="color: #27ae60; margin-right: 12px; font-size: 1.1rem;"></i>
            <span>${item}</span>
        </li>
    `).join('');
}

/**
 * Populate training material table with Teori and Praktik columns
 * Data format from database:
 * - materi_title: Items separated by \n, first item belongs to KELOMPOK DASAR, rest to Kelompok Inti
 * - materi_teori: Numbers separated by \n (last two are Evaluasi and JUMLAH)
 * - materi_praktik: Numbers separated by \n (last two are Evaluasi and JUMLAH)
 */
function populateMaterialTable(materiTitle, materiTeori, materiPraktik) {
    const tbody = document.querySelector('.syllabus-table tbody');
    if (!tbody) return;

    /**
     * Parse content that may be:
     * - Text with literal \n: "item1\nitem2"
     * - Or actual newlines
     */
    function parseContent(content) {
        if (!content) return [];

        // Handle literal \n (backslash-n as text)
        if (content.includes('\\n')) {
            return content.split('\\n').map(t => t.trim()).filter(Boolean);
        }

        // Handle actual newlines
        if (content.includes('\n')) {
            return content.split('\n').map(t => t.trim()).filter(Boolean);
        }

        // Single item
        return [content.trim()].filter(Boolean);
    }

    const titles = parseContent(materiTitle);
    const teoris = parseContent(materiTeori);
    const praktiks = parseContent(materiPraktik);

    // Clear entire tbody
    tbody.innerHTML = '';

    if (titles.length === 0) return;

    // First item goes under KELOMPOK DASAR
    const kelompokDasarTitle = titles[0] || '';
    const kelompokDasarTeori = teoris[0] || '-';
    const kelompokDasarPraktik = praktiks[0] || '-';

    // Convert <br> to proper HTML line breaks for display
    const formattedDasarTitle = kelompokDasarTitle.replace(/<br>/gi, '<br>');

    // KELOMPOK DASAR content row
    tbody.innerHTML += `
        <tr class="content-row">
            <td>${formattedDasarTitle}</td>
            <td>${kelompokDasarTeori}</td>
            <td>${kelompokDasarPraktik}</td>
        </tr>
    `;

    // Kelompok Inti section header
    tbody.innerHTML += `
        <tr>
            <td class="section-header dark" colspan="3" style="text-align: center;">Kelompok Inti</td>
        </tr>
    `;

    // Kelompok Inti content rows (from index 1 to length-2, keeping last 2 for Evaluasi and JUMLAH)
    // Calculate where content ends: if teoris has more items than titles, last 2 in teoris are evaluasi & jumlah
    const contentEndIndex = titles.length; // All titles are content items

    // Content rows for Kelompok Inti (items after first one)
    for (let i = 1; i < contentEndIndex; i++) {
        const title = titles[i] || '';
        const teori = teoris[i] || '-';
        const praktik = praktiks[i] || '-';

        tbody.innerHTML += `
            <tr class="content-row">
                <td>${title}</td>
                <td>${teori}</td>
                <td>${praktik}</td>
            </tr>
        `;
    }

    // Evaluasi row (second to last values in teoris/praktiks if more than titles)
    // Based on data: teoris and praktiks have more items than titles for Evaluasi and JUMLAH
    const evaluasiIndex = titles.length; // After all content
    const evaluasiTeori = teoris[evaluasiIndex] || '-';
    const evaluasiPraktik = praktiks[evaluasiIndex] || '-';

    tbody.innerHTML += `
        <tr class="evaluasi-row">
            <td>Evaluasi</td>
            <td>${evaluasiTeori}</td>
            <td>${evaluasiPraktik}</td>
        </tr>
    `;

    // JUMLAH row (last value in praktiks is the total)
    const jumlahIndex = titles.length + 1;
    const jumlahValue = praktiks[jumlahIndex] || teoris[jumlahIndex] || '-';

    tbody.innerHTML += `
        <tr class="jumlah-row">
            <td>JUMLAH</td>
            <td colspan="2">${jumlahValue}</td>
        </tr>
    `;
}

/**
 * Fetch all Kemnaker proposals for listing
 */
async function fetchAllKemnakerProposals() {
    try {
        const response = await fetch(`${API_BASE_URL}/kemnakerProposals`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        return json.data || [];

    } catch (err) {
        console.error('Error fetching Kemnaker proposals:', err);
        return [];
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    fetchKemnakerProposal();
});
