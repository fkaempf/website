/**
 * Personal Website - Drawer Navigation & ORCID Publications
 */

const ORCID_ID = '0009-0001-7036-4729';

/**
 * Neural network animation - somas light up adjacently
 * Connection matrix computed from SVG striche (paths) geometry
 */
const neuralNetwork = {
    matrix: null, // Will be computed from SVG

    // Compute soma positions from their transform matrices
    getSomaPositions: function(somasGroup) {
        const somas = somasGroup.querySelectorAll('g');
        const positions = [];
        // Ellipse center in local coords
        const cx = 460.739, cy = 334.883;

        somas.forEach(g => {
            const transform = g.getAttribute('transform');
            if (transform) {
                const match = transform.match(/matrix\(([^)]+)\)/);
                if (match) {
                    const vals = match[1].split(',').map(Number);
                    // matrix(a,b,c,d,e,f) -> x = a*cx + e, y = d*cy + f
                    positions.push({
                        x: vals[0] * cx + vals[4],
                        y: vals[3] * cy + vals[5]
                    });
                }
            }
        });
        return positions;
    },

    // Parse path endpoints from striche
    getPathEndpoints: function(stricheGroup) {
        const paths = stricheGroup.querySelectorAll('path');
        const endpoints = [];

        paths.forEach(path => {
            const d = path.getAttribute('d');
            if (d) {
                // Parse "M x1,y1 L x2,y2" format
                const match = d.match(/M([\d.]+),([\d.]+)L([\d.]+),([\d.]+)/);
                if (match) {
                    endpoints.push({
                        p1: { x: parseFloat(match[1]), y: parseFloat(match[2]) },
                        p2: { x: parseFloat(match[3]), y: parseFloat(match[4]) }
                    });
                }
            }
        });
        return endpoints;
    },

    // Find nearest soma to a point
    findNearestSoma: function(point, somaPositions) {
        let minDist = Infinity;
        let nearest = -1;

        for (let i = 0; i < somaPositions.length; i++) {
            const dx = point.x - somaPositions[i].x;
            const dy = point.y - somaPositions[i].y;
            const dist = dx * dx + dy * dy; // squared distance is fine for comparison
            if (dist < minDist) {
                minDist = dist;
                nearest = i;
            }
        }
        return nearest;
    },

    // Build connection matrix from SVG geometry
    buildMatrix: function(svgContainer) {
        const somasGroup = svgContainer.querySelector('#somas, #somas-loader, [id^="somas"]');
        const stricheGroup = svgContainer.querySelector('#striche, #striche-loader, [id^="striche"]');

        if (!somasGroup || !stricheGroup) return null;

        const somaPositions = this.getSomaPositions(somasGroup);
        const pathEndpoints = this.getPathEndpoints(stricheGroup);
        const n = somaPositions.length;

        // Initialize empty matrix
        const matrix = Array(n).fill(null).map(() => Array(n).fill(0));

        // For each path, connect the two nearest somas
        pathEndpoints.forEach(ep => {
            const soma1 = this.findNearestSoma(ep.p1, somaPositions);
            const soma2 = this.findNearestSoma(ep.p2, somaPositions);

            if (soma1 !== -1 && soma2 !== -1 && soma1 !== soma2) {
                matrix[soma1][soma2] = 1;
                matrix[soma2][soma1] = 1;
            }
        });

        return matrix;
    },

    // Get neighbors of a node from the connection matrix
    getNeighbors: function(nodeIndex) {
        if (!this.matrix || !this.matrix[nodeIndex]) return [];
        const neighbors = [];
        for (let i = 0; i < this.matrix[nodeIndex].length; i++) {
            if (this.matrix[nodeIndex][i] === 1) neighbors.push(i);
        }
        return neighbors;
    },

    init: function(svgContainer) {
        const somasGroup = svgContainer.querySelector('#somas, #somas-loader, [id^="somas"]');
        if (!somasGroup) return null;

        const somas = somasGroup.querySelectorAll('g');
        if (somas.length === 0) return null;

        // Build connection matrix from this SVG's geometry
        this.matrix = this.buildMatrix(svgContainer);

        // Animation timing constants
        const RISE_TIME = 0.25;  // seconds
        const DECAY_TIME = 1.0;  // seconds

        // Set all somas to invisible initially
        somas.forEach(soma => {
            soma.style.opacity = '0';
            soma.style.transition = `opacity ${DECAY_TIME}s ease-out`;
        });

        return {
            somas: somas,
            currentActive: null,
            previousActive: null,
            riseTime: RISE_TIME,
            decayTime: DECAY_TIME,
            animate: function() {
                const self = this;

                function lightUpNext() {
                    let nextIndex;

                    if (self.currentActive === null) {
                        // Start at random position
                        nextIndex = Math.floor(Math.random() * self.somas.length);
                    } else {
                        // Get neighbors from connection matrix, excluding where we just came from
                        const allNeighbors = neuralNetwork.getNeighbors(self.currentActive);
                        const validNeighbors = allNeighbors.filter(n => n !== self.previousActive);

                        if (validNeighbors.length > 0) {
                            // Pick from neighbors we haven't just visited
                            nextIndex = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
                        } else if (allNeighbors.length > 0) {
                            // Dead end - only option is to go back
                            nextIndex = allNeighbors[Math.floor(Math.random() * allNeighbors.length)];
                        } else {
                            // No connections (shouldn't happen) - stay put
                            nextIndex = self.currentActive;
                        }

                        // Fade out current (slow decay)
                        if (self.somas[self.currentActive]) {
                            self.somas[self.currentActive].style.transition = `opacity ${self.decayTime}s ease-out`;
                            self.somas[self.currentActive].style.opacity = '0';
                        }
                    }

                    // Light up next (fast rise) and track history
                    if (self.somas[nextIndex]) {
                        self.somas[nextIndex].style.transition = `opacity ${self.riseTime}s ease-in`;
                        self.somas[nextIndex].style.opacity = '1';
                        self.previousActive = self.currentActive;
                        self.currentActive = nextIndex;
                    }

                    // Schedule next transition (propagation speed)
                    setTimeout(lightUpNext, 300 + Math.random() * 200);
                }

                lightUpNext();
            }
        };
    }
};

