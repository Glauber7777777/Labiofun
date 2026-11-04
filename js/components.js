/**
 * Componentes Web para o Site Labiofun
 * Centraliza o Cabeçalho (Header) e Rodapé (Footer) para evitar duplicação de HTML.
 */

class LabiofunHeader extends HTMLElement {
  connectedCallback() {
    // Detecta se estamos numa subpasta (ex: /pages/) ou na raiz para corrigir os links
    const isPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isPagesDir ? '../' : '';

    this.innerHTML = `
      <header role="banner" class="labiofun-main-header glass-header">
          <div class="container">
              <div class="header-top">
                  <div class="logo-container">
                      <img src="${basePath}images/ufrj.webp" 
                           srcset="${basePath}images/ufrj.webp 800w, ${basePath}images/ufrj.webp 400w" 
                           sizes="(max-width: 600px) 400px, 800px" 
                           alt="Logo UFRJ" class="logo-img" loading="eager">
                  </div>
                  <div class="header-title">
                      <h1 data-i18n="site.title"><strong>Laboratório de Biofísica de Fungos</strong></h1>
                  </div>
                  <div class="logo-container">
                      <img src="${basePath}images/logo-pequeno.webp" 
                           srcset="${basePath}images/logo-pequeno.webp 800w, ${basePath}images/logo-pequeno.webp 400w" 
                           sizes="(max-width: 600px) 400px, 800px"
                           alt="Logo Labiofun" class="logo-img" loading="eager">
                  </div>
                  <!-- Language Switcher -->
                  <div class="language-switcher" role="navigation" aria-label="Seletor de idioma">
                      <button class="lang-btn active" data-lang="pt-BR" aria-label="Português" title="Português">🇧🇷</button>
                      <button class="lang-btn" data-lang="en" aria-label="English" title="English">🇺🇸</button>
                      <button class="lang-btn" data-lang="es-ES" aria-label="Español" title="Español">🇪🇸</button>
                      <button class="lang-btn" data-lang="fr-FR" aria-label="Français" title="Français">🇫🇷</button>
                  </div>
              </div>

              <!-- Main Navigation -->
              <div class="header-bottom">
                  <nav aria-label="Navegação principal" role="navigation">
                      <ul role="menubar">
                          <li role="none"><a href="${basePath}index.html#about" data-i18n="nav.home" role="menuitem"><i class="fas fa-home"></i>Início</a></li>
                          <li role="none"><a href="${basePath}index.html#mission" data-i18n="nav.mission" role="menuitem"><i class="fas fa-id-badge"></i>Missão</a></li>
                          <li role="none"><a href="${basePath}index.html#research" data-i18n="nav.research" role="menuitem"><i class="fas fa-flask"></i>Pesquisas</a></li>
                          <li role="none"><a href="${basePath}index.html#techniques" data-i18n="nav.techniques" role="menuitem"><i class="fas fa-tools"></i>Técnicas</a></li>
                          <li role="none"><a href="${basePath}pages/gallery.html" data-i18n="nav.gallery" role="menuitem"><i class="fas fa-camera"></i>Galeria</a></li>
                          <li role="none"><a href="${basePath}index.html#team" data-i18n="nav.team" role="menuitem"><i class="fas fa-users"></i>Equipe</a></li>
                          <li role="none"><a href="${basePath}index.html#publications-page" data-i18n="nav.publications" role="menuitem"><i class="fas fa-book"></i>Publicações</a></li>
                          <li role="none"><a href="${basePath}pages/defesas.html" data-i18n="nav.defences" role="menuitem"><i class="fas fa-graduation-cap"></i>Defesas</a></li>
                          <li role="none"><a href="${basePath}pages/vagas.html" data-i18n="nav.jobs" role="menuitem"><i class="fas fa-briefcase"></i>Vagas</a></li>
                          <li role="none"><a href="${basePath}index.html#sponsors" data-i18n="nav.sponsors" role="menuitem"><i class="fas fa-handshake"></i>Patrocínio</a></li>
                          <li role="none"><a href="${basePath}index.html#location" data-i18n="nav.location" role="menuitem"><i class="fas fa-location-dot"></i>Localização</a></li>
                          <li role="none"><a href="${basePath}index.html#contact" data-i18n="nav.contact" role="menuitem"><i class="fas fa-comments"></i>Contato</a></li>
                          <li role="none"><a href="${basePath}pages/trademark.html" data-i18n="nav.trademark" role="menuitem"><i class="fa-solid fa-wand-magic-sparkles"></i>Identidade Visual</a></li>
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
              <p><span data-i18n="footer.copyright">&copy; 2019 – 2026 Laboratório de Biofísica de Fungos (Labiofun). Todos os direitos reservados.</span></p>
          </div>
      </footer>
    `;
    
  }
}

// Define os componentes na janela do navegador
customElements.define('labiofun-header', LabiofunHeader);
customElements.define('labiofun-footer', LabiofunFooter);
