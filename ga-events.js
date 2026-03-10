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
