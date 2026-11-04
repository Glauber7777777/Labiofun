/**
 * Global Search Functionality
 * Search across all sections of the website
 */

class GlobalSearch {
    constructor() {
        this.searchData = [];
        this.init();
    }

    init() {
        this.createSearchUI();
        this.indexContent();
        this.attachEventListeners();
    }

    createSearchUI() {
        // Create search overlay
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.id = 'search-overlay';
        overlay.innerHTML = `
            <div class="search-modal">
                <div class="search-header">
                    <input type="search" 
                           id="global-search-input" 
                           class="global-search-input" 
                           placeholder="Buscar em todo o site..." 
                           aria-label="Busca global">
                    <button class="search-close" aria-label="Fechar busca">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-results" id="search-results">
                    <p class="search-hint">Digite para buscar...</p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Create search trigger button in header
        const searchBtn = document.createElement('button');
        searchBtn.className = 'global-search-btn';
        searchBtn.innerHTML = '<i class="fas fa-search"></i>';
        searchBtn.setAttribute('aria-label', 'Abrir busca global');
        searchBtn.addEventListener('click', () => this.openSearch());

        const languageSwitcher = document.querySelector('.language-switcher');
        if (languageSwitcher) {
            languageSwitcher.insertAdjacentElement('beforebegin', searchBtn);
        }
    }

    indexContent() {
        // Index all searchable content
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionId = section.id;
            const sectionTitle = section.querySelector('h2')?.textContent || sectionId;

            // Index headings
            section.querySelectorAll('h3, h4').forEach(heading => {
                this.searchData.push({
                    type: 'heading',
                    section: sectionTitle,
                    sectionId: sectionId,
                    title: heading.textContent,
                    content: heading.textContent,
                    link: `#${sectionId}`
                });
            });

            // Index paragraphs
            section.querySelectorAll('p').forEach(para => {
                const text = para.textContent.trim();
                if (text.length > 20) {
                    this.searchData.push({
                        type: 'text',
                        section: sectionTitle,
                        sectionId: sectionId,
                        content: text.substring(0, 150),
                        link: `#${sectionId}`
                    });
                }
            });
        });

        // Index publications if available
        if (typeof publications !== 'undefined') {
            publications.forEach(pub => {
                this.searchData.push({
                    type: 'publication',
                    section: 'Publicações',
                    sectionId: 'publications-page',
                    title: pub.title,
                    content: `${pub.authors} - ${pub.journal} (${pub.year})`,
                    link: '#publications-page'
                });
            });
        }
    }

    attachEventListeners() {
        const input = document.getElementById('global-search-input');
        const overlay = document.getElementById('search-overlay');
        const closeBtn = overlay.querySelector('.search-close');

        // Search input
        input.addEventListener('input', (e) => this.performSearch(e.target.value));

        // Close buttons
        closeBtn.addEventListener('click', () => this.closeSearch());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeSearch();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
            // Escape to close
            if (e.key === 'Escape') {
                this.closeSearch();
            }
        });
    }

    performSearch(query) {
        const resultsContainer = document.getElementById('search-results');

        if (!query || query.length < 2) {
            resultsContainer.innerHTML = '<p class="search-hint">Digite pelo menos 2 caracteres...</p>';
            return;
        }

        const searchTerm = query.toLowerCase();
        const results = this.searchData.filter(item =>
            item.content.toLowerCase().includes(searchTerm) ||
            (item.title && item.title.toLowerCase().includes(searchTerm))
        ).slice(0, 10); // Limit to 10 results

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">Nenhum resultado encontrado.</p>';
            return;
        }

        const html = results.map(result => `
            <a href="${result.link}" class="search-result-item" data-section="${result.sectionId}">
                <div class="result-section">${result.section}</div>
                <div class="result-title">${this.highlightText(result.title || result.content.substring(0, 60), searchTerm)}</div>
                ${result.title ? `<div class="result-content">${this.highlightText(result.content, searchTerm)}</div>` : ''}
            </a>
        `).join('');

        resultsContainer.innerHTML = html;

        // Add click handlers
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => this.closeSearch());
        });
    }

    highlightText(text, term) {
        if (!text) return '';
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    openSearch() {
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('global-search-input');
        overlay.classList.add('active');
        setTimeout(() => input.focus(), 100);
    }

    closeSearch() {
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('global-search-input');
        overlay.classList.remove('active');
        input.value = '';
        document.getElementById('search-results').innerHTML = '<p class="search-hint">Digite para buscar...</p>';
    }
}

// Initialize global search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GlobalSearch();
});
