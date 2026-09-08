document.addEventListener('DOMContentLoaded', function () {

  // ── Date display (UPPERCASE — e.g. MONDAY, SEPTEMBER 7, 2026) ──────────────
  document.querySelectorAll('.header-date').forEach(function (el) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    el.textContent = new Date().toLocaleDateString('en-US', options).toUpperCase();
  });

});
