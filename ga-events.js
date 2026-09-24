/**
 * GA4 Custom Event Tracking for My Baking Creations
 * Fires click_to_call when visitors tap/click phone links
 */
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
    link.addEventListener('click', function() {
      if (typeof gtag === 'function') {
        gtag('event', 'click_to_call', {
          phone_number: link.getAttribute('href').replace('tel:', '')
        });
      }
    });
  });
});

// Every page loads this file, so it also pulls in the phone scroll reveal
// (phone-reveal.js). Phones only; the file checks again itself.
(function () {
  if (!window.matchMedia || !window.matchMedia('(max-width: 768px)').matches) return;
  var s = document.createElement('script');
  s.src = '/phone-reveal.js';
  s.defer = true;
  document.head.appendChild(s);
})();
