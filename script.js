// ── 1. SECTION FADE-IN ON SCROLL
const sections = document.querySelectorAll('.section');
const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); }
    });
}, { threshold: 0.08 });
sections.forEach(s => fadeObs.observe(s));

// ── 2. HERO COUNTER ANIMATION
function animateCounter(el) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals ?? '0');
    const prefix = el.dataset.prefix ?? '';
    const suffix = el.dataset.suffix ?? '';
    if (prefersReducedMotion) { el.textContent = prefix + target.toFixed(decimals).replace('.', ',') + suffix; return; }
    const duration = 1400;
    const startTs = performance.now();
    function ease(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
    function tick(now) {
        const elapsed = now - startTs;
        const progress = Math.min(elapsed / duration, 1);
        const value = target * ease(progress);
        el.textContent = prefix + value.toFixed(decimals).replace('.', ',') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}
const heroMeta = document.querySelector('.hero-meta');
const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            document.querySelectorAll('.counter').forEach((el, idx) => {
                setTimeout(() => animateCounter(el), idx * 120);
            });
            counterObs.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });
if (heroMeta) counterObs.observe(heroMeta);

// ── 3. NAV ACTIVE LINK
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const activeId = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
            });
        }
    });
}, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
document.querySelectorAll('.section[id]').forEach(sec => navObserver.observe(sec));

// ── 4. PROGRESS BAR
const progressBar = document.getElementById('progress-bar');
function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0).toFixed(1) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ── 5. BACK TO TOP
const backBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => { backBtn.classList.toggle('visible', window.scrollY > 400); }, { passive: true });
backBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

// ── 6. SECTION DIVIDERS FADE IN
const dividers = document.querySelectorAll('.section-divider');
const dividerObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); dividerObs.unobserve(e.target); } });
}, { threshold: 0.5 });
dividers.forEach(d => dividerObs.observe(d));

// ── 7. SHARE BUTTON
const shareBtn = document.getElementById('share-btn');
window.addEventListener('scroll', () => { shareBtn.classList.toggle('visible', window.scrollY > 400); }, { passive: true });
shareBtn.addEventListener('click', async () => {
    if (navigator.share) {
        try { await navigator.share({ title: "Sistema Energetico Italiano — Stato dell'Arte", text: 'Analisi delle infrastrutture e opportunità di innovazione energetica in Italia.', url: window.location.href }); }
        catch (err) { console.log('Condivisione annullata', err); }
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copiato negli appunti!');
    }
});

// ── 8. SORTABLE TABLE
(function () {
    const table = document.getElementById('opp-table');
    if (!table) return;
    const headers = table.querySelectorAll('th[data-sort]');
    let currentSort = { column: null, direction: 'asc' };
    headers.forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
            currentSort = { column, direction };
            headers.forEach(h => h.classList.remove('sorted'));
            th.classList.add('sorted');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            rows.sort((a, b) => {
                if (column === 'problema') {
                    const aVal = a.querySelector('td strong').textContent.trim().toLowerCase();
                    const bVal = b.querySelector('td strong').textContent.trim().toLowerCase();
                    return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                } else {
                    const aVal = parseFloat(a.dataset[column] ?? 0);
                    const bVal = parseFloat(b.dataset[column] ?? 0);
                    return direction === 'asc' ? aVal - bVal : bVal - aVal;
                }
            });
            rows.forEach(row => tbody.appendChild(row));
        });
    });
})();