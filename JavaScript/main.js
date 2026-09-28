// Marca que JS está disponible (evita que el contenido quede oculto sin JS)
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- MENU HAMBURGUESA --- */
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navOverlay = document.querySelector('.nav-overlay');
const navLinks = navMenu.querySelectorAll('.nav-links a');
const navSections = [...navLinks].map(a => document.querySelector(a.getAttribute('href')));

function setMenu(abierto) {
    navToggle.setAttribute('aria-expanded', String(abierto));
    navToggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    navMenu.classList.toggle('abierto', abierto);
    document.body.classList.toggle('menu-abierto', abierto);
    navOverlay.hidden = !abierto;
    // El overlay solo existe para tapar; si se oculta, opacity no lo apaga.
    requestAnimationFrame(() => navOverlay.classList.toggle('visible', abierto));
}

navToggle.addEventListener('click', () => {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
});

// El overlay arranca en top:0 y tapaba el header entero, dejando el logo
// apagado y el boton de cerrar sin poder pulsarse. Se deja fuera la franja
// del header, que es justo lo que hay que mantener accesible.
// El alto del header cambia con el breakpoint, asi que se recalcula al rotar.
const headerQuery = window.matchMedia('(max-width: 600px)');
const syncOverlay = () => {
    navOverlay.style.top = getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h').trim();
};
syncOverlay();
headerQuery.addEventListener('change', syncOverlay);

// Un link navega: cierra el menu para no dejar el overlay sobre el destino.
navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));

navOverlay.addEventListener('click', () => setMenu(false));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
    }
});

// Si se abre el menu y se pasa a desktop, el panel fixed quedaria pegado a la
// derecha. Al volver a movil tiene que quedar cerrado.
const mobileQuery = window.matchMedia('(min-width: 601px)');
mobileQuery.addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
});

// Marca en el menu la seccion que se esta viendo.
function marcarActivo() {
    const mitad = window.scrollY + window.innerHeight / 2;
    let actual = -1;
    navSections.forEach((s, i) => {
        if (s && s.offsetTop <= mitad) actual = i;
    });
    navLinks.forEach((a, i) => a.classList.toggle('activo', i === actual));
}

// Efecto de scroll en el header
const header = document.querySelector('header');
const retroGrid = document.querySelector('.retro-grid');

// Un solo listener con requestAnimationFrame. Antes había dos scroll listeners
// sueltos: en móvil cada gesto dispara layout y paint de las capas fijas
// (blur del header, grid con perspective) y el scroll se engancha.
let ticking = false;

function onScroll() {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
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

// Elementos que se animan al entrar en viewport (estilo Detroit Become Human)
const revealables = document.querySelectorAll(
    '.skill-card, .proyecto-card, .evento-card, .cert-item, .titulo-seccion'
);

// Con movimiento reducido no hay animación de entrada: si se aplicara igual,
// el contenido se quedaría en opacity 0 hasta que el observer lo disparara.
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
