/**
 * i18n complementar do site Labiofun.
 *
 * O language-switcher aplica as traduções uma única vez, por chave (data-i18n).
 * Este módulo cobre o que sobrava em português:
 *  1. conteúdo desenhado depois pelo JavaScript (equipe, colaboradores, galeria, sino):
 *     reaplica as chaves data-i18n sempre que o DOM muda;
 *  2. textos e atributos sem chave (aria-label, title, alt, placeholder), por
 *     correspondência exata com os dicionários window.I18N_EXTRA e window.I18N_CONTENT;
 *  3. blocos com marcação (biografias com nomes científicos em itálico), por innerHTML.
 *
 * Formato dos dicionários: { "texto em português": { en: "...", "es-ES": "...", "fr-FR": "..." } }
 */
(function () {
    'use strict';
    const LANGS = ['en', 'es-ES', 'fr-FR'];
    const HTML_SEL = '.tm-bio, .tc-desc, [data-i18n-extra-html]';
    const ATTRS = ['aria-label', 'title', 'alt', 'placeholder'];
    const norm = s => String(s).replace(/\s+/g, ' ').trim();

    let DICT = null;           // texto PT normalizado -> {en, es-ES, fr-FR}
    let REVERSE = null;        // qualquer tradução normalizada -> texto PT
    // Textos com número variável: modelo em cada idioma ($1 = número)
    const PATTERNS = [
        { 'pt-BR': 'Ir para colaborador $1', en: 'Go to collaborator $1', 'es-ES': 'Ir al colaborador $1', 'fr-FR': 'Aller au collaborateur $1' },
    ];
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    function build() {
        DICT = new Map(); REVERSE = new Map();
        for (const src of [window.I18N_EXTRA, window.I18N_CONTENT]) {
            if (!src) continue;
            for (const [pt, tr] of Object.entries(src)) {
                const k = norm(pt); DICT.set(k, tr);
                for (const l of LANGS) if (tr[l]) REVERSE.set(norm(tr[l]), k);
            }
        }
    }
    function lang() {
        let l = 'pt-BR';
        try { l = (window.languageSwitcher && window.languageSwitcher.getCurrentLanguage()) || localStorage.getItem('labiofun-language') || 'pt-BR'; } catch (e) { }
        return { es: 'es-ES', fr: 'fr-FR' }[l] || l;
    }
    // Recupera o texto em português, mesmo se o conteúdo já estiver traduzido
    const toPT = s => { const k = norm(s); return DICT.has(k) ? k : (REVERSE.get(k) || null); };
    function translate(pt, l) {
        if (l === 'pt-BR') return pt;
        const tr = DICT.get(pt);
        return (tr && tr[l]) || null;
    }
    function translatePattern(s, l) {
        const txt = norm(s);
        for (const p of PATTERNS) {
            for (const src of ['pt-BR', ...LANGS]) {
                const m = txt.match(new RegExp('^' + esc(p[src]).replace('\\$1', '(\\d+)') + '$'));
                if (m) return p[l] ? p[l].replace('$1', m[1]) : null;
            }
        }
        // "Título — descrição" (alt das imagens da galeria): traduz cada parte
        const parts = txt.split(' — ');
        for (let i = 1; i < parts.length; i++) {
            const a = toPT(parts.slice(0, i).join(' — ')), b = toPT(parts.slice(i).join(' — '));
            if (a && b) { const ta = translate(a, l), tb = translate(b, l); if (ta && tb) return ta + ' — ' + tb; }
        }
        return null;
    }

    let busy = false;
    function apply(root) {
        if (busy || !DICT) return;
        busy = true;
        const l = lang();
        try {
            const scope = root && root.nodeType === 1 ? root : document.body;
            // 1) chaves data-i18n desenhadas depois da troca de idioma
            const tr = ((typeof translations !== 'undefined' && translations) || window.translations || {})[l];
            if (tr) scope.querySelectorAll('[data-i18n]').forEach(el => {
                const v = tr[el.getAttribute('data-i18n')];
                if (!v || el.closest('#fl-panel-glossario .fl-term')) return;
                const icons = [...el.children].filter(c => c.tagName === 'I');
                if (icons.length) { if (norm(el.textContent) !== norm(v)) el.innerHTML = icons.map(i => i.outerHTML).join('') + ' ' + v; }
                else if (norm(el.textContent) !== norm(v) && !el.querySelector('*:not(i):not(em):not(strong):not(br)')) el.textContent = v;
            });
            // 2) blocos com marcação (biografias)
            scope.querySelectorAll(HTML_SEL).forEach(el => {
                const pt = toPT(el.innerHTML); if (!pt) return;
                const out = translate(pt, l); if (out && norm(el.innerHTML) !== norm(out)) el.innerHTML = out;
            });
            // 3) nós de texto
            const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
                acceptNode: n => (n.parentElement && !n.parentElement.closest('script,style,textarea,' + HTML_SEL) && n.textContent.trim().length > 1) ? 1 : 2,
            });
            const nodes = []; let n; while ((n = walker.nextNode())) nodes.push(n);
            for (const node of nodes) {
                const raw = node.textContent, pt = toPT(raw);
                let out = pt ? translate(pt, l) : translatePattern(raw, l);
                if (out && norm(raw) !== norm(out)) {
                    const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
                    node.textContent = lead + out + trail;
                }
            }
            // 4) atributos
            scope.querySelectorAll(ATTRS.map(a => `[${a}]`).join(',')).forEach(el => {
                for (const a of ATTRS) {
                    const v = el.getAttribute(a); if (!v) continue;
                    const pt = toPT(v); const out = pt ? translate(pt, l) : translatePattern(v, l);
                    if (out && out !== v) el.setAttribute(a, out);
                }
            });
            document.documentElement.setAttribute('lang', l);
        } finally { busy = false; }
    }

    let timer = null;
    function schedule() { clearTimeout(timer); timer = setTimeout(() => apply(document.body), 60); }

    function start() {
        build();
        apply(document.body);
        document.addEventListener('languageChanged', () => setTimeout(() => apply(document.body), 0));
        new MutationObserver(muts => { if (!busy && muts.some(m => m.addedNodes.length || m.type === 'characterData')) schedule(); })
            .observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0));
    else setTimeout(start, 0);
    window.labiofunI18nApply = () => apply(document.body);
})();
