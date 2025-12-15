/* ========================================
   PORTFOLIO EDUARDO MEJÍA - script.js
   Versión optimizada y separada
   ======================================== */

// === SISTEMA DE IDIOMAS BRUTALISTA ===
const langBtns = document.querySelectorAll('.lang-btn');
let currentLang = 'es';

function setLanguage(lang) {
  currentLang = lang;
  
  // Actualizar botones
  langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  // Actualizar elementos traducibles
  document.querySelectorAll('[data-es]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) {
      el.innerHTML = text;
    }
  });
  
  // Actualizar atributo lang del html
  document.documentElement.lang = lang;
}

langBtns.forEach(btn => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

// === SELECTOR DE VIDEOS ACTUALIZADO ===
const videos = [
  { id: "ZGxSXchZNfo" },//BOILERROOM
  { id: "2HmVZI4MfkM" },//MUNDODIFERENTE
  { id: "XCW95zjBUK4" },//HABITOS
  { id: "DEjjE4Mv2yQ" },//EDC
  { id: "lJE19BWmbGY" },//JALA
  { id: "dynmB6dCvKw" },//AGAVE
  { id: "oglT_tl7TkU" }//VIBRAS
   
];

const videoFrame = document.getElementById('videoFrame');
const videoSelector = document.getElementById('videoSelector');

videos.forEach((v, i) => {
  const thumb = document.createElement('div');
  thumb.className = `video-thumb${i === 0 ? ' active' : ''}`;
  thumb.innerHTML = `<img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="Video ${i + 1}">`;
  
  thumb.addEventListener('click', () => {
    videoFrame.src = `https://www.youtube.com/embed/${v.id}?rel=0&autoplay=1`;
    document.querySelectorAll('.video-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  });
  
  videoSelector.appendChild(thumb);
});

// === SCROLL TO TOP BUTTON ===
const scrollBtn = document.querySelector('.scroll-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollBtn.classList.add('visible');
  } else {
    scrollBtn.classList.remove('visible');
  }
});

// === GLITCH EFFECT EN HERO ===
const heroName = document.querySelector('.hero-name');

heroName.addEventListener('mouseenter', () => {
  heroName.style.transform = 'translate(2px, 2px)';
  setTimeout(() => {
    heroName.style.transform = 'translate(0, 0)';
  }, 100);
  setTimeout(() => {
    heroName.style.transform = 'translate(-1px, 1px)';
  }, 150);
  setTimeout(() => {
    heroName.style.transform = 'translate(0, 0)';
  }, 200);
});

// === EFECTO DE SOMBRAS AL SCROLL MEJORADO ===
let ticking = false;

function updateShadows() {
  const scrolled = window.pageYOffset;
  const rate = scrolled * 0.01;
  
  document.querySelectorAll('.service-card, .stat, .spotify-player, .video-main, .c-link, .hero-subtitle').forEach(el => {
    const rect = el.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isInViewport) {
      const shadowOffset = Math.max(4, 12 - (rate * 0.5));
      const currentColor = getComputedStyle(el).color;
      el.style.boxShadow = `${shadowOffset}px ${shadowOffset}px 0 ${currentColor}`;
    }
  });
  
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateShadows);
    ticking = true;
  }
});

// Inicializar sombras
updateShadows();
