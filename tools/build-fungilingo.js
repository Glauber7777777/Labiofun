#!/usr/bin/env node
/**
 * Gera o glossário do Fungilingo como HTML estático dentro de pages/fungilingo.html
 * (entre <!--glossary--> e <!--/glossary-->), ligando cada termo aos artigos do Labiofun.
 *
 * Uso: node tools/build-fungilingo.js   (rode após editar data/fungilingo-glossary.json)
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const glossary = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fungilingo-glossary.json'), 'utf8'));
const pubSrc = fs.readFileSync(path.join(ROOT, 'data/publications.js'), 'utf8');
const pubs = JSON.parse(pubSrc.slice(pubSrc.indexOf('['), pubSrc.lastIndexOf(']') + 1));

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, '');
// Nomes científicos em itálico (lista compartilhada com o quiz: js/fl-sci.js)
const { sci } = require(path.join(ROOT, 'js/fl-sci.js'));

const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const sorted = [...glossary].sort((a, b) => a.t.localeCompare(b.t, 'pt-BR'));
let linked = 0;

const cards = sorted.map(term => {
  const seen = new Set();
  const related = pubs
    .filter(p => (term.k || []).some(k => strip(p.title).toLowerCase().includes(k.toLowerCase())))
    .filter(p => { const key = strip(p.title).toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; })
    .sort((a, b) => b.year - a.year)
    .slice(0, 3);
  if (related.length) linked++;
  const doiUrl = d => d.startsWith('http') ? d : 'https://doi.org/' + d;
  const relHtml = related.length ? `
        <div class="fl-term-refs"><span><i class="fas fa-book-open"></i> <span data-fl="refs">Nos artigos do Labiofun:</span></span><ul>${related.map(p =>
          `<li><a href="${esc(doiUrl(p.doi))}" target="_blank" rel="noopener">${sci(esc(strip(p.title)))}</a> <em>(${p.year})</em></li>`).join('')}</ul></div>` : '';
  return `
      <article class="fl-term" id="termo-${slug(term.t)}" data-cat="${esc(term.c)}" data-search="${esc((term.t + ' ' + term.d).toLowerCase())}">
        <div class="fl-term-head"><h3>${sci(esc(term.t))}</h3><span class="fl-cat">${esc(term.c)}</span></div>
        <p>${sci(esc(term.d))}</p>${relHtml}
        <div class="fl-term-foot">
          <button type="button" class="fl-learn" data-term="${esc(term.t)}"><i class="far fa-circle-check"></i> <span>Aprendi</span></button>
          <a class="fl-report" href="contact.html?assunto=${encodeURIComponent('Fungilingo: erro no glossário — ' + term.t)}&amp;mensagem=${encodeURIComponent('Termo: ' + term.t + '\nO erro que encontrei: ')}"><i class="fas fa-flag"></i> <span data-fl="report">Reportar erro</span></a>
        </div>
      </article>`;
}).join('');

const cats = [...new Set(glossary.map(t => t.c))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
const chips = `<button type="button" class="fl-chip active" data-cat="">Todos (${glossary.length})</button>` +
  cats.map(c => `<button type="button" class="fl-chip" data-cat="${esc(c)}">${esc(c)} (${glossary.filter(t => t.c === c).length})</button>`).join('');

const block = `<!--glossary-->
      <div class="fl-chips" role="group" aria-label="Filtrar por tema">${chips}</div>
      <p class="fl-count" id="fl-count">${glossary.length} termos</p>
      <div class="fl-terms" id="fl-terms">${cards}
      </div>
      <!--/glossary-->`;

const file = path.join(ROOT, 'pages/fungilingo.html');
let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<!--glossary-->[\s\S]*?<!--\/glossary-->/, () => block);
fs.writeFileSync(file, html);
console.log(`Glossário: ${glossary.length} termos (${linked} ligados a artigos) → pages/fungilingo.html`);
