// ── 1. SECTION FADE-IN ON SCROLL ──────────────────────────────
const sections = document.querySelectorAll('.section');
const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            fadeObs.unobserve(e.target);
        }
    });
}, { threshold: 0.08 });
sections.forEach(s => fadeObs.observe(s));

// ── 2. HERO COUNTER ANIMATION ─────────────────────────────────
function animateCounter(el) {
    // Rispetta le preferenze di sistema per il ridotto movimento
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals ?? '0');
    const prefix = el.dataset.prefix ?? '';
    const suffix = el.dataset.suffix ?? '';

    if (prefersReducedMotion) {
        el.textContent = prefix + target.toFixed(decimals).replace('.', ',') + suffix;
        return;
    }

    const duration = 1400; // ms
    const startTs = performance.now();

    function ease(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
        const elapsed = now - startTs;
        const progress = Math.min(elapsed / duration, 1);
        const value = target * ease(progress);
        const formatted = value.toFixed(decimals).replace('.', ',');
        el.textContent = prefix + formatted + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

const heroMeta = document.querySelector('.hero-meta');
const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            document.querySelectorAll('.counter').forEach(el => {
                const idx = [...document.querySelectorAll('.counter')].indexOf(el);
                setTimeout(() => animateCounter(el), idx * 120);
            });
            counterObs.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });
if (heroMeta) counterObs.observe(heroMeta);

// ── 3. INTERSECTION OBSERVER PER LINK ATTIVI (Sostituisce Scroll) ─
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const activeId = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${activeId}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    });
}, {
    // Il margine sposta l'area di trigger verso la parte superiore/centrale dello schermo
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
});

// Osserva tutte le sezioni che hanno un id
document.querySelectorAll('.section[id]').forEach(sec => {
    navObserver.observe(sec);
});

// ── 4. PROGRESS BAR ───────────────────────────────────────────
const progressBar = document.getElementById('progress-bar');

function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct.toFixed(1) + '%';
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ── 5. BACK TO TOP ────────────────────────────────────────────
const backBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    backBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── 6. SECTION DIVIDERS FADE IN ───────────────────────────────
const dividers = document.querySelectorAll('.section-divider');
const dividerObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            dividerObs.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });

dividers.forEach(d => dividerObs.observe(d));

// ── 7. LOGICA DI CONDIVISIONE ─────────────────────────────────
const shareBtn = document.getElementById('share-btn');

// Mostra il tasto condividi insieme al back-to-top
window.addEventListener('scroll', () => {
    shareBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

shareBtn.addEventListener('click', async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Sistema Energetico Italiano — Stato dell\'Arte',
                text: 'Analisi delle infrastrutture e opportunità di innovazione energetica in Italia.',
                url: window.location.href,
            });
        } catch (err) {
            console.log('Condivisione annullata o fallita', err);
        }
    } else {
        // Fallback: Copia il link negli appunti se la Web Share API non è supportata
        navigator.clipboard.writeText(window.location.href);
        alert('Link copiato negli appunti!');
    }
});