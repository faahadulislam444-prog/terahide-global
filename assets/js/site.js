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

  // Live hide-batch traceability ticker + modal
  const batchTrigger = document.querySelector('[data-batch-trigger]');
  if (batchTrigger) {
    const batchTextEl = batchTrigger.querySelector('[data-batch-text]');

    const batches = [
      {
        id: 'TH-2847', status: 'in transit', originFarm: 'Rio Grande do Sul, Brazil', tannery: 'Curtume Rosso, Brazil',
        tanneryDate: '12 Aug', qc: 'Chrome-free, passed', destination: 'Melbourne, Australia', step: 3
      },
      {
        id: 'TH-2851', status: 'at tannery', originFarm: 'Veneto, Italy', tannery: 'Conceria Fiorentina, Italy',
        tanneryDate: '18 Aug', qc: 'Pending', destination: 'Auckland, New Zealand', step: 1
      },
      {
        id: 'TH-2839', status: 'cleared customs', originFarm: 'Tamil Nadu, India', tannery: 'Chennai Leather Works, India',
        tanneryDate: '05 Aug', qc: 'Full-grain verified', destination: 'Sydney, Australia', step: 4
      },
      {
        id: 'TH-2856', status: 'in transit', originFarm: 'Rio Grande do Sul, Brazil', tannery: 'Curtume Rosso, Brazil',
        tanneryDate: '19 Aug', qc: 'Chrome-free, passed', destination: 'Auckland, New Zealand', step: 3
      },
    ];
    let activeBatch = batches[0];
    let i = 0;

    const rotate = () => {
      i = (i + 1) % batches.length;
      activeBatch = batches[i];
      batchTextEl.classList.add('ticker-out');
      setTimeout(() => {
        batchTextEl.textContent = `Batch #${activeBatch.id} · ${activeBatch.status}`;
        batchTextEl.classList.remove('ticker-out');
      }, 320);
    };
    setInterval(rotate, 4200);

    // Build modal once, reused for whichever batch is active on click
    const backdrop = document.createElement('div');
    backdrop.className = 'batch-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML = `
      <div class="batch-modal" style="position:relative;">
        <button class="batch-modal-close" data-batch-close aria-label="Close">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <span class="eyebrow" data-batch-modal-id>Batch #TH-2847</span>
        <h3 class="font-display text-2xl mt-3 mb-6">Hide traceability</h3>
        <div data-batch-steps></div>
      </div>`;
    document.body.appendChild(backdrop);
    const stepsEl = backdrop.querySelector('[data-batch-steps]');
    const idEl = backdrop.querySelector('[data-batch-modal-id]');

    const renderModal = (b) => {
      idEl.textContent = `Batch #${b.id}`;
      const steps = [
        { label: 'Farm origin', detail: b.originFarm },
        { label: 'Tannery received', detail: `${b.tannery} · ${b.tanneryDate}` },
        { label: 'Quality control', detail: b.qc },
        { label: 'In transit', detail: `Destination: ${b.destination}` },
        { label: 'Delivered', detail: b.destination },
      ];
      stepsEl.innerHTML = steps.map((s, idx) => {
        const state = idx < b.step ? 'done' : idx === b.step ? 'current' : 'pending';
        return `<div class="batch-trace-step ${state}">
          <span class="batch-trace-dot"></span>
          <p class="text-sm font-semibold text-ink">${s.label}</p>
          <p class="text-xs text-ink-soft mt-0.5">${s.detail}</p>
        </div>`;
      }).join('');
    };

    const openModal = () => { renderModal(activeBatch); backdrop.classList.add('open'); };
    const closeModal = () => backdrop.classList.remove('open');

    batchTrigger.addEventListener('click', openModal);
    backdrop.querySelector('[data-batch-close]').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
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

  // Workshop-floor index scroller (prev/next buttons)
  const idxTrack = document.querySelector('[data-idx-track]');
  if (idxTrack) {
    const idxPrev = document.querySelector('[data-idx-prev]');
    const idxNext = document.querySelector('[data-idx-next]');
    const idxStep = () => idxTrack.querySelector('.idx-item').offsetWidth;
    idxPrev && idxPrev.addEventListener('click', () => idxTrack.scrollBy({ left: -idxStep(), behavior: 'smooth' }));
    idxNext && idxNext.addEventListener('click', () => idxTrack.scrollBy({ left: idxStep(), behavior: 'smooth' }));
  }

  // Leather grades: vertical stacked reveal
  const gradeStack = document.querySelector('[data-grade-stack]');
  if (gradeStack) {
    const data = JSON.parse(gradeStack.querySelector('[data-grade-data]').textContent);
    const rows = Array.from(gradeStack.querySelectorAll('[data-grade-trigger]'));
    const img = gradeStack.querySelector('[data-grade-img]');
    const body = gradeStack.querySelector('.grade-panel-body');
    const tierEl = gradeStack.querySelector('[data-grade-tier]');
    const titleEl = gradeStack.querySelector('[data-grade-title]');
    const descEl = gradeStack.querySelector('[data-grade-desc]');
    const specsEl = gradeStack.querySelector('[data-grade-specs]');

    const renderSpecs = (specs, best) => {
      const rowsHtml = specs.map(([label, value, positive]) =>
        `<div class="gp-spec"><span>${label}</span><strong${positive ? '' : ' class="gp-no"'}>${value}</strong></div>`
      ).join('');
      specsEl.innerHTML = rowsHtml + `<div class="gp-spec"><span>Best for</span><strong>${best}</strong></div>`;
    };

    let activeIdx = 0;
    let pendingIdx = 0;
    let swapTimer = null;
    const select = (idx) => {
      if (idx === activeIdx) return;
      activeIdx = idx;
      pendingIdx = idx;
      const d = data[idx];

      rows.forEach((r, i) => {
        r.classList.toggle('is-active', i === idx);
        r.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });

      body.classList.add('is-fading');
      img.classList.remove('is-shown');

      if (swapTimer) clearTimeout(swapTimer);
      swapTimer = setTimeout(() => {
        const myIdx = idx;
        img.onload = () => { if (pendingIdx === myIdx) img.classList.add('is-shown'); };
        img.src = d.img;
        img.alt = d.alt;
        tierEl.textContent = d.tier;
        titleEl.textContent = d.name;
        descEl.textContent = d.desc;
        renderSpecs(d.specs, d.best);
        body.classList.remove('is-fading');
        if (img.complete) img.classList.add('is-shown');
      }, 220);
    };

    rows.forEach((row, i) => row.addEventListener('click', () => select(i)));
    img.addEventListener('load', () => img.classList.add('is-shown'), { once: true });
    requestAnimationFrame(() => img.classList.add('is-shown'));
  }

  // Certifications: audit-ledger timeline
  const ledger = document.querySelector('[data-ledger]');
  if (ledger) {
    const ledgerData = JSON.parse(document.querySelector('[data-ledger-data]').textContent);
    const triggers = Array.from(ledger.querySelectorAll('[data-ledger-trigger]'));
    const record = document.querySelector('[data-ledger-record]');
    const recordInner = document.querySelector('[data-ledger-record-inner]');

    const renderRecord = (d) => {
      recordInner.innerHTML = `
        <p class="ledger-record-covers">${d.covers}</p>
        <div class="ledger-record-meta">
          <div><span>Audited by</span><strong>${d.auditor}</strong></div>
          <div><span>Last audit</span><strong>${d.last}</strong></div>
          <div><span>Next renewal</span><strong>${d.next}</strong></div>
          <div><span>Scope</span><strong>${d.scope}</strong></div>
        </div>`;
    };

    const openRecord = (idx) => {
      renderRecord(ledgerData[idx]);
      record.style.maxHeight = recordInner.scrollHeight + 60 + 'px';
      record.classList.add('is-open');
    };

    let activeIdx = 0;
    triggers.forEach((trigger, i) => {
      trigger.addEventListener('click', () => {
        if (i === activeIdx) {
          const isOpen = record.classList.contains('is-open');
          record.classList.toggle('is-open', !isOpen);
          record.style.maxHeight = isOpen ? '0px' : recordInner.scrollHeight + 60 + 'px';
          trigger.classList.toggle('is-open', !isOpen);
          return;
        }
        triggers.forEach((t, j) => t.classList.toggle('is-open', j === i));
        activeIdx = i;
        openRecord(i);
      });
    });

    // Open the first entry by default
    openRecord(0);
    window.addEventListener('resize', () => {
      if (record.classList.contains('is-open')) record.style.maxHeight = recordInner.scrollHeight + 60 + 'px';
    });
  }

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

  // ============ Cinematic hero carousel ============
  document.querySelectorAll('[data-hero-carousel]').forEach(carousel => {
    const slides = carousel.querySelectorAll('.hero-slide');
    const railItems = carousel.querySelectorAll('[data-hero-goto]');
    const captions = carousel.querySelectorAll('[data-hero-caption]');
    const bar = carousel.querySelector('[data-hero-bar]');
    const prevBtn = carousel.querySelector('[data-hero-prev]');
    const nextBtn = carousel.querySelector('[data-hero-next]');
    if (!slides.length) return;

    let current = 0;
    let rafId = null;
    let segStart = null;
    let paused = false;
    const DURATION = 6000;

    const render = () => {
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      railItems.forEach((r, i) => r.classList.toggle('active', i === current));
      captions.forEach((c, i) => {
        const on = i === current;
        c.classList.toggle('hidden', !on);
        if (on) {
          // re-trigger the word-in animation for the active caption
          c.querySelectorAll('.hero-word').forEach((w, wi) => {
            w.style.animation = 'none';
            void w.offsetWidth;
            w.style.animation = '';
            w.style.animationDelay = (wi * 0.06) + 's';
          });
        }
      });
    };

    const goTo = (i) => {
      current = (i + slides.length) % slides.length;
      render();
      restart();
    };
    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    const tick = (ts) => {
      if (paused) return;
      if (!segStart) segStart = ts;
      const pct = Math.min((ts - segStart) / DURATION, 1);
      if (bar) bar.style.transform = 'scaleX(' + pct + ')';
      if (pct >= 1) { next(); return; }
      rafId = requestAnimationFrame(tick);
    };

    const restart = () => {
      if (rafId) cancelAnimationFrame(rafId);
      segStart = null;
      if (bar) bar.style.transform = 'scaleX(0)';
      rafId = requestAnimationFrame(tick);
    };

    nextBtn && nextBtn.addEventListener('click', next);
    prevBtn && prevBtn.addEventListener('click', prev);
    railItems.forEach(item => {
      item.addEventListener('click', () => goTo(parseInt(item.dataset.heroGoto, 10)));
    });

    carousel.addEventListener('pointerenter', () => {
      paused = true;
      if (rafId) cancelAnimationFrame(rafId);
    });
    carousel.addEventListener('pointerleave', () => {
      paused = false;
      restart();
    });

    // Swipe support
    let touchStartX = null;
    carousel.addEventListener('pointerdown', (e) => { touchStartX = e.clientX; });
    carousel.addEventListener('pointerup', (e) => {
      if (touchStartX === null) return;
      const delta = e.clientX - touchStartX;
      if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
      touchStartX = null;
    });

    render();
    restart();
  });

  // ============ Header shrink-on-scroll (editorial header) ============
  const headerShell = document.querySelector('.header-shell');
  if (headerShell) {
    const onHeaderScroll = () => {
      headerShell.classList.toggle('is-compact', window.scrollY > 60);
    };
    document.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  // ============ Region / language switcher ============
  document.querySelectorAll('.region-switch').forEach(sw => {
    const trigger = sw.querySelector('[data-region-trigger]');
    trigger && trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = sw.classList.contains('open');
      document.querySelectorAll('.region-switch.open').forEach(o => o.classList.remove('open'));
      if (!isOpen) sw.classList.add('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.region-switch.open').forEach(o => o.classList.remove('open'));
  });

  // ============ Testimonial carousel ============
  document.querySelectorAll('[data-testimonials]').forEach(wrap => {
    const slides = wrap.querySelectorAll('.testi-slide');
    const dots = wrap.querySelectorAll('[data-testi-goto]');
    if (!slides.length) return;
    let idx = 0;
    let timer = null;
    const show = (i) => {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('active', n === idx));
      dots.forEach((d, n) => d.classList.toggle('active', n === idx));
    };
    const restart = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => show(idx + 1), 6000);
    };
    dots.forEach(d => d.addEventListener('click', () => { show(parseInt(d.dataset.testiGoto, 10)); restart(); }));
    show(0);
    restart();
  });

  // ============ Lookbook full-bleed panel reveal ============
  const lookbookIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
      else entry.target.classList.remove('is-visible');
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.lookbook-panel').forEach(p => lookbookIO.observe(p));

  // ============ Newsletter / trade signup form (demo only) ============
  const tradeForm = document.getElementById('trade-form');
  if (tradeForm) {
    tradeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = tradeForm.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = 'Submitting…';
      btn.disabled = true;
      setTimeout(() => {
        document.getElementById('trade-success')?.classList.remove('hidden');
        tradeForm.reset();
        btn.innerHTML = original;
        btn.disabled = false;
      }, 1100);
    });
  }

  // ============ World map: nodes + region list sync ============
  document.querySelectorAll('[data-origin-map]').forEach(map => {
    const nodes = map.querySelectorAll('[data-region-node]');
    const rows  = map.querySelectorAll('[data-region-row]');
    if (!nodes.length && !rows.length) return;

    const select = (key) => {
      nodes.forEach(n => n.classList.toggle('active', n.dataset.regionNode === key));
      rows.forEach(r => r.classList.toggle('active', r.dataset.regionRow === key));
    };

    nodes.forEach(n => {
      n.addEventListener('mouseenter', () => select(n.dataset.regionNode));
      n.addEventListener('click', () => select(n.dataset.regionNode));
    });
    rows.forEach(r => {
      r.addEventListener('mouseenter', () => select(r.dataset.regionRow));
      r.addEventListener('click', () => select(r.dataset.regionRow));
    });

    // draw arcs once the map scrolls into view
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.25 });
    const shell = map.querySelector('.map-shell') || map;
    io.observe(shell);

    if (rows.length) select(rows[0].dataset.regionRow);
  });

  // ============ Process reel: animated photo-sequence with play/pause ============
  document.querySelectorAll('[data-reel]').forEach(wrap => {
    const slides = wrap.querySelectorAll('.reel-slide');
    const steps = wrap.parentElement.querySelectorAll('[data-video-step]');
    const playBtn = wrap.querySelector('[data-reel-play]');
    const fill = wrap.querySelector('.reel-progress-fill');
    if (!slides.length) return;

    let idx = 0;
    let playing = true;
    let raf = null;
    let segStart = null;
    const SEG_MS = 3200;

    const applyState = () => {
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
      steps.forEach((s, i) => s.classList.toggle('active', i === idx));
    };

    const tick = (ts) => {
      if (!playing) return;
      if (!segStart) segStart = ts;
      const elapsed = ts - segStart;
      const pct = Math.min(elapsed / SEG_MS, 1);
      if (fill) fill.style.width = (pct * 100) + '%';
      if (pct >= 1) {
        idx = (idx + 1) % slides.length;
        segStart = ts;
        applyState();
      }
      raf = requestAnimationFrame(tick);
    };

    const play = () => {
      playing = true;
      segStart = null;
      wrap.classList.add('is-playing');
      if (playBtn) playBtn.innerHTML = '<svg class="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"/></svg>';
      raf = requestAnimationFrame(tick);
    };
    const pause = () => {
      playing = false;
      wrap.classList.remove('is-playing');
      if (raf) cancelAnimationFrame(raf);
      if (playBtn) playBtn.innerHTML = '<svg class="w-6 h-6 text-ink ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    };

    playBtn && playBtn.addEventListener('click', () => playing ? pause() : play());
    applyState();
    play();
  });

  // ============ FAQ accordion (home page) ============
  document.querySelectorAll('.faq-item').forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-panel');
    if (!trigger || !panel) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-panel').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // ============ Film section: play / pause ============
  document.querySelectorAll('[data-film]').forEach(frame => {
    const video = frame.querySelector('video');
    const btn   = frame.querySelector('[data-film-btn]');
    if (!video || !btn) return;

    const PLAY  = '<svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    const PAUSE = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"/></svg>';

    const sync = () => { btn.innerHTML = video.paused ? PLAY : PAUSE; };

    btn.addEventListener('click', () => {
      if (video.paused) video.play(); else video.pause();
    });
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    sync();

    // Pause when scrolled out of view, resume when back (saves bandwidth)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { if (video.dataset.userPaused !== '1') video.play().catch(()=>{}); }
        else video.pause();
      });
    }, { threshold: 0.25 });
    io.observe(frame);

    btn.addEventListener('click', () => {
      video.dataset.userPaused = video.paused ? '1' : '0';
    });
  });

  // ============ Cursor-lens reveal (X-ray magnifier) ============
  document.querySelectorAll('[data-lens]').forEach(stage => {
    const base     = stage.querySelector('.lens-base');
    const clip     = stage.querySelector('.lens-clip');
    const zoom     = stage.querySelector('.lens-zoom');
    const ring     = stage.querySelector('.lens-ring');
    const readout  = stage.querySelector('.lens-readout');
    const pills    = stage.parentElement.querySelectorAll('[data-grade]');
    const nameEl   = stage.parentElement.querySelector('[data-grade-name]');
    const descEl   = stage.parentElement.querySelector('[data-grade-desc]');
    const originEl = stage.querySelector('[data-grade-origin]');
    if (!base || !zoom || !ring || !clip) return;

    const ZOOM = 3.4;
    const D    = parseInt(getComputedStyle(stage).getPropertyValue('--lens-d')) || 230;
    let raf = null;

    const place = (x, y) => {
      const r = stage.getBoundingClientRect();
      const px = (x / r.width) * 100;
      const py = (y / r.height) * 100;
      // clip the magnified layer to a circle under the cursor
      clip.style.clipPath = `circle(${D / 2}px at ${x}px ${y}px)`;
      // scale about the cursor so the grain under the lens matches the base
      zoom.style.transformOrigin = `${px}% ${py}%`;
      zoom.style.transform = `scale(${ZOOM})`;
      ring.style.left = x + 'px';
      ring.style.top  = y + 'px';
      if (readout) {
        readout.style.left = x + 'px';
        readout.style.top  = (y + D / 2 + 14) + 'px';
      }
    };

    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => place(x, y));
    };

    stage.addEventListener('pointerenter', (e) => {
      stage.classList.add('lens-on');
      onMove(e);
    });
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', () => {
      stage.classList.remove('lens-on');
      if (raf) cancelAnimationFrame(raf);
      clip.style.clipPath = 'circle(0px at 50% 50%)';
    });

    // Grade switching
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const d = pill.dataset;
        // cross-fade to the new hide
        base.classList.add('is-hidden');
        zoom.classList.add('is-hidden');
        setTimeout(() => {
          base.src = d.img;
          zoom.src = d.img;
          base.alt = d.alt || '';
          base.classList.remove('is-hidden');
          zoom.classList.remove('is-hidden');
        }, 260);

        if (nameEl)   nameEl.textContent   = d.gradename || '';
        if (descEl)   descEl.textContent   = d.desc || '';
        if (originEl) originEl.textContent = d.origin || '';
        if (readout)  readout.textContent  = d.spec || '';
      });
    });
  });

  // ============ Hide anatomy diagram ============
  document.querySelectorAll('[data-anatomy]').forEach(wrap => {
    const svg    = wrap.querySelector('.anat-svg');
    const zones  = wrap.querySelectorAll('[data-zone]');
    const panels = wrap.querySelectorAll('[data-zone-detail]');
    if (!zones.length) return;

    const select = (key) => {
      zones.forEach(z => z.classList.toggle('active', z.dataset.zone === key));
      panels.forEach(p => p.classList.toggle('active', p.dataset.zoneDetail === key));
      if (svg) svg.classList.add('has-active');
    };

    zones.forEach(z => {
      z.addEventListener('mouseenter', () => select(z.dataset.zone));
      z.addEventListener('click', () => select(z.dataset.zone));
      z.addEventListener('focus', () => select(z.dataset.zone));
    });

    // default selection
    select(zones[0].dataset.zone);
  });

  // ============ Craft techniques tabs ============
  document.querySelectorAll('[data-craft]').forEach(wrap => {
    const tabs = wrap.querySelectorAll('[data-craft-tab]');
    const panes = wrap.querySelectorAll('[data-craft-pane]');
    if (!tabs.length) return;

    let idx = 0;
    let timer = null;
    const CYCLE = 5200;

    const show = (i) => {
      idx = (i + tabs.length) % tabs.length;
      tabs.forEach((t, n) => t.classList.toggle('active', n === idx));
      panes.forEach((p, n) => p.classList.toggle('active', n === idx));
    };
    const restart = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => show(idx + 1), CYCLE);
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => { show(i); restart(); });
      tab.addEventListener('mouseenter', () => { show(i); restart(); });
    });

    wrap.addEventListener('pointerenter', () => { if (timer) clearInterval(timer); });
    wrap.addEventListener('pointerleave', () => restart());

    show(0);
    restart();
  });

});
