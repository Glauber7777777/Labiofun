#!/usr/bin/env node
/**
 * Pré-renderiza o conteúdo dinâmico (equipe, ex-membros, colaboradores,
 * publicações, livros) direto no index.html, para que buscadores e
 * prévias de link vejam o conteúdo sem executar JavaScript.
 *
 * Os scripts do site continuam funcionando: cada render*() faz
 * container.innerHTML = '' antes de desenhar, substituindo o HTML estático.
 *
 * Uso:  npm install && npm run prerender
 * Rode sempre que alterar data/*.js ou os textos em pt-BR.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');

// nome do bloco -> seletor do container no index.html
const TARGETS = {
  'current-team':  '#current-team .team-container',
  'collaborators': '#teamContainer',
  'alumni':        '#alumni .alumni-grid',
  'pub-years':     '#year-filter-container',
  'publications':  '.publications-container',
  'book-years':    '#books-year-filter-container',
  'books':         '.books-container',
};

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const file = path.join(ROOT, p);
      if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    }).listen(0, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const url = `http://127.0.0.1:${srv.address().port}/index.html?lang=pt-BR`;
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ locale: 'pt-BR' })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // Terceiros não entram no HTML estático
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r =>
    /fonts\.googleapis|fonts\.gstatic|cdnjs/.test(r.request().url()) ? r.continue() : r.abort());

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelectorAll('.publications-container > *').length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(1500);

  const blocks = await page.evaluate(targets => {
    const out = {};
    for (const [name, sel] of Object.entries(targets)) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const clone = el.cloneNode(true);
      clone.querySelectorAll('.altmetric-embed').forEach(a => { a.innerHTML = ''; a.removeAttribute('style'); a.classList.remove('altmetric-hidden'); });
      clone.querySelectorAll('[style*="display: none"]').forEach(n => { if (n.tagName === 'IMG' && !n.getAttribute('src')) n.remove(); });
      // estado de animação/JS não deve ir para o HTML estático
      clone.querySelectorAll('.active, .visible, .animated').forEach(n => {
        if (n.matches('.scroll-animate, .scroll-animate-left, .scroll-animate-right')) n.classList.remove('active');
      });
      out[name] = clone.innerHTML.trim();
    }
    return out;
  }, TARGETS);

  await browser.close();
  srv.close();
  if (errors.length) { console.error('Erros de JS na página:\n' + errors.join('\n')); process.exit(1); }

  let html = fs.readFileSync(INDEX, 'utf8');
  for (const [name, sel] of Object.entries(TARGETS)) {
    const content = blocks[name];
    if (!content) { console.warn(`aviso: bloco vazio "${name}" (${sel})`); continue; }
    const start = `<!--prerender:${name}-->`, end = `<!--/prerender:${name}-->`;
    const wrapped = `${start}\n${content}\n${end}`;
    const re = new RegExp(`${start}[\\s\\S]*?${end}`);
    if (re.test(html)) { html = html.replace(re, () => wrapped); continue; }
    // primeira execução: insere o bloco dentro do container vazio
    const open = containerOpenTag(sel);
    const i = html.search(open);
    if (i < 0) throw new Error(`Container não encontrado no index.html: ${sel}`);
    const tagEnd = html.indexOf('>', i) + 1;
    const close = html.indexOf('</div>', tagEnd);
    html = html.slice(0, tagEnd) + '\n' + wrapped + '\n' + html.slice(close);
  }
  fs.writeFileSync(INDEX, html);
  for (const [n, c] of Object.entries(blocks)) console.log(`${n.padEnd(14)} ${(c.length / 1024).toFixed(1)} KB`);
  console.log('index.html atualizado.');
})().catch(e => { console.error(e); process.exit(1); });

// Regex da tag de abertura de cada container no index.html original
function containerOpenTag(sel) {
  const map = {
    '#current-team .team-container': /<div id="current-team"[\s\S]*?<div class="team-container"/,
    '#teamContainer': /<div class="team-container" id="teamContainer"/,
    '#alumni .alumni-grid': /<div class="alumni-grid"/,
    '#year-filter-container': /<div class="year-filter" id="year-filter-container"/,
    '.publications-container': /<div class="publications-container"/,
    '#books-year-filter-container': /<div class="year-filter" id="books-year-filter-container"/,
    '.books-container': /<div class="books-container"/,
  };
  const re = map[sel];
  // para o seletor composto, posiciona no "<div class="team-container"" interno
  if (sel === '#current-team .team-container') {
    return { [Symbol.search]: s => { const m = re.exec(s); return m ? m.index + m[0].lastIndexOf('<div') : -1; } };
  }
  return re;
}
