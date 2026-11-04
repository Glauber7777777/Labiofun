/**
 * Main JavaScript for Labiofun Website
 * Interactive functionality and modern enhancements
 */

// ============================================================================
// Scroll Progress Indicator
// ============================================================================
function updateScrollProgress() {
    const scrollProgress = document.getElementById('scroll-progress');
    if (!scrollProgress) return;

    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;

    scrollProgress.style.width = scrolled + '%';
    scrollProgress.setAttribute('aria-valuenow', Math.round(scrolled));
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('load', updateScrollProgress);

// ============================================================================
// Smooth Scroll Navigation
// ============================================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Don't prevent default for # links (modal triggers, etc.)
        if (href === '#' || !href.startsWith('#')) return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            const header = document.querySelector('header');
            const headerHeight = header ? header.getBoundingClientRect().height : 0;
            const extraPadding = 12; // Small breathing room below header
            const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - extraPadding;

            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
        }
    });
});


// ============================================================================
// Dynamic scroll-padding-top (keeps hash-link targets visible below sticky header)
// ============================================================================
function updateScrollPaddingTop() {
    const header = document.querySelector('header');
    if (!header) return;
    const h = header.getBoundingClientRect().height;
    document.documentElement.style.scrollPaddingTop = (h + 12) + 'px';
}

window.addEventListener('load', updateScrollPaddingTop);
window.addEventListener('resize', updateScrollPaddingTop, { passive: true });

// ============================================================================
// Dark Mode Toggle
// ============================================================================
function initDarkMode() {
    // Inject CSS if missing
    if (!document.querySelector('link[href*="dark-mode.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        const isPage = window.location.pathname.includes('/pages/');
        link.href = (isPage ? '../' : '') + 'css/dark-mode.css';
        document.head.appendChild(link);
    }

    // Apply saved theme — default is always LIGHT unless user explicitly chose dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        // Always start in light mode; remove any stale dark setting
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('theme');
    }

    // Inject Button alongside the language switcher (top-right of header)
    const btn = document.createElement('button');
    btn.className = 'dark-mode-toggle';
    btn.setAttribute('aria-label', 'Alternar Modo Escuro');
    btn.id = 'dark-mode-btn';
    const currentTheme = document.documentElement.getAttribute('data-theme');
    btn.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

    // Prefer to place inside language-switcher (top right header), fallback to body
    const langSwitcher = document.querySelector('.language-switcher');
    if (langSwitcher) {
        langSwitcher.appendChild(btn);
    } else {
        document.body.appendChild(btn);
    }

    // Toggle logic
    btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        if (cur === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            btn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            btn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}

document.addEventListener('DOMContentLoaded', initDarkMode);


// ============================================================================
// Scroll Spy (Menu Highlighting)
// ============================================================================
const spySections = document.querySelectorAll('section[id], header[id]');
const spyNavLinks = document.querySelectorAll('.header-bottom nav ul li a');

function updateScrollSpy() {
    if (spySections.length === 0) {
        // Se for uma subpágina sem seções, destaca apenas o link com aria-current
        spyNavLinks.forEach(link => {
            if (link.getAttribute('aria-current') === 'page') {
                link.classList.add('active');
            }
        });
        return;
    }

    let current = '';
    const scrollY = window.pageYOffset;
    const header = document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 160;

    spySections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    if (scrollY < 100) {
        current = 'about'; // Se estiver no topo
    }

    spyNavLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href && href.includes('#')) {
            const hash = href.split('#')[1];
            if (hash === current) {
                link.classList.add('active');
            }
        } else if (link.getAttribute('aria-current') === 'page') {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateScrollSpy, { passive: true });
window.addEventListener('load', updateScrollSpy);

// ============================================================================
// Scroll Animations with Intersection Observer
// ============================================================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Stop observing once animated
            animateOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all scroll-animate elements
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale, .reveal').forEach(el => {
        animateOnScroll.observe(el);
    });
    
    initLightbox();
    initScientificGallery();
    initTeamTabs();
});

