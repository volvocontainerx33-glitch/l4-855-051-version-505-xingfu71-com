(() => {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const menuButton = qs('[data-menu-toggle]');
  const menuPanel = qs('[data-menu-panel]');

  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', () => {
      menuPanel.classList.toggle('open');
    });
  }

  qsa('[data-carousel]').forEach((carousel) => {
    const slides = qsa('[data-slide]', carousel);
    const dots = qsa('[data-slide-dot]', carousel);
    let current = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    };

    const next = () => show(current + 1);
    const start = () => {
      stop();
      timer = window.setInterval(next, 5200);
    };
    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.slideDot || 0));
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  qsa('[data-filter-panel]').forEach((panel) => {
    const scope = panel.parentElement || document;
    const input = qs('[data-search-input]', panel);
    const year = qs('[data-year-filter]', panel);
    const cards = qsa('[data-card]', scope);
    const empty = qs('[data-empty-state]', scope);

    const apply = () => {
      const term = (input?.value || '').trim().toLowerCase();
      const yearValue = year?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const text = (card.dataset.search || '').toLowerCase();
        const cardYear = card.dataset.year || '';
        const matchesTerm = !term || text.includes(term);
        const matchesYear = !yearValue || cardYear === yearValue;
        const ok = matchesTerm && matchesYear;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });

      if (empty) empty.classList.toggle('show', visible === 0);
    };

    input?.addEventListener('input', apply);
    year?.addEventListener('change', apply);
  });

  qsa('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.style.display = 'none';
    }, { once: true });
  });

  qsa('[data-player-shell]').forEach((shell) => {
    const video = qs('video', shell);
    const trigger = qs('[data-video]', shell);
    const message = qs('[data-player-message]', shell);
    let hlsInstance = null;

    const setMessage = (text) => {
      if (message) message.textContent = text || '';
    };

    const start = async () => {
      if (!video || !trigger) return;
      const url = trigger.dataset.video;
      if (!url) return;
      setMessage('');

      if (!shell.dataset.ready) {
        shell.dataset.ready = '1';
        shell.classList.add('is-ready');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, (_event, data) => {
            if (data && data.fatal) {
              setMessage('视频加载失败，请稍后再试');
            }
          });
        } else {
          video.src = url;
        }
      }

      try {
        await video.play();
      } catch (_error) {
        setMessage('点击视频区域继续播放');
      }
    };

    trigger?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      start();
    });

    shell.addEventListener('click', (event) => {
      if (event.target === video && shell.dataset.ready) return;
      if (!shell.dataset.ready || event.target.closest('[data-video]')) {
        start();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (hlsInstance) hlsInstance.destroy();
    });
  });
})();
