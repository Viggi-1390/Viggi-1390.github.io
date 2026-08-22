    // ── Scroll reveal ──
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));

    // ── Nav sector counter ──
    const sectorEl   = document.querySelector('.nav-sector');
    const sectionIds = ['about', 'skills', 'projects', 'contact'];
    const sectorNames = ['01 — DRIVER PROFILE','02 — ONBOARD DATA','03 — LAP RECORDS','04 — PIT WALL'];
    window.addEventListener('scroll', function () {
      let active = 0;
      sectionIds.forEach(function (id, i) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 200) active = i;
      });
      sectorEl.textContent = 'SECTOR  ' + sectorNames[active];
    });

    // ── Needle + RPM — pure JS, no CSS animation ──
    // Needle pivots at SVG point (200, 328).
    // Start angle: -140deg (far left), overshoot to +55deg, settle at +45deg.
    const needleEl = document.getElementById('needle-group');
    const rpmEl    = document.getElementById('rpmDisplay');

    const ANGLE_START    = -140;
    const ANGLE_OVERSHOOT =   55;
    const ANGLE_END      =   45;
    const RPM_MAX        = 9200;
    const RPM_TARGET     = 7800;
    const DELAY_MS       =  500;
    const DURATION_MS    = 2200;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeOutBack(t) {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    function setNeedle(deg) {
      needleEl.setAttribute('transform', 'rotate(' + deg + ' 200 328)');
    }

    // Start at rest
    setNeedle(ANGLE_START);

    setTimeout(function () {
      const startTime = performance.now();

      function frame(now) {
        const elapsed  = now - startTime;
        const t        = Math.min(elapsed / DURATION_MS, 1);

        let angle, rpm;

        if (t < 0.65) {
          // Phase 1: sweep up with easeOutBack (overshoot)
          const p = t / 0.65;
          angle = ANGLE_START + (ANGLE_OVERSHOOT - ANGLE_START) * easeOutBack(p);
          rpm   = Math.round((angle - ANGLE_START) / (ANGLE_OVERSHOOT - ANGLE_START) * RPM_MAX);
        } else {
          // Phase 2: settle back to final position
          const p = (t - 0.65) / 0.35;
          angle = ANGLE_OVERSHOOT + (ANGLE_END - ANGLE_OVERSHOOT) * easeOutCubic(p);
          rpm   = Math.round(RPM_MAX - (RPM_MAX - RPM_TARGET) * easeOutCubic(p));
        }

        setNeedle(angle);
        rpmEl.textContent = String(Math.max(0, rpm)).padStart(4, '0');

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          setNeedle(ANGLE_END);
          rpmEl.textContent = String(RPM_TARGET).padStart(4, '0');
        }
      }

      requestAnimationFrame(frame);
    }, DELAY_MS);