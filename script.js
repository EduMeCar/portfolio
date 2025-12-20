// ===== SISTEMA DE IDIOMAS =====
const langBtns = document.querySelectorAll(".lang-btn");let currentLang = "es";

function setLanguage(lang) {
  currentLang = lang;
  
  // Actualizar botones activos
  langBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
    btn.setAttribute("aria-pressed", btn.dataset.lang === lang);
  });
  
  // Actualizar contenido traducible
  document.querySelectorAll("[data-es]").forEach(element => {
    const translation = element.getAttribute(`data-${lang}`);
    if (translation) {
      element.innerHTML = translation;
    }
  });
  
  // Actualizar aria-labels dinámicos
  updateAriaLabels(lang);
  
  // Actualizar atributo lang del documento
  document.documentElement.lang = lang;
  
  // Guardar preferencia (opcional)
  localStorage.setItem('preferredLang', lang);
}

function updateAriaLabels(lang) {
  const labels = {
    es: {
      booking: "Ver planes de booking",
      email: "Enviar correo electrónico",
      linkedin: "Ver perfil de LinkedIn",
      whatsapp: "Contactar por WhatsApp"
    },
    en: {
      booking: "View booking plans",
      email: "Send email",
      linkedin: "View LinkedIn profile",
      whatsapp: "Contact via WhatsApp"
    }
  };
  
  document.querySelector('a[href*="Book"]')?.setAttribute('aria-label', labels[lang].booking);
  document.querySelector('a[href^="mailto:"]')?.setAttribute('aria-label', labels[lang].email);
  document.querySelector('a[href*="linkedin"]')?.setAttribute('aria-label', labels[lang].linkedin);
  document.querySelector('.whatsapp')?.setAttribute('aria-label', labels[lang].whatsapp);
}

// Event listeners para botones de idioma
langBtns.forEach(btn => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

// Detectar idioma del navegador al cargar
const browserLang = navigator.language.split('-')[0];
const savedLang = localStorage.getItem('preferredLang');
setLanguage(savedLang || (browserLang === 'en' ? 'en' : 'es'));

// ===== GALERÍA DE VIDEOS =====
const videos = [
  { id: "SD3T_Or_mvk", title: "Video 1" },
  { id: "2HmVZI4MfkM", title: "Video 2" },
  { id: "XCW95zjBUK4", title: "Video 3" },
  { id: "DEjjE4Mv2yQ", title: "Video 4" },
  { id: "lJE19BWmbGY", title: "Video 5" },
  { id: "dynmB6dCvKw", title: "Video 6" },
  { id: "oglT_tl7TkU", title: "Video 7" }
];

const videoFrame = document.getElementById("videoFrame");
const videoSelector = document.getElementById("videoSelector");

videos.forEach((video, index) => {
  const thumb = document.createElement("div");
  thumb.className = `video-thumb${index === 0 ? " active" : ""}`;
  thumb.setAttribute('role', 'button');
  thumb.setAttribute('tabindex', '0');
  thumb.setAttribute('aria-label', `Cargar ${video.title}`);
  
  thumb.innerHTML = `<img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" alt="${video.title}" loading="lazy">`;
  
  const loadVideo = () => {
    videoFrame.src = `https://www.youtube.com/embed/${video.id}?rel=0&autoplay=1`;
    document.querySelectorAll(".video-thumb").forEach(t => t.classList.remove("active"));
    thumb.classList.add("active");
  };
  
  thumb.addEventListener("click", loadVideo);
  thumb.addEventListener("keypress", (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      loadVideo();
    }
  });
  
  videoSelector.appendChild(thumb);
});

// ===== BOTÓN SCROLL TO TOP =====
const scrollBtn = document.querySelector(".scroll-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    scrollBtn.classList.add("visible");
  } else {
    scrollBtn.classList.remove("visible");
  }
}, { passive: true });

// ===== EFECTO GLITCH EN NOMBRE =====
const heroName = document.querySelector(".hero-name");

if (heroName) {
  heroName.addEventListener("mouseenter", () => {
    // Respeta prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    heroName.style.transform = "translate(2px, 2px)";
    setTimeout(() => heroName.style.transform = "translate(0, 0)", 100);
    setTimeout(() => heroName.style.transform = "translate(-1px, 1px)", 150);
    setTimeout(() => heroName.style.transform = "translate(0, 0)", 200);
  });
}

// ===== OPTIMIZACIÓN DE SOMBRAS EN SCROLL =====
let ticking = false;

function updateShadows() {
  const scrolled = window.pageYOffset;
  const factor = scrolled * 0.01;
  
  document.querySelectorAll(".service-card, .stat, .spotify-player, .video-main, .c-link, .hero-subtitle").forEach(el => {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
      const shadowSize = Math.max(4, 12 - factor * 0.5);
      const color = getComputedStyle(el).color;
      el.style.boxShadow = `${shadowSize}px ${shadowSize}px 0 ${color}`;
    }
  });
  
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateShadows);
    ticking = true;
  }
}, { passive: true });

updateShadows();

// ===== LAZY LOAD SPOTIFY =====
const spotifyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const iframe = entry.target.querySelector('iframe');
      if (iframe && !iframe.src) {
        iframe.src = iframe.dataset.src;
      }
      spotifyObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '50px' });

const spotifyContainer = document.querySelector('.spotify-player');
if (spotifyContainer) {
  spotifyObserver.observe(spotifyContainer);
}

// ===== ANALYTICS (Si decides implementar) =====
// function trackEvent(category, action, label) {
//   if (typeof gtag !== 'undefined') {
//     gtag('event', action, {
//       'event_category': category,
//       'event_label': label
//     });
//   }
// }

// Ejemplo de uso:
// document.querySelector('a[href*="Book"]')?.addEventListener('click', () => {
//   trackEvent('Contact', 'Click', 'Booking Plans');
// });

console.log('✅ Eduardo Mejía Portfolio JS cargado correctamente');
