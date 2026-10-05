document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navOverlay = document.querySelector('.nav-overlay');
const navLinks = navMenu ? navMenu.querySelectorAll('.nav-links a') : [];
const navSections = [...navLinks].map(a => document.querySelector(a.getAttribute('href')));

if (navToggle && navMenu && navOverlay) {

function setMenu(abierto) {
    navToggle.setAttribute('aria-expanded', String(abierto));
    navToggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    navMenu.classList.toggle('abierto', abierto);
    document.body.classList.toggle('menu-abierto', abierto);
    navOverlay.hidden = !abierto;
    requestAnimationFrame(() => navOverlay.classList.toggle('visible', abierto));
}

navToggle.addEventListener('click', () => {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
});

const headerQuery = window.matchMedia('(max-width: 600px)');
const syncOverlay = () => {
    navOverlay.style.top = getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h').trim();
};
syncOverlay();
headerQuery.addEventListener('change', syncOverlay);

navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));

navOverlay.addEventListener('click', () => setMenu(false));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
    }
});

const mobileQuery = window.matchMedia('(min-width: 601px)');
mobileQuery.addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
});

}

function marcarActivo() {
    const mitad = window.scrollY + window.innerHeight / 2;
    let actual = -1;
    navSections.forEach((s, i) => {
        if (s && s.offsetTop <= mitad) actual = i;
    });
    navLinks.forEach((a, i) => {
        const esActiva = i === actual;
        a.classList.toggle('activo', esActiva);
        if (esActiva) {
            a.setAttribute('aria-current', 'true');
        } else {
            a.removeAttribute('aria-current');
        }
    });
}

const header = document.querySelector('header');
const retroGrid = document.querySelector('.retro-grid');

let ticking = false;

function onScroll() {
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    if (retroGrid && !reduceMotion) {
        retroGrid.style.backgroundPosition = `0 ${window.scrollY * 0.15}px`;
    }

    marcarActivo();

    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(onScroll);
    }
}, { passive: true });

const revealables = document.querySelectorAll(
    '.skill-card, .proyecto-card, .evento-card, .cert-item, .social-link, .titulo-seccion'
);

if (!reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealables.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

marcarActivo();
