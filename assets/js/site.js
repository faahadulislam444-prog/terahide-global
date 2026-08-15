// ===================== TERRAHIDE GLOBAL — shared behavior =====================
document.addEventListener('DOMContentLoaded', () => {

  // Page loader
  const loader = document.getElementById('page-loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('loaded'), 200);
    });
    // fallback in case load already fired
    setTimeout(() => loader.classList.add('loaded'), 1200);
  }

  // Scroll progress bar
  const bar = document.getElementById('scroll-progress');
  const nav = document.getElementById('site-nav');
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (bar) bar.style.width = scrolled + '%';
    if (nav) nav.classList.toggle('scrolled', h.scrollTop > 12);
    const btt = document.getElementById('back-to-top');
    if (btt) btt.classList.toggle('show', h.scrollTop > 500);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.add('open'));
  }
  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => mobileMenu.classList.remove('open'));
  }
  document.querySelectorAll('#mobile-menu a').forEach(a => {
    a.addEventListener('click', () => mobileMenu && mobileMenu.classList.remove('open'));
  });

  // Back to top
  const btt = document.getElementById('back-to-top');
  if (btt) {
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Reveal on scroll (Intersection Observer)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger, .tl-line')
    .forEach(el => io.observe(el));

  // Counter animation
  const counters = document.querySelectorAll('[data-counter]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      const dur = 1800;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = val.toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(decimals) + suffix;
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => countIO.observe(c));

  // Accordion (used on Environment / About / Contact FAQ)
  document.querySelectorAll('.acc-item').forEach(item => {
    const trigger = item.querySelector('.acc-trigger');
    const panel = item.querySelector('.acc-panel');
    if (!trigger || !panel) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.acc-item').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.acc-panel').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // Simple lightweight carousel (Showrooms / gallery strips)
  document.querySelectorAll('[data-carousel]').forEach(car => {
    const track = car.querySelector('[data-track]');
    const prev = car.querySelector('[data-prev]');
    const next = car.querySelector('[data-next]');
    if (!track) return;
    const scrollAmt = () => car.clientWidth * 0.85;
    prev && prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmt(), behavior: 'smooth' }));
    next && next.addEventListener('click', () => track.scrollBy({ left: scrollAmt(), behavior: 'smooth' }));
  });

  // Filter tabs (Products page)
  const filterBtns = document.querySelectorAll('[data-filter]');
  const filterItems = document.querySelectorAll('[data-category]');
  if (filterBtns.length && filterItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('bg-[var(--th-ink)]', 'text-white'));
        btn.classList.add('bg-[var(--th-ink)]', 'text-white');
        const val = btn.dataset.filter;
        filterItems.forEach(item => {
          const show = val === 'all' || item.dataset.category === val;
          item.style.display = show ? '' : 'none';
          if (show) {
            item.classList.remove('is-visible');
            requestAnimationFrame(() => requestAnimationFrame(() => item.classList.add('is-visible')));
          }
        });
      });
    });
  }

  // Contact form (demo only — no backend)
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        document.getElementById('form-success')?.classList.remove('hidden');
        form.reset();
        btn.innerHTML = original;
        btn.disabled = false;
      }, 1200);
    });
  }

  // Sample swatch "add to samples" micro-interaction
  document.querySelectorAll('[data-sample-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.querySelector('span');
      const original = label ? label.textContent : null;
      btn.classList.add('scale-95');
      if (label) label.textContent = 'Added ✓';
      setTimeout(() => {
        btn.classList.remove('scale-95');
        if (label && original) label.textContent = original;
      }, 1400);
    });
  });

  // Active nav link highlight based on current page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) link.classList.add('active');
  });

  // ============ 3D tilt cards ============
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (px * 14) + 'deg');
      card.style.setProperty('--rx', (py * -14) + 'deg');
      card.style.setProperty('--tz', '10px');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--tz', '0px');
    });
  });

  // ============ Magnetic buttons ============
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.35;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });

  // ============ Cursor-follow grain glow (desktop only) ============
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.getElementById('cursor-glow');
    if (glow) {
      let raf = null;
      document.addEventListener('pointermove', (e) => {
        glow.classList.add('active');
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          glow.style.left = e.clientX + 'px';
          glow.style.top = e.clientY + 'px';
        });
      });
      document.addEventListener('pointerleave', () => glow.classList.remove('active'));
    }
  }

  // ============ Before/after compare slider ============
  document.querySelectorAll('[data-compare]').forEach(wrap => {
    const handle = wrap.querySelector('.compare-handle');
    if (!handle) return;
    let dragging = false;
    const setReveal = (clientX) => {
      const r = wrap.getBoundingClientRect();
      let pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      wrap.style.setProperty('--reveal', (100 - pct) + '%');
      handle.style.left = pct + '%';
    };
    handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); });
    handle.addEventListener('pointermove', (e) => { if (dragging) setReveal(e.clientX); });
    handle.addEventListener('pointerup', () => dragging = false);
    wrap.addEventListener('pointerdown', (e) => { dragging = true; setReveal(e.clientX); });
    wrap.addEventListener('pointermove', (e) => { if (dragging) setReveal(e.clientX); });
    window.addEventListener('pointerup', () => dragging = false);
  });

  // ============ Split-text character reveal ============
  document.querySelectorAll('[data-split]').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    text.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.style.transitionDelay = (i * 0.03) + 's';
      span.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(span);
    });
    const splitIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.split-char').forEach(s => s.classList.add('is-visible'));
          splitIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    splitIO.observe(el);
  });

  // ============ Route path draw + pin pulse (tannery network) ============
  const routeIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        routeIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.route-path, .route-dot').forEach(el => routeIO.observe(el));

  // ============ Swatch library: color/texture chip selection ============
  const chips = document.querySelectorAll('[data-chip]');
  const previewImg = document.getElementById('swatch-preview-img');
  const previewName = document.getElementById('swatch-preview-name');
  const previewDesc = document.getElementById('swatch-preview-desc');
  if (chips.length && previewImg) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        previewImg.style.opacity = 0;
        setTimeout(() => {
          previewImg.src = chip.dataset.img;
          previewImg.style.opacity = 1;
        }, 200);
        if (previewName) previewName.textContent = chip.dataset.name || '';
        if (previewDesc) previewDesc.textContent = chip.dataset.desc || '';
      });
    });
  }

  // ============ Drag-to-scroll horizontal strips ============
  document.querySelectorAll('.drag-scroll').forEach(el => {
    let isDown = false, startX, scrollLeft;
    el.addEventListener('pointerdown', (e) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });
    el.addEventListener('pointerleave', () => isDown = false);
    el.addEventListener('pointerup', () => isDown = false);
    el.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
  });

  // ============ Tannery network filter (region pills) ============
  const regionBtns = document.querySelectorAll('[data-region]');
  const regionItems = document.querySelectorAll('[data-region-tag]');
  if (regionBtns.length && regionItems.length) {
    regionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        regionBtns.forEach(b => b.classList.remove('bg-[var(--th-ink)]', 'text-white'));
        btn.classList.add('bg-[var(--th-ink)]', 'text-white');
        const val = btn.dataset.region;
        regionItems.forEach(item => {
          const show = val === 'all' || item.dataset.regionTag === val;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // ============ Hero image carousel ============
  document.querySelectorAll('[data-hero-carousel]').forEach(carousel => {
    const slides = carousel.querySelectorAll('.hero-slide');
    const dots = carousel.querySelectorAll('[data-hero-goto]');
    const ring = carousel.querySelector('[data-hero-ring]');
    const prevBtn = carousel.querySelector('[data-hero-prev]');
    const nextBtn = carousel.querySelector('[data-hero-next]');
    if (!slides.length) return;

    let current = 0;
    let autoplayTimer = null;
    let ringStart = null;
    const DURATION = 5000;
    const RING_CIRCUMFERENCE = 88;

    const goTo = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      restartAutoplay();
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    const animateRing = (timestamp) => {
      if (!ringStart) ringStart = timestamp;
      const elapsed = timestamp - ringStart;
      const pct = Math.min(elapsed / DURATION, 1);
      if (ring) ring.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - pct);
      if (pct < 1) {
        autoplayTimer = requestAnimationFrame(animateRing);
      } else {
        next();
      }
    };

    const restartAutoplay = () => {
      if (autoplayTimer) cancelAnimationFrame(autoplayTimer);
      ringStart = null;
      if (ring) ring.style.strokeDashoffset = RING_CIRCUMFERENCE;
      autoplayTimer = requestAnimationFrame(animateRing);
    };

    nextBtn && nextBtn.addEventListener('click', next);
    prevBtn && prevBtn.addEventListener('click', prev);
    dots.forEach(dot => {
      dot.addEventListener('click', () => goTo(parseInt(dot.dataset.heroGoto, 10)));
    });

    // Pause on hover, resume on leave
    carousel.addEventListener('pointerenter', () => {
      if (autoplayTimer) cancelAnimationFrame(autoplayTimer);
    });
    carousel.addEventListener('pointerleave', () => restartAutoplay());

    // Swipe support
    let touchStartX = null;
    carousel.addEventListener('pointerdown', (e) => { touchStartX = e.clientX; });
    carousel.addEventListener('pointerup', (e) => {
      if (touchStartX === null) return;
      const delta = e.clientX - touchStartX;
      if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
      touchStartX = null;
    });

    restartAutoplay();
  });

});
