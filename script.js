/**
 * Mohamed Hesham - Machine Learning & AI Engineer Portfolio
 * Pure JavaScript (ES6+) Architecture
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Management (Dark & Light Mode)
  initTheme();

  // 2. Interactive Canvas Particles Background
  initBackgroundCanvas();

  // 3. Custom Cursor & Mouse Glow (Desktop only)
  initCustomCursor();

  // 4. Scroll Reveal Animations & Number Counters
  initScrollAnimations();

  // 5. Navigation Bar & Active Spy & Mobile Menu
  initNavigation();

  // 6. Contact Form Validation & Submission Handling
  initContactForm();

  // 7. Dynamic Footer Year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ==========================================================================
   1. THEME SWITCHER (Dark & Light Mode)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;
  const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

  // Retrieve saved preference or default to dark
  const savedTheme = localStorage.getItem('mh_portfolio_theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('mh_portfolio_theme', theme);

    if (themeIcon) {
      if (theme === 'light') {
        themeIcon.className = 'fa-solid fa-sun';
      } else {
        themeIcon.className = 'fa-solid fa-moon';
      }
    }

    // Dispatch custom event for canvas color sync
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }
}

/* ==========================================================================
   2. INTERACTIVE PARTICLES CANVAS BACKGROUND
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let mouse = { x: null, y: null, radius: 140 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  });

  // Color scheme mappings
  function getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      particle: isDark ? 'rgba(183, 216, 148, 0.55)' : 'rgba(250, 129, 18, 0.45)',
      line: isDark ? 'rgba(183, 216, 148, ' : 'rgba(250, 129, 18, ',
    };
  }

  let colors = getThemeColors();
  window.addEventListener('themeChanged', () => {
    colors = getThemeColors();
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around screen boundaries
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const maxDistance = 25;
          this.x -= (dx / dist) * force * maxDistance * 0.1;
          this.y -= (dy / dist) * force * maxDistance * 0.1;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = colors.particle;
      ctx.fill();
    }
  }

  let particles = [];
  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 16000), 85);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }
  createParticles();

  function connectParticles() {
    const maxDist = 115;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `${colors.line}${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connectParticles();

    requestAnimationFrame(animate);
  }
  animate();
}

/* ==========================================================================
   3. CUSTOM CURSOR & MOUSE GLOW
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const glow = document.getElementById('cursorGlow');
  if (!dot || !glow) return;

  // Disable on mobile/touch screens
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = -100, mouseY = -100;
  let glowX = -100, glowY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Smooth lerp trailing glow
  function renderGlow() {
    glowX += (mouseX - glowX) * 0.16;
    glowY += (mouseY - glowY) * 0.16;
    glow.style.transform = `translate(${glowX}px, ${glowY}px)`;
    requestAnimationFrame(renderGlow);
  }
  renderGlow();

  // Hover expansion on interactive elements
  const hoverables = document.querySelectorAll('a, button, input, textarea, .card-interactive, .social-chip');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      glow.style.width = '64px';
      glow.style.height = '64px';
      glow.style.borderColor = 'var(--accent-glow)';
    });
    el.addEventListener('mouseleave', () => {
      glow.style.width = '44px';
      glow.style.height = '44px';
      glow.style.borderColor = 'var(--accent-primary)';
    });
  });
}

/* ==========================================================================
   4. SCROLL REVEAL & NUMBER COUNTERS
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');

          // If entry has skill progress bars, animate them
          const progressBars = entry.target.querySelectorAll('.progress-fill');
          progressBars.forEach((bar) => bar.classList.add('animated'));

          // If entry has stat counters, count up
          const counters = entry.target.querySelectorAll('.stat-num');
          counters.forEach((counter) => animateCounter(counter));

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  function animateCounter(counter) {
    const target = +counter.getAttribute('data-count');
    const duration = 1600;
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quartic
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeProgress * target);

      counter.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        counter.textContent = target;
      }
    }

    requestAnimationFrame(updateCount);
  }
}

/* ==========================================================================
   5. NAVIGATION & SCROLL SPY & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close on navigation link click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // Active section scroll spy
  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   6. CONTACT FORM HANDLING
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  if (!form || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      feedback.textContent = 'Please fill out all required fields (*).';
      feedback.className = 'form-feedback error';
      return;
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      feedback.textContent = 'Please enter a valid email address.';
      feedback.className = 'form-feedback error';
      return;
    }

    // Submit state animation
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();

      feedback.textContent = 'Thank you, Mohamed Hesham has received your message!';
      feedback.className = 'form-feedback success';

      setTimeout(() => {
        feedback.style.display = 'none';
        feedback.className = 'form-feedback';
      }, 5000);
    }, 1200);
  });
}