// ============================================================================
// Lightbox Gallery Functionality
// ============================================================================
function initLightbox() {
    // Create modal elements if they don't exist
    if (document.querySelector('.lightbox-overlay')) return;

    const lightboxOverlay = document.createElement('div');
    lightboxOverlay.className = 'lightbox-overlay';
    
    const lightboxImg = document.createElement('img');
    lightboxImg.className = 'lightbox-img';
    
    const lightboxClose = document.createElement('span');
    lightboxClose.className = 'lightbox-close';
    lightboxClose.innerHTML = '&times;';
    
    const lightboxCaption = document.createElement('div');
    lightboxCaption.className = 'lightbox-caption';
    
    lightboxOverlay.appendChild(lightboxImg);
    lightboxOverlay.appendChild(lightboxCaption);
    lightboxOverlay.appendChild(lightboxClose);
    document.body.appendChild(lightboxOverlay);

    // Add CSS for lightbox dynamically
    const style = document.createElement('style');
    style.textContent = `
        .lightbox-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); display: none;
            justify-content: center; align-items: center; flex-direction: column;
            z-index: 10000; opacity: 0; transition: opacity 0.3s ease;
        }
        .lightbox-overlay.active { display: flex; opacity: 1; }
        .lightbox-img {
            max-width: 90%; max-height: 80vh; border-radius: 8px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.5); transform: scale(0.95);
            transition: transform 0.3s ease;
        }
        .lightbox-overlay.active .lightbox-img { transform: scale(1); }
        .lightbox-caption {
            color: #fff; margin-top: 15px; font-size: 1.1rem; text-align: center; max-width: 80%;
            font-family: var(--font-body);
        }
        .lightbox-close {
            position: absolute; top: 20px; right: 30px; font-size: 40px;
            color: white; cursor: pointer; transition: color 0.3s;
        }
        .lightbox-close:hover { color: var(--primary); }
        
        /* Cursor pointers for zoomable images */
        .team-photo, .alumni-photo, .news-content img, .research-content img, 
        .techniques-content img, img.lightbox-trigger, .card-icon img {
            cursor: zoom-in;
            transition: transform 0.3s ease;
        }
        .team-photo:hover, .alumni-photo:hover, img.lightbox-trigger:hover {
            transform: scale(1.02);
        }
    `;
    document.head.appendChild(style);

    // Event delegation for lightbox
    document.body.addEventListener('click', (e) => {
        const triggerSelector = '.team-photo, .alumni-photo, .news-content img, .research-content img, .techniques-content img, img.lightbox-trigger, .card-icon img';
        const img = e.target.closest(triggerSelector);
        
        if (img && img.tagName === 'IMG') {
            lightboxImg.src = img.src;
            lightboxCaption.textContent = img.alt || '';
            lightboxOverlay.classList.add('active');
            lightboxOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });

    const closeLightbox = () => {
        lightboxOverlay.classList.remove('active');
        setTimeout(() => {
            if(!lightboxOverlay.classList.contains('active')) lightboxOverlay.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) closeLightbox();
    });
}

// ============================================================================
// Team Tabs Functionality
// ============================================================================
function initTeamTabs() {
    // Only select tab buttons within the team section
    const teamSection = document.getElementById('team');
    if (!teamSection) return;

    const tabButtons = teamSection.querySelectorAll('.tab-btn');
    const tabContents = teamSection.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all team buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ============================================================================
// Collaborators Functionality
// ============================================================================
function getLastName(fullName) {
    const names = fullName.split(' ');
    return names[names.length - 1].toLowerCase();
}

let currentCollaboratorList = [];
let currentCollaboratorIndex = 0;
let collaboratorCarouselInterval = null;

function renderCollaborators(collabList, containerId = 'teamContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    currentCollaboratorList = collabList;
    currentCollaboratorIndex = 0;

    container.innerHTML = '';

    if (collabList.length === 0) {
        container.innerHTML = '<p class="no-results" data-i18n="team.no.results">Nenhum colaborador encontrado</p>';
        return;
    }

    container.innerHTML = `
        <div class="team-carousel-container">
            <!-- Desktop Layout -->
            <div class="team-carousel-desktop">
                <div class="tc-avatar-wrapper" style="background:var(--light-gray); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    <img id="tc-collab-img-desktop" src="" alt="" style="display:none; width:100%; height:100%; object-fit:cover; transition: opacity 0.4s ease-in-out;">
                    <i id="tc-collab-icon-desktop" class="fas fa-user-tie" style="font-size: 15rem; color: var(--gray); transition: opacity 0.4s ease-in-out;"></i>
                </div>
                <div class="tc-card" id="tc-collab-card-desktop">
                    <h2 id="tc-collab-name-desktop"></h2>
                    <div class="tc-title" id="tc-collab-title-desktop"></div>
                    <p class="tc-desc" id="tc-collab-desc-desktop"></p>
                    <div class="tc-social-links" id="tc-collab-links-desktop"></div>
                </div>
            </div>

            <!-- Mobile Layout -->
            <div class="team-carousel-mobile">
                <div class="tcm-avatar-wrapper" style="background:var(--light-gray); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    <img id="tc-collab-img-mobile" src="" alt="" style="display:none; width:100%; height:100%; object-fit:cover; transition: opacity 0.4s ease-in-out;">
                    <i id="tc-collab-icon-mobile" class="fas fa-user-tie" style="font-size: 10rem; color: var(--gray); transition: opacity 0.4s ease-in-out;"></i>
                </div>
                <div class="tcm-content" id="tc-collab-card-mobile">
                    <h2 id="tc-collab-name-mobile"></h2>
                    <div class="tc-title" id="tc-collab-title-mobile"></div>
                    <p class="tc-desc" id="tc-collab-desc-mobile"></p>
                    <div class="tc-social-links" id="tc-collab-links-mobile"></div>
                </div>
            </div>

            <!-- Controles Inferiores -->
            <div class="tc-controls">
                <button class="tc-btn" onclick="prevCollaborator()" aria-label="Anterior"><i class="fas fa-chevron-left"></i></button>
                <div class="tc-dots" id="tc-collab-dots-container" style="flex-wrap: wrap; justify-content: center;"></div>
                <button class="tc-btn" onclick="nextCollaborator()" aria-label="Próximo"><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    `;

    const dotsContainer = document.getElementById('tc-collab-dots-container');
    if (dotsContainer) {
        let dotsHtml = '';
        currentCollaboratorList.forEach((_, idx) => {
            dotsHtml += `<button class="tc-dot" data-index="${idx}" onclick="goToCollaborator(${idx})" aria-label="Ir para colaborador ${idx + 1}"></button>`;
        });
        dotsContainer.innerHTML = dotsHtml;
    }

    updateCollaboratorCarousel(0, false);
    startCollaboratorAutoPlay();
}

function updateCollaboratorCarousel(index, animate = true) {
    if (currentCollaboratorList.length === 0) return;
    
    currentCollaboratorIndex = index;
    const member = currentCollaboratorList[index];
    
    const cards = [document.getElementById('tc-collab-card-desktop'), document.getElementById('tc-collab-card-mobile')];
    const icons = [document.getElementById('tc-collab-icon-desktop'), document.getElementById('tc-collab-icon-mobile')];
    const imgs = [document.getElementById('tc-collab-img-desktop'), document.getElementById('tc-collab-img-mobile')];
    
    if (animate) {
        cards.forEach(c => c && (c.style.opacity = '0'));
        icons.forEach(i => i && (i.style.opacity = '0'));
        imgs.forEach(m => m && (m.style.opacity = '0'));
    }

    const timeout = animate ? 300 : 0;

    setTimeout(() => {
        const nameD = document.getElementById('tc-collab-name-desktop');
        const titleD = document.getElementById('tc-collab-title-desktop');
        const descD = document.getElementById('tc-collab-desc-desktop');
        const linksD = document.getElementById('tc-collab-links-desktop');
        const iconD = document.getElementById('tc-collab-icon-desktop');
        const imgD = document.getElementById('tc-collab-img-desktop');

        const nameM = document.getElementById('tc-collab-name-mobile');
        const titleM = document.getElementById('tc-collab-title-mobile');
        const descM = document.getElementById('tc-collab-desc-mobile');
        const linksM = document.getElementById('tc-collab-links-mobile');
        const iconM = document.getElementById('tc-collab-icon-mobile');
        const imgM = document.getElementById('tc-collab-img-mobile');

        const titleHtml = member.institution;
        const bioHtml = member.description;

        let linksHtml = '';
        if (member.links && member.links.length > 0) {
            member.links.forEach(link => {
                linksHtml += `<a href="${link.url}" title="${link.title}" target="_blank" rel="noopener noreferrer"><i class="${link.icon}"></i></a>`;
            });
        }

        if (nameD) nameD.textContent = member.name;
        if (titleD) titleD.innerHTML = titleHtml;
        if (descD) descD.innerHTML = bioHtml;
        if (linksD) linksD.innerHTML = linksHtml;

        if (nameM) nameM.textContent = member.name;
        if (titleM) titleM.innerHTML = titleHtml;
        if (descM) descM.innerHTML = bioHtml;
        if (linksM) linksM.innerHTML = linksHtml;

        if (member.image) {
            if (imgD) { imgD.src = member.image; imgD.alt = member.name; imgD.style.display = 'block'; }
            if (iconD) iconD.style.display = 'none';
            if (imgM) { imgM.src = member.image; imgM.alt = member.name; imgM.style.display = 'block'; }
            if (iconM) iconM.style.display = 'none';
        } else {
            if (imgD) imgD.style.display = 'none';
            if (iconD) iconD.style.display = 'block';
            if (imgM) imgM.style.display = 'none';
            if (iconM) iconM.style.display = 'block';
        }

        document.querySelectorAll('#tc-collab-dots-container .tc-dot').forEach((dot, idx) => {
            if (idx === index) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        if (animate) {
            cards.forEach(c => c && (c.style.opacity = '1'));
            if (member.image) {
                imgs.forEach(m => m && (m.style.opacity = '1'));
            } else {
                icons.forEach(i => i && (i.style.opacity = '1'));
            }
        }
    }, timeout);
}

window.nextCollaborator = function() {
    if (currentCollaboratorList.length === 0) return;
    let nextIndex = (currentCollaboratorIndex + 1) % currentCollaboratorList.length;
    updateCollaboratorCarousel(nextIndex);
    resetCollaboratorAutoPlay();
}

window.prevCollaborator = function() {
    if (currentCollaboratorList.length === 0) return;
    let prevIndex = (currentCollaboratorIndex - 1 + currentCollaboratorList.length) % currentCollaboratorList.length;
    updateCollaboratorCarousel(prevIndex);
    resetCollaboratorAutoPlay();
}

window.goToCollaborator = function(index) {
    if (index !== currentCollaboratorIndex) {
        updateCollaboratorCarousel(index);
        resetCollaboratorAutoPlay();
    }
}

function startCollaboratorAutoPlay() {
    if (collaboratorCarouselInterval) clearInterval(collaboratorCarouselInterval);
    collaboratorCarouselInterval = setInterval(() => {
        if (currentCollaboratorList.length === 0) return;
        let nextIndex = (currentCollaboratorIndex + 1) % currentCollaboratorList.length;
        updateCollaboratorCarousel(nextIndex);
    }, 3000); // 3 segundos conforme pedido
}

function resetCollaboratorAutoPlay() {
    startCollaboratorAutoPlay();
}

function sortCollaborators(collaborators, containerId = 'teamContainer') {
    const sorted = [...collaborators].sort((a, b) => {
        const lastNameA = getLastName(a.name);
        const lastNameB = getLastName(b.name);
        return lastNameA.localeCompare(lastNameB);
    });

    renderCollaborators(sorted, containerId);
}

function searchCollaborators(collaborators, searchTerm, containerId = 'teamContainer') {
    if (!searchTerm) {
        renderCollaborators(collaborators, containerId);
        return;
    }

    const filtered = collaborators.filter(collab =>
        collab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collab.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collab.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    renderCollaborators(filtered, containerId);
}

// ============================================================================
// Publications Functionality
// ============================================================================
function formatCitationABNT(publication) {
    let authors = publication.authors.split(', ');
    let formattedAuthors = authors.length > 3 ? `${authors[0]} et al.` : authors.join('; ');

    const journalParts = publication.journal.split(', ');
    const journalName = journalParts[0];
    const year = journalParts[1] || publication.year;
    const volume = journalParts[2] || '';
    const number = journalParts[3] || '';
    const pages = journalParts[4] || '';

    return `${formattedAuthors}. ${publication.title}. ${journalName}, ${year}, v. ${volume}, n. ${number}, p. ${pages}. DOI: ${publication.doi}.`;
}

function formatCitationAPA(publication) {
    let authors = publication.authors.split(', ');
    let formattedAuthors = '';

    if (authors.length === 1) {
        formattedAuthors = authors[0];
    } else if (authors.length === 2) {
        formattedAuthors = `${authors[0]} & ${authors[1]}`;
    } else if (authors.length > 7) {
        formattedAuthors = authors.slice(0, 6).join(', ') + '... ' + authors[authors.length - 1];
    } else {
        const lastAuthor = authors.pop();
        formattedAuthors = authors.join(', ') + ' & ' + lastAuthor;
    }

    const journalParts = publication.journal.split(', ');
    const journalName = journalParts[0];
    const year = journalParts[1] || publication.year;
    const volume = journalParts[2] || '';
    const number = journalParts[3] || '';
    const pages = journalParts[4] || '';

    return `${formattedAuthors} (${year}). ${publication.title}. ${journalName}, ${volume}(${number}), ${pages}. https://doi.org/${publication.doi}`;
}

function formatCitationBibTeX(publication) {
    const firstAuthor = publication.authors.split(', ')[0].toLowerCase().replace(/\s+/g, '');
    const key = `${firstAuthor}${publication.year}`;

    const journalParts = publication.journal.split(', ');
    const journalName = journalParts[0];
    const volume = journalParts[2] || '';
    const number = journalParts[3] || '';
    const pages = journalParts[4] || '';
    const authors = publication.authors.split(', ').join(' and ');

    return `@article{${key},
  author = {${authors}},
  title = {${publication.title}},
  journal = {${journalName}},
  year = {${publication.year}},
  volume = {${volume}},
  number = {${number}},
  pages = {${pages}},
  doi = {${publication.doi}}
}`;
}

let currentCitationFormat = 'abnt';

function showCitationModal(publication) {
    const modal = document.getElementById('citation-modal');
    if (!modal) return;

    const citationTextABNT = document.getElementById('citation-text-abnt');
    const citationTextAPA = document.getElementById('citation-text-apa');
    const citationTextBibTeX = document.getElementById('citation-text-bibtex');

    if (citationTextABNT) citationTextABNT.textContent = formatCitationABNT(publication);
    if (citationTextAPA) citationTextAPA.textContent = formatCitationAPA(publication);
    if (citationTextBibTeX) citationTextBibTeX.textContent = formatCitationBibTeX(publication);

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    currentCitationFormat = 'abnt';
}

function closeCitationModal() {
    const modal = document.getElementById('citation-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

function copyCitation() {
    const activeCitation = document.querySelector('.citation-text.active');
    if (!activeCitation) return;

    const text = activeCitation.textContent;
    const copyCitationBtn = document.getElementById('citation-copy');

    const showSuccess = () => {
        if (copyCitationBtn) {
            const originalText = copyCitationBtn.textContent;
            copyCitationBtn.textContent = 'Copiado! ✓';
            setTimeout(() => { copyCitationBtn.textContent = originalText; }, 2000);
        }
    };

    // Modern Clipboard API (preferred)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(showSuccess)
            .catch(() => {
                // Fallback for older browsers or non-HTTPS
                const tempTextarea = document.createElement('textarea');
                tempTextarea.value = text;
                tempTextarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
                document.body.appendChild(tempTextarea);
                tempTextarea.select();
                try { document.execCommand('copy'); showSuccess(); } catch (err) { console.error('Copy failed:', err); }
                document.body.removeChild(tempTextarea);
            });
    } else {
        // Direct fallback for environments without Clipboard API
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = text;
        tempTextarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        try { document.execCommand('copy'); showSuccess(); } catch (err) { console.error('Copy failed:', err); }
        document.body.removeChild(tempTextarea);
    }
}

function initCitationModal() {
    // Citation tab functionality
    document.querySelectorAll('.citation-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.citation-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.citation-text').forEach(t => t.classList.remove('active'));

            this.classList.add('active');
            const format = this.getAttribute('data-format');
            const textElement = document.getElementById(`citation-text-${format}`);
            if (textElement) {
                textElement.classList.add('active');
            }
            currentCitationFormat = format;
        });
    });

    // Close button
    const closeBtn = document.querySelector('.citation-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCitationModal);
    }

    // Copy button
    const copyBtn = document.getElementById('citation-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyCitation);
    }

    // Close button in actions
    const closeActionBtn = document.getElementById('citation-close');
    if (closeActionBtn) {
        closeActionBtn.addEventListener('click', closeCitationModal);
    }

    // Close on outside click
    const modal = document.getElementById('citation-modal');
    if (modal) {
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeCitationModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeCitationModal();
        }
    });
}

