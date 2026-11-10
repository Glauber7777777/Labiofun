/**
 * Fungilingo: glossário (filtro e busca), progresso local (XP, nível, dias seguidos)
 * e quiz com pontuação e ranking calculados no servidor (api/fungilingo.php).
 */
(function () {
    'use strict';
    const API = '../api/fungilingo.php';
    const STORE = 'fungilingo_progress_v1';
    const LEVELS = [
        { name: 'Esporo', xp: 0 }, { name: 'Hifa', xp: 300 }, { name: 'Micélio', xp: 1000 },
        { name: 'Colônia', xp: 2500 }, { name: 'Cogumelo', xp: 5000 }, { name: 'Micologista', xp: 10000 },
    ];
    // ---------- Idioma ----------
    const DICT = window.FL_I18N || {};
    function lang() {
        let l = 'pt-BR';
        try { l = (window.languageSwitcher && window.languageSwitcher.getCurrentLanguage()) || localStorage.getItem('labiofun-language') || 'pt-BR'; } catch (e) { }
        if (l === 'es') l = 'es-ES'; if (l === 'fr') l = 'fr-FR';
        return DICT[l] ? l : 'pt-BR';
    }
    function t(key, vars) {
        const d = DICT[lang()] || {}, base = DICT['pt-BR'] || {};
        let v = (key in d) ? d[key] : base[key];
        if (v == null) return key;
        if (vars && typeof v === 'string') v = v.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
        return v;
    }
    const catLabel = c => ((DICT[lang()] || {}).cats || {})[c] || c;
    // Mensagens do servidor (em português) -> chave do dicionário
    const SERVER_ERR = { 'Apelido': 'err.nick', 'já pertence': 'err.taken', 'Muitas rodadas': 'err.rate', 'expirad': 'err.expired', 'não encontrada': 'err.expired' };
    const trErr = msg => { for (const k in SERVER_ERR) if (String(msg).includes(k)) return t(SERVER_ERR[k]); return msg; };
    const trType = tipo => String(tipo)
        .replace(/^Glossário · (.+)$/, (m, c) => t('type.glossary') + ' · ' + catLabel(c))
        .replace(/^Artigo do Labiofun$/, t('type.article')).replace(/^Micologia$/, t('type.myco'));

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = s => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
    const plain = s => String(s).replace(/\*/g, '');

    // ---------- Progresso local ----------
    function load() {
        try { return Object.assign({ xp: 0, learned: [], streak: 0, lastDay: null, name: '', token: '' }, JSON.parse(localStorage.getItem(STORE) || '{}')); }
        catch (e) { return { xp: 0, learned: [], streak: 0, lastDay: null, name: '', token: '' }; }
    }
    let P = load();
    // chave secreta que reserva o apelido para este navegador
    if (!/^[a-f0-9]{32}$/.test(P.token || '')) {
        const a = new Uint8Array(16); (window.crypto || window.msCrypto).getRandomValues(a);
        P.token = [...a].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    const save = () => { try { localStorage.setItem(STORE, JSON.stringify(P)); } catch (e) { } };
    const today = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD local

    function touchStreak() {
        const td = today();
        if (P.lastDay === td) return;
        const y = new Date(); y.setDate(y.getDate() - 1);
        P.streak = (P.lastDay === y.toLocaleDateString('sv-SE')) ? P.streak + 1 : 1;
        P.lastDay = td;
    }

    function addXP(n, msg) {
        if (n <= 0) return;
        touchStreak(); P.xp += n; save(); renderStats();
        toast(`+${n} XP${msg ? ' · ' + msg : ''}`);
    }

    function renderStats() {
        // dias seguidos expiram se o último dia não foi hoje nem ontem
        const y = new Date(); y.setDate(y.getDate() - 1);
        const streak = (P.lastDay === today() || P.lastDay === y.toLocaleDateString('sv-SE')) ? P.streak : 0;
        let li = 0; LEVELS.forEach((l, i) => { if (P.xp >= l.xp) li = i; });
        const cur = LEVELS[li], next = LEVELS[li + 1];
        $('#fl-level').textContent = (t('levels') || [])[li] || cur.name;
        $('#fl-xp').textContent = P.xp.toLocaleString('pt-BR');
        $('#fl-streak').textContent = streak;
        $('#fl-learned').textContent = P.learned.length;
        const pct = next ? ((P.xp - cur.xp) / (next.xp - cur.xp)) * 100 : 100;
        $('#fl-levelbar-fill').style.width = Math.max(2, Math.min(100, pct)) + '%';
        $('#fl-levelhint').textContent = next ? t('level.hint', { n: (next.xp - P.xp).toLocaleString('pt-BR'), lvl: (t('levels') || [])[li + 1] || next.name }) : t('level.max');
    }

    let toastTimer;
    function toast(text) {
        let el = $('.fl-toast');
        if (!el) { el = document.createElement('div'); el.className = 'fl-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
        el.textContent = text; el.classList.add('show');
        clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
    }

    // ---------- Abas ----------
    function showTab(name) {
        $$('.fl-tab').forEach(b => { const on = b.dataset.tab === name; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
        $$('.fl-panel').forEach(p => { const on = p.id === 'fl-panel-' + name; p.classList.toggle('active', on); p.hidden = !on; });
        if (name === 'ranking') loadRanking();
        try { history.replaceState(null, '', '#' + name); } catch (e) { }
    }
    $$('.fl-tab').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
    $$('[data-goto]').forEach(b => b.addEventListener('click', () => showTab(b.dataset.goto)));

    // ---------- Glossário ----------
    const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    let activeCat = '';
    function filterTerms() {
        const q = norm($('#fl-search').value.trim());
        let n = 0;
        $$('.fl-term').forEach(card => {
            const ok = (!activeCat || card.dataset.cat === activeCat) && (!q || norm(card.dataset.search).includes(q));
            card.hidden = !ok; if (ok) n++;
        });
        $('#fl-count').textContent = `${n} ${n === 1 ? t('count.one') : t('count.many')}`;
        $('#fl-empty').hidden = n > 0;
    }
    $('#fl-search').addEventListener('input', filterTerms);
    $$('.fl-chip').forEach(c => c.addEventListener('click', () => {
        $$('.fl-chip').forEach(x => x.classList.remove('active')); c.classList.add('active');
        activeCat = c.dataset.cat; filterTerms();
    }));
    $$('.fl-term').forEach(card => {
        const btn = $('.fl-learn', card), term = btn.dataset.term;
        const paint = () => { const on = P.learned.includes(term); card.classList.toggle('learned', on); $('span', btn).textContent = on ? t('learned') : t('learn'); $('i', btn).className = on ? 'fas fa-circle-check' : 'far fa-circle-check'; };
        paint();
        btn.addEventListener('click', () => {
            if (P.learned.includes(term)) { P.learned = P.learned.filter(x => x !== term); save(); renderStats(); }
            else { P.learned.push(term); addXP(5, t('xp.learned')); }
            paint();
        });
    });

    // ---------- Quiz ----------
    let round = null, idx = 0, score = 0, correctCount = 0, answered = false;

    async function api(action, data) {
        const opt = data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {};
        const r = await fetch(`${API}?action=${action}`, opt);
        let j; try { j = await r.json(); } catch (e) { throw new Error(t('err.server')); }
        if (!j.ok) throw new Error(trErr(j.error || t('err.unexpected')));
        return j;
    }

    function show(id) { ['#fl-quiz-start', '#fl-quiz-play', '#fl-quiz-end'].forEach(s => { $(s).hidden = (s !== id); }); }

    const NAME_RE = /^[\p{L}\p{N} ._\-]{2,20}$/u;
    async function start() {
        const btn = $('#fl-start'), err = $('#fl-start-error'), input = $('#fl-name');
        const name = input.value.trim().replace(/\s+/g, ' ');
        err.hidden = true; input.removeAttribute('aria-invalid');
        if (!NAME_RE.test(name)) {
            show('#fl-quiz-start'); input.setAttribute('aria-invalid', 'true'); input.focus();
            err.textContent = t('err.nick'); err.hidden = false;
            return;
        }
        btn.disabled = true;
        try {
            round = await api('start', { name, token: P.token });
            P.name = name; save();
            $('#fl-player-name').textContent = name;
            idx = 0; score = 0; correctCount = 0;
            $('#fl-score').textContent = '0';
            show('#fl-quiz-play'); renderQuestion();
        } catch (e) {
            show('#fl-quiz-start'); err.textContent = e.message; err.hidden = false;
            if (/apelido|nickname|apodo|pseudo/i.test(e.message)) { input.setAttribute('aria-invalid', 'true'); input.focus(); input.select(); }
        }
        finally { btn.disabled = false; }
    }

    function reportLink(question) {
        const s = encodeURIComponent('Fungilingo: erro no quiz');
        const m = encodeURIComponent(`Pergunta: ${plain(question.q)}\nOpções: ${question.o.map(plain).join(' | ')}\nO erro que encontrei: `);
        return `contact.html?assunto=${s}&mensagem=${m}`;
    }

    function renderQuestion() {
        const q = round.questions[idx]; answered = false;
        $('#fl-qnum').textContent = `${idx + 1}/${round.total}`;
        $('#fl-qtype').textContent = trType(q.tipo);
        $('#fl-question').innerHTML = fmt(q.q);
        $('#fl-progress-fill').style.width = (idx / round.total * 100) + '%';
        $('#fl-feedback').hidden = true;
        const box = $('#fl-options'); box.innerHTML = '';
        q.o.forEach((opt, i) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'fl-option';
            b.innerHTML = `<kbd>${i + 1}</kbd><span>${fmt(opt)}</span>`;
            b.addEventListener('click', () => answer(i));
            box.appendChild(b);
        });
        box.firstChild && box.firstChild.focus({ preventScroll: true });
    }

    async function answer(choice) {
        if (answered) return; answered = true;
        const buttons = $$('.fl-option'); buttons.forEach(b => b.disabled = true);
        try {
            const r = await api('answer', { sid: round.sid, i: idx, choice });
            buttons[r.answer].classList.add('correct');
            if (!r.correct) buttons[choice].classList.add('wrong');
            score = r.score; if (r.correct) correctCount++;
            $('#fl-score').textContent = score;
            const fb = $('#fl-feedback');
            fb.className = 'fl-feedback ' + (r.correct ? 'ok' : 'no');
            $('.fl-feedback-head i', fb).className = 'fas ' + (r.correct ? 'fa-circle-check' : 'fa-circle-xmark');
            $('#fl-feedback-title').textContent = r.correct ? t('correct') : t('wrong');
            $('#fl-feedback-pts').textContent = r.correct ? `+${r.points}${r.bonus ? ` (${t('bonus')} ${r.bonus})` : ''}` : '';
            $('#fl-feedback-text').innerHTML = fmt(r.explanation);
            const ref = $('#fl-feedback-ref'); ref.hidden = !r.ref; if (r.ref) ref.href = r.ref;
            $('#fl-feedback-report').href = reportLink(round.questions[idx]);
            $('#fl-next').innerHTML = r.done ? `${t('results')} <i class="fas fa-flag-checkered"></i>` : `${t('continue')} <i class="fas fa-arrow-right"></i>`;
            $('#fl-next').dataset.done = r.done ? '1' : '';
            fb.hidden = false;
            $('#fl-next').focus({ preventScroll: true });
            fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } catch (e) {
            answered = false; buttons.forEach(b => b.disabled = false);
            toast(e.message);
        }
    }

    function next() {
        if ($('#fl-next').dataset.done) return finish();
        idx++; renderQuestion();
    }

    function finish() {
        $('#fl-progress-fill').style.width = '100%';
        $('#fl-end-score').textContent = score;
        $('#fl-end-correct').textContent = correctCount;
        $('#fl-end-total').textContent = round.total;
        const pct = correctCount / round.total;
        $('#fl-end-icon').textContent = pct >= .9 ? '🏆' : pct >= .6 ? '🍄' : '🌱';
        $('#fl-end-title').textContent = pct >= .9 ? t('end.great') : pct >= .6 ? t('end.good') : t('end.keep');
        const msg = $('#fl-rank-msg'), err = $('#fl-submit-error');
        msg.textContent = t('registering'); msg.hidden = false; err.hidden = true;
        show('#fl-quiz-end');
        addXP(Math.round(score / 10), t('xp.round'));
        submitScore();
    }

    // A pontuação entra no ranking automaticamente com o apelido escolhido no início
    async function submitScore() {
        const msg = $('#fl-rank-msg'), err = $('#fl-submit-error');
        try {
            const r = await api('submit', { sid: round.sid });
            msg.textContent = r.isBest
                ? t('rank.best', { name: P.name, rank: r.rank, n: r.players, players: r.players === 1 ? t('player') : t('players') })
                : t('rank.other', { name: P.name, best: r.best, rank: r.rank });
        } catch (ex) { msg.hidden = true; err.textContent = t('rank.fail') + ex.message; err.hidden = false; }
    }

    $('#fl-start-form').addEventListener('submit', e => { e.preventDefault(); start(); });
    $('#fl-again').addEventListener('click', start);
    $('#fl-name').value = P.name || '';
    save();
    $('#fl-next').addEventListener('click', next);
    document.addEventListener('keydown', e => {
        if ($('#fl-quiz-play').hidden || e.target.tagName === 'INPUT') return;
        if (!answered && /^[1-4]$/.test(e.key)) { const b = $$('.fl-option')[+e.key - 1]; if (b) { e.preventDefault(); b.click(); } }
        else if (answered && e.key === 'Enter' && !$('#fl-feedback').hidden && document.activeElement !== $('#fl-next')) { e.preventDefault(); next(); }
    });

    // ---------- Ranking ----------
    let period = 'week';
    async function loadRanking() {
        const ol = $('#fl-ranking');
        ol.innerHTML = `<li class="fl-muted">${t('loading')}</li>`;
        try {
            const r = await api('leaderboard&period=' + period);
            if (!r.top.length) { ol.innerHTML = `<li class="fl-muted">${t('rank.empty')}</li>`; return; }
            const medal = ['🥇', '🥈', '🥉'];
            ol.innerHTML = r.top.map((e, i) => `
                <li class="${P.name && e.name.toLowerCase() === P.name.toLowerCase() ? 'me' : ''}">
                    <span class="pos">${medal[i] || i + 1}</span>
                    <span class="name">${esc(e.name)}<small>${e.correct}/${e.total} ${t('hits.short')} · ${e.secs}s · ${new Date(e.ts * 1000).toLocaleDateString('pt-BR')}</small></span>
                    <span class="pts">${e.score}</span>
                </li>`).join('');
        } catch (e) { ol.innerHTML = `<li class="fl-muted">${esc(e.message)}</li>`; }
    }
    $$('.fl-rank-period button').forEach(b => b.addEventListener('click', () => {
        $$('.fl-rank-period button').forEach(x => x.classList.remove('active')); b.classList.add('active');
        period = b.dataset.period; loadRanking();
    }));

    // ---------- Aplicar idioma ----------
    function applyLang() {
        $$('[data-fl]').forEach(el => { const v = t(el.dataset.fl); if (typeof v === 'string') { el.textContent = v; if (el.dataset.fl === 'content.note') el.hidden = !v; } });
        $$('[data-fl-ph]').forEach(el => el.setAttribute('placeholder', t(el.dataset.flPh)));
        $$('[data-fl-html]').forEach(el => { el.innerHTML = t(el.dataset.flHtml); });
        $$('.fl-chip').forEach(c => {
            const n = (c.textContent.match(/\((\d+)\)\s*$/) || [])[1];
            const label = c.dataset.cat ? catLabel(c.dataset.cat) : t('all');
            c.textContent = n ? `${label} (${n})` : label;
        });
        $$('.fl-term .fl-cat').forEach(el => { el.dataset.pt = el.dataset.pt || el.textContent; el.textContent = catLabel(el.dataset.pt); });
        $$('.fl-term').forEach(tm => { const btn = $('.fl-learn', tm); if (btn) $('span', btn).textContent = P.learned.includes(btn.dataset.term) ? t('learned') : t('learn'); });
        renderStats(); filterTerms();
        if (!$('#fl-panel-ranking').hidden) loadRanking();
        if (round && !$('#fl-quiz-play').hidden) { $('#fl-qtype').textContent = trType(round.questions[idx].tipo); }
    }
    document.addEventListener('languageChanged', () => setTimeout(applyLang, 0));

    // ---------- Início ----------
    renderStats();
    setTimeout(applyLang, 0);
    const h = location.hash.replace('#', '');
    if (h.startsWith('termo-')) {
        const el = document.getElementById(h);
        if (el) { setTimeout(() => { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); }, 300); }
    } else if (['quiz', 'ranking', 'glossario'].includes(h)) showTab(h);
})();
