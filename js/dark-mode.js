/**
 * Dark Mode Toggle Logic
 */

// Initialize dark mode
const initDarkMode = () => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateDarkModeIcon(theme);
};

// Toggle dark mode
const toggleDarkMode = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateDarkModeIcon(newTheme);
};

// Update icon
const updateDarkModeIcon = (theme) => {
    const icon = document.querySelector('.dark-mode-toggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
};

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateDarkModeIcon(newTheme);
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();

    // Add toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'dark-mode-toggle';
    toggleBtn.setAttribute('aria-label', 'Alternar modo escuro');
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    toggleBtn.addEventListener('click', toggleDarkMode);
    document.body.appendChild(toggleBtn);
});