// ============================================================================
// Publications Rendering
// ============================================================================
function renderPublications(pubs) {
    try {
        const container = document.querySelector('.publications-container');
        if (!container) {
            console.error('renderPublications: Container não encontrado');
            return;
        }

        container.innerHTML = '';

        if (!pubs || pubs.length === 0) {
            container.innerHTML = '<p class="no-results" data-i18n="publications.no.results">Nenhuma publicação encontrada.</p>';
            return;
        }

        // Group by year
        const pubsByYear = pubs.reduce((acc, pub) => {
            if (!acc[pub.year]) acc[pub.year] = [];
            acc[pub.year].push(pub);
            return acc;
        }, {});

        // Sort years descending
        const years = Object.keys(pubsByYear).sort((a, b) => b - a);

        years.forEach(year => {
            const yearHeader = document.createElement('div');
            yearHeader.className = 'year-header';
            yearHeader.textContent = `Publicações de ${year}`;
            yearHeader.setAttribute('data-year', year);
            container.appendChild(yearHeader);

            pubsByYear[year].forEach(pub => {
                const pubEl = document.createElement('div');
                pubEl.className = 'publication-item scroll-animate';

                // Clean up authors (remove duplicates)
                const authors = pub.authors
                    .replace('Frases, Susana; FRASES, S.', 'Frases, Susana')
                    .replace('FRASES, S.', 'Frases, Susana');

                pubEl.innerHTML = `
            <h3>${pub.title}</h3>
            <p class="authors">${authors}</p>
            <p class="journal">${pub.journal}</p>
            <div class="pub-actions" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                ${pub.doi ? `<div data-badge-popover="right" data-badge-type="donut" data-doi="${pub.doi.replace('https://doi.org/', '')}" class="altmetric-embed"></div>` : ''}
                ${pub.doi ? `<a href="https://doi.org/${pub.doi.replace('https://doi.org/', '')}" target="_blank" class="pub-btn" aria-label="Ver DOI da publicação">DOI</a>` : ''}
                <button class="pub-btn cite-btn" data-title="${pub.title.replace(/"/g, '&quot;')}" data-authors="${authors.replace(/"/g, '&quot;')}" data-journal="${pub.journal.replace(/"/g, '&quot;')}" data-year="${pub.year}" data-doi="${pub.doi || ''}" aria-label="Citar esta publicação">Citar</button>
            </div>
        `;

                container.appendChild(pubEl);

                // Observe for scroll animation
                if (animateOnScroll) {
                    animateOnScroll.observe(pubEl);
                }
            });
        });

        // Add citation button listeners
        document.querySelectorAll('.cite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const data = {
                    title: btn.getAttribute('data-title'),
                    authors: btn.getAttribute('data-authors'),
                    journal: btn.getAttribute('data-journal'),
                    year: btn.getAttribute('data-year'),
                    doi: btn.getAttribute('data-doi')
                };
                showCitationModal(data);
            });
        });

        // Nome acessível nos selos Altmetric (o script deles gera <a> vazios)
        labelAltmetricBadges();

        // Re-initialize Altmetric badges
        if (window._altmetric_embed_init) {
            window._altmetric_embed_init();
        } else if (typeof _altmetric_embed_init === 'function') {
            _altmetric_embed_init();
        }
    } catch (error) {
        console.error('Error em renderPublications:', error);
    }
}

