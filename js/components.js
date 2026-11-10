/**
 * Componentes Web para o Site Labiofun
 * Centraliza o Cabeçalho (Header) e Rodapé (Footer) para evitar duplicação de HTML.
 */

class LabiofunHeader extends HTMLElement {
  connectedCallback() {
    // Detecta se estamos numa subpasta (ex: /pages/) ou na raiz para corrigir os links
    const isPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isPagesDir ? '../' : '';

    const L = (href, key, label, icon) =>
      `<li role="none"><a href="${basePath}${href}" data-i18n="${key}" role="menuitem"><i class="${icon}" aria-hidden="true"></i>${label}</a></li>`;
    const group = (id, key, label, items) => `
                          <li role="none" class="lf-has-sub">
                              <button type="button" class="lf-sub-toggle" aria-expanded="false" aria-controls="lf-sub-${id}">
                                  <span data-i18n="${key}">${label}</span><i class="fas fa-chevron-down" aria-hidden="true"></i>
                              </button>
                              <ul class="lf-sub" id="lf-sub-${id}" role="menu">${items.join('')}</ul>
                          </li>`;

    this.innerHTML = `
      <header role="banner" class="labiofun-main-header lf-header">
          <div class="container lf-bar">
              <div class="header-top">
                  <a class="lf-brand" href="${basePath}index.html" aria-label="Labiofun: página inicial">Labiofun</a>
                  <span class="lf-tagline" data-i18n="site.title">Laboratório de Biofísica de Fungos</span>
                  <div class="language-switcher" role="group" aria-label="Idioma">
                      <button class="lang-btn active" data-lang="pt-BR" aria-label="Português" title="Português">PT</button>
                      <button class="lang-btn" data-lang="en" aria-label="English" title="English">EN</button>
                      <button class="lang-btn" data-lang="es-ES" aria-label="Español" title="Español">ES</button>
                      <button class="lang-btn" data-lang="fr-FR" aria-label="Français" title="Français">FR</button>
                  </div>
              </div>

              <div class="header-bottom">
                  <nav aria-label="Navegação principal" role="navigation">
                      <ul role="menubar">
                          ${group('sobre', 'nav.about', 'Sobre', [
                            L('index.html#about', 'nav.aboutLab', 'Sobre o Labiofun', 'fas fa-circle-info'),
                            L('index.html#mission', 'nav.mission', 'Missão', 'fas fa-id-badge'),
                            L('index.html#location', 'nav.location', 'Localização', 'fas fa-location-dot'),
                            L('index.html#sponsors', 'nav.sponsors', 'Patrocinadores', 'fas fa-handshake'),
                            L('pages/trademark.html', 'nav.trademark', 'Identidade Visual', 'fa-solid fa-wand-magic-sparkles')])}
                          ${group('pesquisa', 'nav.research', 'Pesquisa', [
                            L('index.html#research', 'nav.researchLines', 'Linhas de pesquisa', 'fas fa-flask'),
                            L('index.html#techniques', 'nav.techniques', 'Técnicas', 'fas fa-tools'),
                            L('pages/gallery.html', 'nav.gallery', 'Galeria', 'fas fa-camera')])}
                          ${L('index.html#team', 'nav.team', 'Equipe', 'fas fa-users')}
                          ${L('index.html#publications-page', 'nav.publications', 'Publicações', 'fas fa-book')}
                          ${group('participe', 'nav.involve', 'Participe', [
                            L('pages/vagas.html', 'nav.jobs', 'Vagas', 'fas fa-briefcase'),
                            L('pages/seminarios.html', 'nav.seminars', 'Seminários', 'fas fa-chalkboard-teacher'),
                            L('pages/defesas.html', 'nav.defences', 'Defesas', 'fas fa-graduation-cap')])}
                          ${L('pages/fungilingo.html', 'nav.fungilingo', 'Fungilingo', 'fas fa-seedling')}
                          <li role="none" class="lf-cta-item"><a href="${basePath}pages/contact.html" class="lf-cta" data-i18n="nav.contact" role="menuitem"><i class="fas fa-envelope" aria-hidden="true"></i>Contato</a></li>
                      </ul>
                  </nav>
              </div>
          </div>
      </header>
    `;

  }
}

class LabiofunFooter extends HTMLElement {
  connectedCallback() {
    const isPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isPagesDir ? '../' : '';

    this.innerHTML = `
      <footer>
          <div class="copyright" style="display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
              <p><span data-i18n="footer.copyright">&copy; 2019 a 2026 Laboratório de Biofísica de Fungos (Labiofun). Todos os direitos reservados.</span></p>
          </div>
      </footer>
    `;
    
  }
}

// Submenus do cabeçalho (clique/teclado) e cabeçalho compacto ao rolar
function lfInitHeader() {
  const header = document.querySelector('.lf-header');
  if (!header || header.dataset.ready) return;
  header.dataset.ready = '1';
  const closeAll = except => header.querySelectorAll('.lf-has-sub.open').forEach(li => {
    if (li !== except) { li.classList.remove('open'); li.querySelector('.lf-sub-toggle').setAttribute('aria-expanded', 'false'); }
  });
  header.querySelectorAll('.lf-sub-toggle').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const li = btn.parentElement, open = !li.classList.contains('open');
      closeAll(li); li.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', e => { if (!header.contains(e.target)) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  // Item do grupo ativo quando a página atual está dentro dele
  const here = location.pathname.split('/').pop() || 'index.html';
  header.querySelectorAll('.lf-sub a').forEach(a => {
    if (a.getAttribute('href').split('/').pop() === here) a.closest('.lf-has-sub').classList.add('current');
  });
  header.querySelectorAll('nav > ul > li > a').forEach(a => {
    if (here !== 'index.html' && a.getAttribute('href').split('/').pop() === here) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
  });
  const hero = document.querySelector('.lf-hero');
  if (hero) document.body.classList.add('lf-has-hero');
  const onScroll = () => {
    header.classList.toggle('lf-scrolled', window.scrollY > 8);
    if (hero) header.classList.toggle('lf-over-hero', window.scrollY < hero.offsetHeight - header.offsetHeight);
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
}
document.addEventListener('DOMContentLoaded', lfInitHeader);

// Define os componentes na janela do navegador
customElements.define('labiofun-header', LabiofunHeader);
customElements.define('labiofun-footer', LabiofunFooter);
