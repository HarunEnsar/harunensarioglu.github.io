/* Main JavaScript — Navigation, Scroll, Typing, i18n */
(function() {
  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  const scrollTop = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    scrollTop.classList.toggle('visible', window.scrollY > 400);
  });

  // Scroll to top
  scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });

  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => observer.observe(el));

  // Active nav link highlight
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute('id');
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });

  // Typing effect
  const titles = ['Robotic Software Developer', 'AI & Computer Vision', 'Humanoid & Quadruped Robotics', 'ROS / Isaac Sim / Gazebo'];
  const el = document.getElementById('typingText');
  if (el) {
    let ti = 0, ci = 0, deleting = false;
    function type() {
      const word = titles[ti];
      if (!deleting) {
        el.textContent = word.substring(0, ci + 1);
        ci++;
        if (ci === word.length) { deleting = true; setTimeout(type, 2000); return; }
        setTimeout(type, 80);
      } else {
        el.textContent = word.substring(0, ci - 1);
        ci--;
        if (ci === 0) { deleting = false; ti = (ti + 1) % titles.length; setTimeout(type, 400); return; }
        setTimeout(type, 40);
      }
    }
    setTimeout(type, 1000);
  }

  // Language toggle
  const langBtns = document.querySelectorAll('.lang-btn');
  const cvBtn = document.querySelector('a[download]');
  const cvFiles = {
    tr: 'Harun_Ensarioglu_CV_TR.pdf',
    en: 'Harun_Ensarioglu_CV_EN.pdf'
  };

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.dataset.lang;

      // Update all translatable text
      document.querySelectorAll('[data-tr][data-en]').forEach(el => {
        el.innerHTML = el.dataset[lang];
      });

      // Update CV download link to match selected language
      if (cvBtn && cvFiles[lang]) {
        cvBtn.href = cvFiles[lang];
      }
    });
  });
})();
