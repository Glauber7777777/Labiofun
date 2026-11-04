/**
 * Cookie Consent for LGPD Compliance
 */

// Cookie Banner HTML and Logic
document.addEventListener('DOMContentLoaded', () => {
    // Check if user already consented
    if (localStorage.getItem('cookieConsent')) {
        return;
    }

    // Create banner
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-content">
            <p><strong>🍪 Cookies e Privacidade</strong></p>
            <p>Este site usa cookies para melhorar sua experiência e analisar o uso do site. Ao continuar navegando, você concorda com nossa política de cookies.</p>
            <div class="cookie-buttons">
                <button id="accept-cookies" class="cookie-btn accept">Aceitar</button>
                <button id="reject-cookies" class="cookie-btn reject">Recusar</button>
            </div>
        </div>
    `;

    document.body.appendChild(banner);

    // Accept cookies
    document.getElementById('accept-cookies').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.remove();

        // Initialize analytics if available
        if (typeof gtag === 'function') {
            gtag('config', 'G-XXXXXXXXXX');
        }
    });

    // Reject cookies
    document.getElementById('reject-cookies').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected');
        banner.remove();
    });
});
