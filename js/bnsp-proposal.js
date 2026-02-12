/**
 * BNSP Proposal API Integration
 * Fetches data from the PHP API and populates the BNSP proposal page
 */

const API_BASE_URL = 'http://localhost:9999/api';

/**
 * Fetch BNSP proposal by ID from URL parameter
 */
async function fetchBnspProposal() {
    const urlParams = new URLSearchParams(window.location.search);
    const proposalId = urlParams.get('id');

    if (!proposalId) {
        console.log('No proposal ID provided, using static content');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/bnspProposals/${proposalId}`, {
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
            populateBnspProposal(proposal);
        }

    } catch (err) {
        console.error('Error fetching BNSP proposal:', err);
    } finally {
        if (typeof window.markDataLoaded === 'function') {
            window.markDataLoaded();
        }
    }
}

/**
 * Populate the page with BNSP proposal data
 */
function populateBnspProposal(proposal) {
    // Update page title
    document.title = `BNSP - ${proposal.title} | PT Horizon Expetindo`;

    // Hero section
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.textContent = proposal.title;

    const categoryBadge = document.querySelector('.category-badge');
    if (categoryBadge) categoryBadge.textContent = proposal.proposal_category || 'Sertifikasi BNSP';

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
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }

        return url;
    }

    // Hero image
    const imageSrc = formatGoogleDriveUrl(proposal.image_title) ||
        proposal.image_online ||
        proposal.image_offline;

    if (imageSrc) {
        const heroImage = document.querySelector('.hero-image img');
        if (heroImage) {
            heroImage.src = imageSrc;
            // Add fallback just in case
            heroImage.onerror = function () {
                this.src = '../assets/images/lca2.png'; // Default fallback
            };
        }
    }

    // Training description
    const descriptionBlock = document.querySelector('.content-block');
    if (descriptionBlock) {
        // Update training description
        const descriptionH2 = descriptionBlock.querySelector('h2');
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

    // Unit competency table
    if (proposal.unit_code && proposal.unit_title) {
        populateUnitTable(proposal.unit_code, proposal.unit_title);
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
 * Populate unit competency table
 */
function populateUnitTable(unitCode, unitTitle) {
    const tbody = document.querySelector('.syllabus-table tbody');
    if (!tbody) return;

    let codes = [];
    let titles = [];

    try {
        codes = JSON.parse(unitCode);
        titles = JSON.parse(unitTitle);
    } catch {
        // Handle escaped newlines (\\n as literal string), /n, or actual newlines
        // Note: Some data uses /n as separator
        codes = unitCode.split(/\/n|\\n|\\\\n/).map(c => c.trim()).filter(Boolean);
        titles = unitTitle.split(/\/n|\\n|\\\\n/).map(t => t.trim()).filter(Boolean);
    }

    // Clear existing rows
    tbody.innerHTML = '';

    codes.forEach((code, index) => {
        const title = titles[index] || '-';
        tbody.innerHTML += `
            <tr>
                <td>${code}</td>
                <td>${title}</td>
            </tr>
        `;
    });
}

/**
 * Fetch all BNSP proposals for listing
 */
async function fetchAllBnspProposals() {
    try {
        const response = await fetch(`${API_BASE_URL}/bnspProposals`, {
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
        console.error('Error fetching BNSP proposals:', err);
        return [];
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    fetchBnspProposal();
});
