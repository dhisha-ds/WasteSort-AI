/**
 * WasteSort AI — Main Frontend JavaScript
 * Handles mobile navigation toggling and common interactions.
 */

document.addEventListener('DOMContentLoaded', function () {
  const mobileToggle = document.getElementById('wsMobileToggle');
  const mobileMenu = document.getElementById('wsMobileMenu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
      if (!mobileToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.classList.remove('open');
      }
    });
  }
});
