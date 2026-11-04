function renderCurrentTeam() {
    const container = document.querySelector('#current-team .team-container');
    if (!container) return; // Safely exit if not on the team page

    container.innerHTML = '';

    currentTeam.forEach(member => {
        let titleHtml = '';
        if (member.titleKey || member.titleDefault) {
            titleHtml = `<p ${member.titleKey ? `data-i18n="${member.titleKey}"` : ''}>${member.titleDefault || ''}</p>`;
        }

        let bioHtml = '';
        if (member.bioKey) {
            bioHtml = `<p data-i18n="${member.bioKey}">${member.bioDefault}</p>`;
        } else {
            bioHtml = `<p>${member.bioDefault}</p>`;
        }

        let linksHtml = '';
        if (member.links && member.links.length > 0) {
            member.links.forEach(link => {
                linksHtml += `<a href="${link.url}" title="${link.title}" target="_blank"><i class="${link.icon}"></i></a>`;
            });
        }

        const memberHtml = `
            <div class="team-member tm-card">
                <div class="tm-shadow-bg"></div>
                <div class="tm-inner">
                    <div class="tm-image-wrapper">
                        <img src="${member.image}" alt="${member.name}" loading="lazy">
                    </div>
                    <div class="tm-content">
                        <div>
                            <div class="tm-name">${member.name}</div>
                            <div class="tm-role" ${member.roleKey ? `data-i18n="${member.roleKey}"` : ''}>${member.roleDefault}</div>
                            ${titleHtml}
                            <div class="tm-bio" ${member.bioKey ? `data-i18n="${member.bioKey}"` : ''}>${member.bioDefault}</div>
                        </div>
                        <div class="tm-social">
                            ${linksHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', memberHtml);
    });
}

// Função para renderizar os Alumni
function renderAlumni() {
    const grid = document.querySelector('#alumni .alumni-grid');
    if (!grid) return;

    grid.innerHTML = '';

    alumniData.forEach(alumnus => {
        const fallbackStr = `onerror="this.outerHTML='<div class=\\'initials\\'>' + this.getAttribute('data-initials') + '</div>';"`;
        
        const cardHtml = `
            <div class="alumni-card">
                <img src="${alumnus.image}" alt="${alumnus.name}" class="alumni-photo" loading="lazy" data-initials="${alumnus.initials}" ${fallbackStr}>
                <h3>${alumnus.name}</h3>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Renderizar tudo quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    renderCurrentTeam();
    renderAlumni();
    
    // Se a função updateTranslations existir (do language-switcher), 
    // chamamos para garantir que o que foi injetado via JS seja traduzido.
    if (typeof updateTranslations === 'function') {
        setTimeout(updateTranslations, 50); // delay pequeno para garantir a inserção no DOM
    }
});