let altmetricObserver = null;
function labelAltmetricBadges() {
    const apply = (root) => root.querySelectorAll('.altmetric-embed a:not([aria-label])').forEach(link => {
        const doi = link.closest('.altmetric-embed')?.dataset.doi || '';
        link.setAttribute('aria-label', `Altmetric: atenção online ao artigo ${doi}`.trim());
    });
    apply(document);
    if (altmetricObserver || !('MutationObserver' in window)) return;
    altmetricObserver = new MutationObserver(() => apply(document));
    document.querySelectorAll('.altmetric-embed').forEach(el => {
        const section = el.closest('section') || document.body;
        altmetricObserver.observe(section, { childList: true, subtree: true });
    });
}

function filterPublications(publications, year) {
    // Update active button
    document.querySelectorAll('.year-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnText = btn.textContent.trim();
        if (btnText === (year === 'all' ? 'Todas' : year.toString()) ||
            btnText === (year === 'all' ? 'All years' : year.toString())) {
            btn.classList.add('active');
        }
    });

    const filtered = year === 'all'
        ? publications
        : publications.filter(pub => pub.year === parseInt(year));

    renderPublications(filtered);
}

function initPublications(publications) {
    try {
        // Validate input
        if (!publications) {
            console.error('initPubl: Publications data é undefined');
            return;
        }

        if (!Array.isArray(publications)) {
            console.error('initPublications: Publications deve ser um array');
            return;
        }

        if (publications.length === 0) {
            console.warn('initPublications: Nenhuma publicação encontrada');
            return;
        }

        // Generate year filter buttons
        const uniqueYears = [...new Set(publications.map(pub => pub.year))].sort((a, b) => b - a);
        const yearFilterContainer = document.getElementById('year-filter-container');

        if (yearFilterContainer) {
            yearFilterContainer.innerHTML = '';

            // Add "All" button
            const allButton = document.createElement('button');
            allButton.className = 'year-btn active';
            allButton.textContent = 'Todas';
            allButton.setAttribute('data-i18n', 'publications.filter.all');
            allButton.addEventListener('click', () => filterPublications(publications, 'all'));
            yearFilterContainer.appendChild(allButton);

            // Add year buttons
            uniqueYears.forEach(year => {
                const yearButton = document.createElement('button');
                yearButton.className = 'year-btn';
                yearButton.textContent = year;
                yearButton.addEventListener('click', () => filterPublications(publications, year));
                yearFilterContainer.appendChild(yearButton);
            });
        }

        // Initial render
        renderPublications(publications);

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                try {
                    const term = this.value.toLowerCase();
                    const filtered = publications.filter(pub =>
                        pub.title.toLowerCase().includes(term) ||
                        pub.authors.toLowerCase().includes(term) ||
                        pub.journal.toLowerCase().includes(term) ||
                        (pub.doi && pub.doi.toLowerCase().includes(term))
                    );
                    renderPublications(filtered);
                } catch (error) {
                    console.error('Error filtrando publicações:', error);
                }
            });
        }
    } catch (error) {
        console.error('Error em initPublications:', error);
    }
}

