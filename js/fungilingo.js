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
        const t = today();
        if (P.lastDay === t) return;
        const y = new Date(); y.setDate(y.getDate() - 1);
        P.streak = (P.lastDay === y.toLocaleDateString('sv-SE')) ? P.streak + 1 : 1;
        P.lastDay = t;
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
        $('#fl-level').textContent = cur.name;
        $('#fl-xp').textContent = P.xp.toLocaleString('pt-BR');
        $('#fl-streak').textContent = streak;
        $('#fl-learned').textContent = P.learned.length;
        const pct = next ? ((P.xp - cur.xp) / (next.xp - cur.xp)) * 100 : 100;
        $('#fl-levelbar-fill').style.width = Math.max(2, Math.min(100, pct)) + '%';
        $('#fl-levelhint').textContent = next ? `Faltam ${(next.xp - P.xp).toLocaleString('pt-BR')} XP para ${next.name}` : 'Nível máximo alcançado!';
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
        $$('.fl-term').forEach(t => {
            const ok = (!activeCat || t.dataset.cat === activeCat) && (!q || norm(t.dataset.search).includes(q));
            t.hidden = !ok; if (ok) n++;
        });
        $('#fl-count').textContent = `${n} ${n === 1 ? 'termo' : 'termos'}`;
        $('#fl-empty').hidden = n > 0;
    }
    $('#fl-search').addEventListener('input', filterTerms);
    $$('.fl-chip').forEach(c => c.addEventListener('click', () => {
        $$('.fl-chip').forEach(x => x.classList.remove('active')); c.classList.add('active');
        activeCat = c.dataset.cat; filterTerms();
    }));
    $$('.fl-term').forEach(t => {
        const btn = $('.fl-learn', t), term = btn.dataset.term;
        const paint = () => { const on = P.learned.includes(term); t.classList.toggle('learned', on); $('span', btn).textContent = on ? 'Aprendido' : 'Aprendi'; $('i', btn).className = on ? 'fas fa-circle-check' : 'far fa-circle-check'; };
        paint();
        btn.addEventListener('click', () => {
            if (P.learned.includes(term)) { P.learned = P.learned.filter(x => x !== term); save(); renderStats(); }
            else { P.learned.push(term); addXP(5, 'termo aprendido'); }
            paint();
        });
    });

    // ---------- Quiz ----------
    let round = null, idx = 0, score = 0, correctCount = 0, answered = false;

    async function api(action, data) {
        const opt = data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {};
        const r = await fetch(`${API}?action=${action}`, opt);
        let j; try { j = await r.json(); } catch (e) { throw new Error('Servidor do quiz indisponível. Tente novamente mais tarde.'); }
        if (!j.ok) throw new Error(j.error || 'Erro inesperado');
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
            err.textContent = 'Escolha um apelido de 2 a 20 caracteres (letras, números, espaço, ponto, hífen ou _).'; err.hidden = false;
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
            if (/apelido/i.test(e.message)) { input.setAttribute('aria-invalid', 'true'); input.focus(); input.select(); }
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
        $('#fl-qtype').textContent = q.tipo;
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
            $('#fl-feedback-title').textContent = r.correct ? 'Resposta correta!' : 'Resposta incorreta';
            $('#fl-feedback-pts').textContent = r.correct ? `+${r.points}${r.bonus ? ` (bônus ${r.bonus})` : ''}` : '';
            $('#fl-feedback-text').innerHTML = fmt(r.explanation);
            const ref = $('#fl-feedback-ref'); ref.hidden = !r.ref; if (r.ref) ref.href = r.ref;
            $('#fl-feedback-report').href = reportLink(round.questions[idx]);
            $('#fl-next').innerHTML = r.done ? 'Ver resultado <i class="fas fa-flag-checkered"></i>' : 'Continuar <i class="fas fa-arrow-right"></i>';
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
        $('#fl-end-correct').parentNode.lastChild.textContent = `/${round.total} acertos`;
        const pct = correctCount / round.total;
        $('#fl-end-icon').textContent = pct >= .9 ? '🏆' : pct >= .6 ? '🍄' : '🌱';
        $('#fl-end-title').textContent = pct >= .9 ? 'Excelente desempenho, micologista!' : pct >= .6 ? 'Muito bom resultado!' : 'Continue praticando!';
        const msg = $('#fl-rank-msg'), err = $('#fl-submit-error');
        msg.textContent = 'Registrando no ranking…'; msg.hidden = false; err.hidden = true;
        show('#fl-quiz-end');
        addXP(Math.round(score / 10), 'rodada concluída');
        submitScore();
    }

    // A pontuação entra no ranking automaticamente com o apelido escolhido no início
    async function submitScore() {
        const msg = $('#fl-rank-msg'), err = $('#fl-submit-error');
        try {
            const r = await api('submit', { sid: round.sid });
            msg.textContent = r.isBest
                ? `🎉 ${P.name}, você está em ${r.rank}º lugar no ranking geral (de ${r.players} ${r.players === 1 ? 'jogador' : 'jogadores'})!`
                : `Pontuação registrada, ${P.name}. Seu recorde (${r.best} pts) segue em ${r.rank}º lugar.`;
        } catch (ex) { msg.hidden = true; err.textContent = 'Não foi possível registrar no ranking: ' + ex.message; err.hidden = false; }
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
        ol.innerHTML = '<li class="fl-muted">Carregando…</li>';
        try {
            const r = await api('leaderboard&period=' + period);
            if (!r.top.length) { ol.innerHTML = '<li class="fl-muted">Ninguém jogou ainda neste período. Seja o primeiro!</li>'; return; }
            const medal = ['🥇', '🥈', '🥉'];
            ol.innerHTML = r.top.map((e, i) => `
                <li class="${P.name && e.name.toLowerCase() === P.name.toLowerCase() ? 'me' : ''}">
                    <span class="pos">${medal[i] || i + 1}</span>
                    <span class="name">${esc(e.name)}<small>${e.correct}/${e.total} acertos · ${e.secs}s · ${new Date(e.ts * 1000).toLocaleDateString('pt-BR')}</small></span>
                    <span class="pts">${e.score}</span>
                </li>`).join('');
        } catch (e) { ol.innerHTML = `<li class="fl-muted">${esc(e.message)}</li>`; }
    }
    $$('.fl-rank-period button').forEach(b => b.addEventListener('click', () => {
        $$('.fl-rank-period button').forEach(x => x.classList.remove('active')); b.classList.add('active');
        period = b.dataset.period; loadRanking();
    }));

    // ---------- Início ----------
    renderStats();
    const h = location.hash.replace('#', '');
    if (h.startsWith('termo-')) {
        const t = document.getElementById(h);
        if (t) { setTimeout(() => { t.scrollIntoView({ block: 'center' }); t.classList.add('flash'); }, 300); }
    } else if (['quiz', 'ranking', 'glossario'].includes(h)) showTab(h);
})();
