/**
 * Seminários a partir de uma planilha do Google (ou CSV).
 *
 * COMO CONFIGURAR (uma vez):
 *  1. Importe "modelo-seminarios.csv" no Google Planilhas.
 *  2. Arquivo → Compartilhar → Publicar na Web → escolha a aba → "Valores separados por vírgula (.csv)" → Publicar.
 *  3. Cole o link gerado abaixo, em SHEET_CSV_URL, e publique este arquivo uma única vez.
 *
 * Depois disso, basta editar a planilha: o site atualiza sozinho (em poucos minutos).
 *
 * Colunas (1ª linha da planilha, nesta grafia):
 *   data | apresentador | tipo | titulo | horario | local | telefone | entrada_gratuita
 *   - data: 25/11/2026 ou 2026-11-25
 *   - tipo: seminario, tcc, mestrado, doutorado, selecao, divulgacao
 *   - demais colunas são opcionais (horario/local/telefone/entrada_gratuita usados em "divulgacao")
 *
 * Se o link estiver vazio, a planilha estiver fora do ar ou sem linhas válidas,
 * o site usa os dados de data/seminarios.js.
 */
(function () {
    const SHEET_CSV_URL = ''; // ← cole aqui o link .csv publicado do Google Planilhas
    const TIMEOUT_MS = 5000;
    const CACHE_KEY = 'labiofun_seminars_sheet_v1';
    const CACHE_MAX_AGE_MS = 10 * 60 * 1000; // 10 min

    const TYPES = {
        seminario:   { type: 'regular',  titleKey: 'seminars.type.regular' },
        progresso:   { type: 'regular',  titleKey: 'seminars.type.regular' },
        regular:     { type: 'regular',  titleKey: 'seminars.type.regular' },
        tcc:         { type: 'exam',     titleKey: 'seminars.type.tcc' },
        mestrado:    { type: 'exam',     titleKey: 'seminars.type.masters' },
        doutorado:   { type: 'exam',     titleKey: 'seminars.type.phd' },
        selecao:     { type: 'exam',     titleKey: 'seminars.type.admission' },
        qualificacao:{ type: 'exam',     titleKey: 'seminars.type.admission' },
        divulgacao:  { type: 'outreach', titleKey: null },
    };

    const norm = s => String(s || '').trim().toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z_]/g, '');

    // CSV com aspas, vírgulas e quebras de linha dentro de campos
    function parseCSV(text) {
        const rows = []; let row = [], field = '', q = false;
        text = text.replace(/^﻿/, '');
        const sep = (text.split('\n')[0].split(';').length > text.split('\n')[0].split(',').length) ? ';' : ',';
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (q) {
                if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
                else if (c === '"') q = false;
                else field += c;
            } else if (c === '"') q = true;
            else if (c === sep) { row.push(field); field = ''; }
            else if (c === '\n' || c === '\r') {
                if (c === '\r' && text[i + 1] === '\n') i++;
                row.push(field); rows.push(row); row = []; field = '';
            } else field += c;
        }
        if (field !== '' || row.length) { row.push(field); rows.push(row); }
        return rows.filter(r => r.some(v => v.trim() !== ''));
    }

    function toISO(s) {
        s = String(s || '').trim();
        let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
        m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
        return null;
    }

    function rowsToSeminars(rows) {
        if (rows.length < 2) return [];
        const head = rows[0].map(norm);
        const col = name => head.indexOf(name);
        const get = (r, name) => { const i = col(name); return i >= 0 ? String(r[i] || '').trim() : ''; };
        const out = [];
        rows.slice(1).forEach((r, idx) => {
            const date = toISO(get(r, 'data'));
            const presenter = get(r, 'apresentador');
            const t = TYPES[norm(get(r, 'tipo'))] || TYPES.seminario;
            if (!date || !presenter) return; // linha incompleta: ignora
            const item = { id: 1000 + idx, date, presenter, type: t.type };
            if (t.titleKey) item.titleKey = t.titleKey;
            const title = get(r, 'titulo'); if (title) item.title = title;
            const timeRange = get(r, 'horario'); if (timeRange) item.timeRange = timeRange;
            const location = get(r, 'local'); if (location) item.location = location;
            const phone = get(r, 'telefone'); if (phone) item.phone = phone;
            if (/^(sim|s|x|true|1)$/i.test(get(r, 'entrada_gratuita'))) item.freeEntry = true;
            if (t.type === 'outreach' && !item.title) item.title = 'Divulgação Científica';
            out.push(item);
        });
        return out;
    }

    function apply(list) {
        if (Array.isArray(list) && list.length) window.seminarsData = list;
    }

    function readCache() {
        try {
            const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
            if (c && c.url === SHEET_CSV_URL && Date.now() - c.t < CACHE_MAX_AGE_MS) return c.data;
        } catch (e) { }
        return null;
    }

    function load() {
        if (!SHEET_CSV_URL) return Promise.resolve(window.seminarsData);
        const cached = readCache();
        if (cached) { apply(cached); return Promise.resolve(window.seminarsData); }

        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timer = setTimeout(() => ctrl && ctrl.abort(), TIMEOUT_MS);
        return fetch(SHEET_CSV_URL, { signal: ctrl ? ctrl.signal : undefined, cache: 'no-store' })
            .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
            .then(text => {
                const list = rowsToSeminars(parseCSV(text));
                if (list.length) {
                    apply(list);
                    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ url: SHEET_CSV_URL, t: Date.now(), data: list })); } catch (e) { }
                }
                return window.seminarsData;
            })
            .catch(err => { console.warn('Seminários: usando dados locais (' + err.message + ')'); return window.seminarsData; })
            .finally(() => clearTimeout(timer));
    }

    // Páginas aguardam esta Promise antes de desenhar seminários
    window.seminarsReady = load();
    window.__seminarsSheet = { parseCSV, rowsToSeminars }; // para testes
})();
