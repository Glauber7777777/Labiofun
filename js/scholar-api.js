/**
 * Scholar API Integration — Labiofun
 * Fetches real-time citation metrics from OpenAlex (open, no key required)
 * Author: https://openalex.org — CC0 License
 *
 * Data fetched: cited_by_count, h_index, i10_index, works_count
 * Target: Susana Frasés (PI), ORCID 0000-0001-5875-9886
 */

const SCHOLAR_CACHE_KEY = 'labiofun_openalex_v2';
const SCHOLAR_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// PI ORCID — change if needed
const PI_ORCID = '0000-0001-5875-9886';

// OpenAlex polite pool: add your email
const OPENALEX_MAILTO = 'labiofun@labiofun.com.br';

// ============================================================================
// Cache helpers
// ============================================================================
function getScholarCache() {
    try {
        const raw = localStorage.getItem(SCHOLAR_CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (Date.now() - data._ts > SCHOLAR_CACHE_TTL) {
            localStorage.removeItem(SCHOLAR_CACHE_KEY);
            return null;
        }
        return data;
    } catch (e) { return null; }
}

function setScholarCache(data) {
    try {
        localStorage.setItem(SCHOLAR_CACHE_KEY, JSON.stringify({ ...data, _ts: Date.now() }));
    } catch (e) { /* storage full or private mode */ }
}

// ============================================================================
// OpenAlex fetch
// ============================================================================
async function fetchOpenAlexAuthor(orcid) {
    const url = `https://api.openalex.org/authors/https://orcid.org/${orcid}?mailto=${OPENALEX_MAILTO}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`OpenAlex HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        clearTimeout(timeout);
        throw e;
    }
}

// ============================================================================
// DOM Updaters
// ============================================================================
function setCounterLoading(el, loading) {
    const item = el ? el.closest('.counter-item') : null;
    if (!item) return;
    if (loading) {
        item.classList.add('scholar-loading');
    } else {
        item.classList.remove('scholar-loading');
    }
}

function updateCitationsCounter(count) {
    const el = document.getElementById('counter-citations');
    if (!el) return;

    el.setAttribute('data-target', count);
    el.setAttribute('data-suffix', '+');
    setCounterLoading(el, false);

    // Use the shared animateCounter from main.js (exposed via window)
    if (typeof window.animateCounter === 'function') {
        window.animateCounter(el);
    } else {
        el.textContent = count.toLocaleString('pt-BR') + '+';
    }
}

function updateScholarBadges(metrics) {
    // h-index badge
    const hEl = document.getElementById('scholar-h-index');
    if (hEl && metrics.hIndex != null) hEl.textContent = metrics.hIndex;

    // i10-index badge
    const i10El = document.getElementById('scholar-i10');
    if (i10El && metrics.i10Index != null) i10El.textContent = metrics.i10Index;

    // Show the metrics bar with animation
    const bar = document.getElementById('scholar-metrics-bar');
    if (bar) {
        bar.classList.add('loaded');
    }

    // Update the "Publicações" counter if OpenAlex count is higher
    const worksEl = document.querySelector('.counter-number[data-target="168"]');
    if (worksEl && metrics.worksCount > 168) {
        worksEl.setAttribute('data-target', metrics.worksCount);
    }
}

// ============================================================================
// Main entry point
// ============================================================================
async function initScholarMetrics() {
    const citEl = document.getElementById('counter-citations');
    if (!citEl) return; // Section not present

    // Show loading state
    setCounterLoading(citEl, true);
    citEl.textContent = '···';

    // 1. Check cache
    const cached = getScholarCache();
    if (cached) {
        updateCitationsCounter(cached.citedByCount);
        updateScholarBadges(cached);
        return;
    }

    // 2. Fetch from OpenAlex
    try {
        const author = await fetchOpenAlexAuthor(PI_ORCID);

        const metrics = {
            citedByCount: author.cited_by_count ?? 0,
            worksCount:   author.works_count ?? 0,
            hIndex:       author.summary_stats?.h_index ?? null,
            i10Index:     author.summary_stats?.i10_index ?? null,
            updatedDate:  author.updated_date ?? null,
        };

        setScholarCache(metrics);
        updateCitationsCounter(metrics.citedByCount);
        updateScholarBadges(metrics);

    } catch (err) {
        console.warn('[Scholar API] Unavailable, using fallback.', err.message);
        // Graceful fallback: hide loading, show dash
        setCounterLoading(citEl, false);
        citEl.textContent = '—';

        const bar = document.getElementById('scholar-metrics-bar');
        if (bar) bar.style.display = 'none';
    }
}

// Run after DOM + deferred scripts
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initScholarMetrics, 400));
} else {
    setTimeout(initScholarMetrics, 400);
}
