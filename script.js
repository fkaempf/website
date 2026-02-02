/**
 * Personal Website - Drawer Navigation & ORCID Publications
 */

const ORCID_ID = '0009-0001-7036-4729';

document.addEventListener('DOMContentLoaded', () => {
    fetchPublications();
    const drawer = document.getElementById('contentDrawer');
    const drawerClose = document.getElementById('drawerClose');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.drawer-section');

    let currentSection = null;

    /**
     * Open the drawer and show the specified section
     */
    function openSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show the target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update nav item states
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });

        // Open the drawer
        drawer.classList.add('open');
        currentSection = sectionId;

        // Scroll drawer to top
        drawer.scrollTop = 0;
    }

    /**
     * Close the drawer
     */
    function closeDrawer() {
        drawer.classList.remove('open');
        
        // Remove active state from nav items after transition
        setTimeout(() => {
            if (!drawer.classList.contains('open')) {
                navItems.forEach(item => item.classList.remove('active'));
                currentSection = null;
            }
        }, 400); // Match CSS transition duration
    }

    // Nav item click handlers
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            
            // If clicking the same section that's open, close the drawer
            if (currentSection === sectionId && drawer.classList.contains('open')) {
                closeDrawer();
            } else {
                openSection(sectionId);
            }
        });
    });

    // Close button handler
    drawerClose.addEventListener('click', closeDrawer);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });

    // Optional: Close when clicking outside the drawer and profile card
    document.addEventListener('click', (e) => {
        const isClickInsideDrawer = drawer.contains(e.target);
        const isClickInsideProfile = e.target.closest('.profile-card');

        if (!isClickInsideDrawer && !isClickInsideProfile && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });
});

/**
 * Fetch publications from ORCID API
 */
async function fetchPublications() {
    const container = document.getElementById('publications-list');

    try {
        const response = await fetch(`https://pub.orcid.org/v3.0/${ORCID_ID}/works`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch publications');

        const data = await response.json();
        const works = data.group || [];

        if (works.length === 0) {
            container.innerHTML = '<p>No publications found.</p>';
            return;
        }

        const publications = works.map(work => {
            const summary = work['work-summary'][0];
            const title = summary.title?.title?.value || 'Untitled';
            const year = summary['publication-date']?.year?.value || '';
            const journal = summary['journal-title']?.value || 'Preprint';
            const type = summary.type || '';

            // Get DOI from external IDs
            const externalIds = summary['external-ids']?.['external-id'] || [];
            const doi = externalIds.find(id => id['external-id-type'] === 'doi')?.['external-id-value'];

            return { title, year, journal, type, doi };
        });

        // Sort by year descending
        publications.sort((a, b) => (b.year || 0) - (a.year || 0));

        container.innerHTML = publications.map(pub => `
            <article class="publication">
                <h3 class="pub-title">${pub.title}</h3>
                <p class="pub-journal">${pub.journal}${pub.year ? `, ${pub.year}` : ''}</p>
                ${pub.doi ? `
                <div class="pub-links">
                    <a href="https://doi.org/${pub.doi}" class="pub-link" target="_blank" rel="noopener">Paper</a>
                </div>
                ` : ''}
            </article>
        `).join('');

    } catch (error) {
        console.error('Error fetching publications:', error);
        container.innerHTML = '<p>Unable to load publications. Please try again later.</p>';
    }
}
