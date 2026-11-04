/**
 * Language Switcher for Labiofun Website
 * Handles trilingual functionality (Portuguese/English/Spanish)
 */

class LanguageSwitcher {
    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        this.currentLang = urlLang || this.getStoredLanguage() || this.detectBrowserLanguage() || 'pt-BR';
        this.init();
    }

    /**
     * Initialize the language switcher
     */
    init() {
        this.applyLanguage(this.currentLang);
        this.attachEventListeners();
        this.updateButtonStates();
    }

    /**
     * Attach event listeners to language buttons
     */
    attachEventListeners() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const lang = e.currentTarget.getAttribute('data-lang');
                this.switchLanguage(lang);
            });
        });
    }

    /**
     * Switch to a specific language
     * @param {string} lang - Language code ('pt-BR', 'en', or 'es-ES')
     */
    switchLanguage(lang) {
        this.currentLang = lang;
        this.saveLanguage(lang);
        this.applyLanguage(lang);
        this.updateButtonStates();
        
        // Atualiza a URL com o parâmetro de idioma para SEO e compartilhamento
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
    }

    /**
     * Update button active states
     */
    updateButtonStates() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(button => {
            const lang = button.getAttribute('data-lang');
            if (lang === this.currentLang) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * Apply language to all elements with data-i18n attribute
     * @param {string} lang - Language code
     */
    applyLanguage(lang) {
        if (typeof translations === 'undefined') {
            console.error('Translations object not found');
            return;
        }

        const langData = translations[lang];
        if (!langData) {
            console.error(`Language data for "${lang}" not found`);
            return;
        }

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = langData[key];

            if (translation) {
                // Collect direct <i> icon children to preserve them
                const directIcons = [...element.children].filter(c => c.tagName === 'I');
                if (directIcons.length > 0) {
                    // Rebuild innerHTML: icons first, then translated text
                    const iconsHTML = directIcons.map(i => i.outerHTML).join('');
                    element.innerHTML = iconsHTML + ' ' + translation;
                } else {
                    element.textContent = translation;
                }
            } else {
                console.warn(`Translation key "${key}" not found for language "${lang}"`);
            }
        });

        // Update all elements with data-i18n-html attribute
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = langData[key];

            if (translation) {
                element.innerHTML = translation;
            } else {
                console.warn(`Translation key "${key}" not found for language "${lang}"`);
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = langData[key];

            if (translation) {
                element.setAttribute('placeholder', translation);
            }
        });

        // Update titles
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = langData[key];

            if (translation) {
                element.setAttribute('title', translation);
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Trigger custom event for other scripts to hook into
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
    }

    /**
     * Save language preference to localStorage
     * @param {string} lang - Language code
     */
    saveLanguage(lang) {
        try {
            localStorage.setItem('labiofun-language', lang);
        } catch (e) {
            console.warn('Could not save language preference to localStorage', e);
        }
    }

    /**
     * Get stored language from localStorage
     * @returns {string|null} - Stored language code or null
     */
    getStoredLanguage() {
        try {
            return localStorage.getItem('labiofun-language');
        } catch (e) {
            console.warn('Could not retrieve language preference from localStorage', e);
            return null;
        }
    }

    /**
     * Detect browser language
     * @returns {string} - Detected language code
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;

        // Check if browser language is Portuguese
        if (browserLang.startsWith('pt')) {
            return 'pt-BR';
        }

        // Check if browser language is Spanish
        if (browserLang.startsWith('es')) {
            return 'es-ES';
        }

        // Check if browser language is English
        if (browserLang.startsWith('en')) {
            return 'en';
        }

        // Default to Portuguese
        return 'pt-BR';
    }

    /**
     * Get current language
     * @returns {string} - Current language code
     */
    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Initialize language switcher when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.languageSwitcher = new LanguageSwitcher();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSwitcher;
}
