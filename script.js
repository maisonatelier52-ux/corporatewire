document.addEventListener('DOMContentLoaded', function () {
  const dateElement = document.querySelector('.header-date');
  if (dateElement) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
  }
});
