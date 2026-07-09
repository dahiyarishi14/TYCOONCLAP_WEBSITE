// Tycoon Clap — GSAP motion layer (illustration edition)
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

  gsap.utils.toArray('.fade-in-up').forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 22 });
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 + i * 0.1 });
  });

  // Generic reveal (fade + rise) on scroll
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 26 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  gsap.utils.toArray('.reveal-scale').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, scale: 0.94, y: 18 }, {
      opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // Floating icons — gentle idle bob, staggered
  gsap.utils.toArray('.float-icon').forEach((el, i) => {
    gsap.to(el, {
      y: '+=14', duration: 2 + (i % 3) * 0.4, ease: 'sine.inOut',
      yoyo: true, repeat: -1, delay: i * 0.2
    });
  });

  // Bar charts — grow up from baseline, staggered, on scroll into view
  gsap.utils.toArray('.service-scene, .hero').forEach((scene) => {
    const bars = scene.querySelectorAll('.bar');
    if (bars.length) {
      const heights = [60, 90, 120, 150];
      bars.forEach((bar, i) => {
        const h = heights[i] || 80;
        gsap.set(bar, { attr: { height: 0, y: 290 } });
        gsap.to(bar, {
          attr: { height: h, y: 290 - h },
          duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: scene, start: 'top 80%' },
          delay: i * 0.12
        });
      });
    }

    const heroBars = scene.querySelectorAll('.hero-bar');
    heroBars.forEach((bar, i) => {
      gsap.from(bar, {
        scaleY: 0, transformOrigin: 'bottom', duration: 0.7, ease: 'power2.out',
        delay: 1 + i * 0.1
      });
    });

    const arm = scene.querySelector('.char-arm');
    if (arm) {
      gsap.to(arm, {
        rotation: '+=8', transformOrigin: 'top center', duration: 1.1,
        ease: 'sine.inOut', yoyo: true, repeat: -1,
        scrollTrigger: { trigger: scene, start: 'top 80%' }
      });
    }

    const pie = scene.querySelector('.pie-arc');
    if (pie) {
      gsap.to(pie, {
        attr: { 'stroke-dasharray': '150 214' }, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: scene, start: 'top 80%' }
      });
    }

    const line = scene.querySelector('.line-chart');
    if (line) {
      gsap.to(line, {
        strokeDashoffset: 0, duration: 1.3, ease: 'power2.out',
        scrollTrigger: { trigger: scene, start: 'top 80%' }
      });
    }

    const minis = scene.querySelectorAll('.mini-bar');
    minis.forEach((bar, i) => {
      gsap.to(bar, {
        attr: { height: 55 - i * 12, y: 145 - (55 - i * 12) }, duration: 0.8,
        ease: 'power2.out', delay: 0.3 + i * 0.1,
        scrollTrigger: { trigger: scene, start: 'top 80%' }
      });
    });
  });

  // Scroll progress bar
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    const onProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onProgress, { passive: true });
    onProgress();
  }

  // Page header stagger (inner pages)
  const ph = document.querySelector('.page-header .wrap');
  if (ph) {
    gsap.from(ph.children, {
      opacity: 0, y: 22, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.1
    });
  }

});
