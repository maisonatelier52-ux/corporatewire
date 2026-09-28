document.addEventListener('DOMContentLoaded', function () {

  // Basic static servers (including VS Code Live Server) do not resolve
  // extensionless routes to their matching .html files. Keep production links
  // clean, but make those links usable when the site is previewed locally.
  const hostname = window.location.hostname;
  const isPrivatePreview = hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

  if (isPrivatePreview) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const cleanPath = url.pathname.replace(/\/+$/, '');
      const finalSegment = cleanPath.split('/').pop();
      if (cleanPath && cleanPath !== '/' && finalSegment && !finalSegment.includes('.')) {
        url.pathname = cleanPath + '.html';
        link.setAttribute('href', url.pathname + url.search + url.hash);
      }
    });
  }

  // ── Date display (UPPERCASE — e.g. MONDAY, SEPTEMBER 7, 2026) ──────────────
  document.querySelectorAll('.header-date').forEach(function (el) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    el.textContent = new Date().toLocaleDateString('en-US', options).toUpperCase();
  });

  // Make long-form stories easier to navigate without changing their content.
  const article = document.querySelector(
    '.article-content, .lsf-article, .pld-article'
  );

  if (article) {
    const progress = document.createElement('div');
    progress.className = 'reading-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span>';
    document.body.prepend(progress);

    const progressBar = progress.firstElementChild;
    const updateProgress = function () {
      const start = article.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(article.offsetHeight - window.innerHeight, 1);
      const percentage = Math.min(100, Math.max(0, ((window.scrollY - start) / distance) * 100));
      progressBar.style.width = percentage + '%';
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    const copyButton = document.querySelector('[data-copy-article]');
    if (copyButton) {
      copyButton.addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(window.location.href);
          copyButton.textContent = 'Link copied';
          setTimeout(function () { copyButton.textContent = 'Copy link'; }, 1800);
        } catch (error) {
          copyButton.textContent = 'Copy unavailable';
        }
      });
    }
  }

  // Improve image performance and fill empty alternative text from nearby cards.
  document.querySelectorAll('img').forEach(function (img) {
    if (!img.closest('.hero, .pld-masthead, .author, .pld-byline, .lsf-byline')) {
      img.loading = img.loading || 'lazy';
    }

    if (!img.hasAttribute('alt') || !img.getAttribute('alt').trim()) {
      const card = img.closest('article, .popular-news, figure');
      const label = card && card.querySelector('h2, h3, h4, figcaption');
      img.alt = label ? label.textContent.trim() : '';
    }
  });

  document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', Array.from(rel).join(' '));
  });

  // ── Mobile menu (hamburger) ────────────────────────────────────────────────
  // The open/closed state is a CSS-only checkbox (#menu-toggle). This block adds
  // what CSS cannot: page scroll lock, keyboard + screen-reader support, closing
  // on link tap / Escape / back-navigation, and highlighting the current section.
  (function () {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.querySelector('.mega-menu');
    const button = document.querySelector('.mobile-menu');
    if (!toggle || !menu || !button) return;

    const root = document.documentElement;
    const mobile = window.matchMedia('(max-width: 768px)');

    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('aria-controls', menu.id || 'megaMenu');
    menu.setAttribute('aria-label', 'Site menu');

    function sync() {
      const open = toggle.checked && mobile.matches;
      root.classList.toggle('cw-menu-open', open);
      button.setAttribute('aria-expanded', toggle.checked ? 'true' : 'false');
      button.setAttribute('aria-label', toggle.checked ? 'Close menu' : 'Open menu');
      if (open) menu.scrollTop = 0;
    }

    function setOpen(state) {
      toggle.checked = state;
      sync();
    }

    toggle.addEventListener('change', sync);

    button.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(!toggle.checked);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.checked) {
        setOpen(false);
        button.focus();
      }
    });

    // Tapping any link closes the menu (also covers links to the current page).
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    // iOS Safari can still rubber-band the page when the header is dragged.
    const header = document.querySelector('.header');
    if (header) {
      header.addEventListener('touchmove', function (event) {
        if (root.classList.contains('cw-menu-open')) event.preventDefault();
      }, { passive: false });
    }

    // Never leave the menu (or the scroll lock) behind when the layout changes
    // to desktop width, or when the page is restored from the back/forward cache.
    const onBreakpoint = function () { if (!mobile.matches) setOpen(false); else sync(); };
    if (mobile.addEventListener) mobile.addEventListener('change', onBreakpoint);
    else if (mobile.addListener) mobile.addListener(onBreakpoint);
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) setOpen(false);
    });

    // Stagger index for the entrance animation + highlight the current section
    // (each page already marks its section as .nav-item.active).
    const links = menu.querySelectorAll('a');
    links.forEach(function (link, index) { link.style.setProperty('--i', index); });

    const activeNav = document.querySelector('.nav-item.active > a');
    if (activeNav) {
      const clean = function (url) {
        return url.replace(/[?#].*$/, '').replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '');
      };
      const target = clean(activeNav.href);
      links.forEach(function (link) {
        if (clean(link.href) === target) {
          link.classList.add('is-current');
          link.setAttribute('aria-current', 'true');
        }
      });
    }

    sync();
  })();

});