// ============================================================================
// Scroll to Top Button
// ============================================================================
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-chevron-up"></i>';
    button.className = 'scroll-to-top';
    button.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--gradient-primary);
    color: white;
    border: none;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-base);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-fixed);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
  `;

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Show/hide on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });

    document.body.appendChild(button);
}

// ============================================================================
// Lazy Loading Images
// ============================================================================
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================================================
// Books and Chapters Functionality
// ============================================================================
function renderBooks(books) {
    const container = document.querySelector('.books-container');
    if (!container) return;

    container.innerHTML = '';

    if (books.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum livro ou capítulo encontrado.</p>';
        return;
    }

    // Group by year
    const booksByYear = books.reduce((acc, book) => {
        if (!acc[book.year]) acc[book.year] = [];
        acc[book.year].push(book);
        return acc;
    }, {});

    // Sort years descending
    const years = Object.keys(booksByYear).sort((a, b) => b - a);

    years.forEach(year => {
        const yearHeader = document.createElement('div');
        yearHeader.className = 'year-header';
        yearHeader.textContent = `Livros e Capítulos de ${year}`;
        container.appendChild(yearHeader);

        booksByYear[year].forEach(book => {
            const bookEl = document.createElement('div');
            bookEl.className = 'publication-item scroll-animate';

            bookEl.innerHTML = `
        <h3>${book.title}</h3>
        <p class="authors">${book.authors}</p>
        ${book.journal ? `<p class="journal">${book.journal}</p>` : ''}
        ${book.isbn ? `<p class="doi">ISBN: ${book.isbn}</p>` : ''}
        ${book.doi ? `<p class="doi">DOI: ${book.doi}</p>` : ''}
        <div class="links">
          ${book.doi ? `<a href="https://doi.org/${book.doi}" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> Ver publicação</a>` : ''}
          <a href="#" class="cite-btn" data-pub='${JSON.stringify(book).replace(/'/g, "&apos;")}'>
            <i class="fas fa-quote-right"></i> Citar
          </a>
        </div>
      `;

            container.appendChild(bookEl);

            if (animateOnScroll) {
                animateOnScroll.observe(bookEl);
            }
        });
    });

    // Add cite button listeners
    document.querySelectorAll('.books-container .cite-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            try {
                const bookData = JSON.parse(this.getAttribute('data-pub').replace(/&apos;/g, "'"));
                showCitationModal(bookData);
            } catch (err) {
                console.error('Failed to parse book data:', err);
            }
        });
    });
}

function filterBooks(books, year) {
    const filtered = year === 'all'
        ? books
        : books.filter(book => book.year === parseInt(year));

    renderBooks(filtered);
}

function initBooks(books) {
    if (!books || books.length === 0) return;

    // Generate year filter buttons
    const uniqueYears = [...new Set(books.map(book => book.year))].sort((a, b) => b - a);
    const yearFilterContainer = document.getElementById('books-year-filter-container');

    if (yearFilterContainer) {
        yearFilterContainer.innerHTML = '';

        // Add "All" button
        const allButton = document.createElement('button');
        allButton.className = 'year-btn active';
        allButton.textContent = 'Todas';
        allButton.addEventListener('click', () => filterBooks(books, 'all'));
        yearFilterContainer.appendChild(allButton);

        // Add year buttons
        uniqueYears.forEach(year => {
            const yearButton = document.createElement('button');
            yearButton.className = 'year-btn';
            yearButton.textContent = year;
            yearButton.addEventListener('click', () => filterBooks(books, year));
            yearFilterContainer.appendChild(yearButton);
        });
    }

    // Initial render
    renderBooks(books);

    // Search functionality
    const searchInput = document.getElementById('books-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const term = this.value.toLowerCase();
            const filtered = books.filter(book =>
                book.title.toLowerCase().includes(term) ||
                book.authors.toLowerCase().includes(term) ||
                (book.journal && book.journal.toLowerCase().includes(term)) ||
                (book.isbn && book.isbn.toLowerCase().includes(term)) ||
                (book.doi && book.doi.toLowerCase().includes(term))
            );
            renderBooks(filtered);
        });
    }
}

function initPublicationTabs() {
    // Only select publication tab buttons within the publications section
    const publicationsSection = document.getElementById('publications-page');
    if (!publicationsSection) return;

    const tabButtons = publicationsSection.querySelectorAll('[data-pub-type]');
    const tabContents = publicationsSection.querySelectorAll('.pub-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetType = button.getAttribute('data-pub-type');

            // Remove active class from all publication buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding content
            const targetContent = document.getElementById(`${targetType}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ============================================================================