// Initialize brain animations when DOM is ready
function initBrainAnimations() {
    document.querySelectorAll('.brain-logo svg, .loading-brain').forEach(svg => {
        const network = neuralNetwork.init(svg);
        if (network) {
            network.animate();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchPublications();
    initBrainAnimations();

    const drawer = document.getElementById('contentDrawer');
    const drawerClose = document.getElementById('drawerClose');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.drawer-section');
    const brainLogo = document.getElementById('brainLogo');

    let currentSection = null;

    // Mobile: tap profile image to toggle brain
    const profileWrapper = document.querySelector('.profile-image-wrapper');
    if (profileWrapper) {
        profileWrapper.addEventListener('click', () => {
            // Only on mobile (match CSS breakpoint)
            if (window.innerWidth <= 900) {
                profileWrapper.classList.toggle('show-brain');

                // Initialize brain animation if showing for first time
                const brainSvg = profileWrapper.querySelector('.profile-brain svg');
                if (brainSvg && !brainSvg.dataset.initialized) {
                    const network = neuralNetwork.init(brainSvg);
                    if (network) {
                        network.animate();
                        brainSvg.dataset.initialized = 'true';
                    }
                }
            }
        });
    }

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

        // Hide brain logo
        if (brainLogo) brainLogo.classList.add('hidden');

        // Scroll drawer to top
        drawer.scrollTop = 0;
    }

    /**
     * Close the drawer
     */
    function closeDrawer() {
        drawer.classList.remove('open');

        // Show brain logo
        if (brainLogo) brainLogo.classList.remove('hidden');

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
