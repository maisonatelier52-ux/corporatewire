document.addEventListener('DOMContentLoaded', function () {

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

});