// Impact Counter Animation
// ============================================================================
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600; // ms
    const startTime = performance.now();
    const startValue = 0;

    // For years (4-digit numbers), start from target - 20 for faster feel
    const isYear = target >= 1900 && target <= 2100;
    const effectiveStart = isYear ? target - 30 : startValue;

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutExpo(progress);
        const current = Math.round(effectiveStart + (target - effectiveStart) * eased);

        el.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            el.textContent = target + suffix;
        }
    }

    requestAnimationFrame(tick);
}

function initImpactCounters() {
    const counters = document.querySelectorAll('.counter-number');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Delay each counter slightly for staggered effect
                const item = entry.target.closest('.counter-item');
                const index = Array.from(item.parentElement.children).indexOf(item);
                setTimeout(() => animateCounter(entry.target), index * 120);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(counter => counterObserver.observe(counter));
}

// ============================================================================
// Initialize Everything
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
    // Initialize team tabs
    initTeamTabs();

    // Initialize publication tabs
    initPublicationTabs();

    // Initialize citation modal
    initCitationModal();

    // Create scroll to top button
    createScrollToTopButton();

    // Initialize lazy loading
    initLazyLoading();

    // Initialize impact counters
    initImpactCounters();

    // Initialize mobile menu navigation drawer
    initMobileMenu();

    // Export functions to global scope for inline use
    window.sortCollaborators = sortCollaborators;
    window.searchCollaborators = searchCollaborators;
    window.initPublications = initPublications;
    window.renderPublications = renderPublications;
    window.filterPublications = filterPublications;
    window.initBooks = initBooks;
    window.renderBooks = renderBooks;
    window.filterBooks = filterBooks;
    window.showCitationModal = showCitationModal;
    window.animateCounter = animateCounter; // Used by scholar-api.js
});

// ============================================================================
// Mobile Navigation Drawer and Header
// ============================================================================
function initMobileMenu() {
    const header = document.querySelector('header');
    const headerTop = document.querySelector('.header-top');
    const nav = document.querySelector('nav');
    if (!header || !nav) return;

    // 1. Create hamburger button dynamically
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-menu-toggle';
    toggleBtn.setAttribute('aria-label', 'Menu de navegação');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-haspopup', 'true');
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Position it in headerTop
    if (headerTop) {
        headerTop.appendChild(toggleBtn);
    }

    // 2. Clone language switcher into mobile navigation drawer
    const originalLangSwitcher = document.querySelector('.header-top .language-switcher');
    if (originalLangSwitcher && !nav.querySelector('.mobile-lang-container')) {
        const langContainer = document.createElement('div');
        langContainer.className = 'mobile-lang-container';
        
        const langLabel = document.createElement('div');
        langLabel.className = 'mobile-lang-label';
        langLabel.setAttribute('data-i18n', 'mobile.language.label');
        langLabel.textContent = 'Idioma / Language';
        langContainer.appendChild(langLabel);
        
        const mobileLangSwitcher = originalLangSwitcher.cloneNode(true);
        mobileLangSwitcher.className = 'mobile-lang-switcher';
        langContainer.appendChild(mobileLangSwitcher);
        
        nav.appendChild(langContainer);

        // Bind events to cloned language buttons (since cloneNode doesn't copy listeners)
        const mobileButtons = mobileLangSwitcher.querySelectorAll('.lang-btn');
        mobileButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.getAttribute('data-lang');
                // Access global LanguageSwitcher if available
                const originalBtn = originalLangSwitcher.querySelector(`.lang-btn[data-lang="${lang}"]`);
                if (originalBtn) {
                    originalBtn.click();
                }
            });
        });
    }

    // 3. Handle menu toggle click event
    const toggleMenu = () => {
        const isActive = nav.classList.toggle('mobile-active');
        toggleBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        toggleBtn.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        document.body.style.overflow = isActive ? 'hidden' : '';
    };

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // 4. Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('mobile-active') && !nav.contains(e.target) && !toggleBtn.contains(e.target)) {
            toggleMenu();
        }
    });

    // 5. Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('mobile-active')) {
            toggleMenu();
            toggleBtn.focus();
        }
    });

    // 6. Close menu when clicking navigation links (especially local anchors)
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('mobile-active')) {
                toggleMenu();
            }
        });
    });
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initTeamTabs,
        initCitationModal,
        initPublications,
        renderPublications,
        filterPublications,
        initBooks,
        renderBooks,
        filterBooks,
        initPublicationTabs,
        sortCollaborators,
        searchCollaborators,
        showCitationModal,
        closeCitationModal
    };
}

// ============================================================================
// Scientific Gallery Filtering
// ============================================================================
function initScientificGallery() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterButtons.length === 0 || galleryItems.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter items
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || filter === category) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}



