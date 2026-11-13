/* Click tracking for the two places this site sends people off-site on
 * purpose: the Publisher Test (blueprint.jeffhallstead.com) and The Branded
 * Entertainment Brief (brandedentertainmentbrief.com).
 *
 * One copy, loaded by every page. The GA4 tag itself (window.gtag) is not in
 * this repo: Netlify injects it at deploy time, so this file only sends events
 * when that tag is present, and does nothing locally.
 *
 * Events:
 *   publisher_test_click  any link to blueprint.jeffhallstead.com
 *   newsletter_click      any link to brandedentertainmentbrief.com
 * Both carry link_url, link_text and cta_location (nav, footer, or the id of
 * the page section the link sits in), so GA4 can show which CTAs work.
 *
 * Form conversions live with their forms: generate_lead in contact.html,
 * sign_up in assets/subscribe.js.
 */
(function () {
  'use strict';

  var TARGETS = [
    { host: 'blueprint.jeffhallstead.com', event: 'publisher_test_click' },
    { host: 'brandedentertainmentbrief.com', event: 'newsletter_click' }
  ];

  function eventFor(a) {
    var host;
    try { host = new URL(a.href, location.href).hostname.replace(/^www\./, ''); }
    catch (e) { return null; }
    for (var i = 0; i < TARGETS.length; i++) {
      if (host === TARGETS[i].host) return TARGETS[i].event;
    }
    return null;
  }

  function locationOf(a) {
    if (a.closest('body > nav')) return 'nav';
    if (a.closest('footer')) return 'footer';
    var section = a.closest('section[id], section[class], aside');
    if (!section) return 'page';
    return section.id || section.className.split(' ')[0] || section.tagName.toLowerCase();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var name = eventFor(a);
    if (!name || typeof window.gtag !== 'function') return;
    window.gtag('event', name, {
      link_url: a.href,
      link_text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      cta_location: locationOf(a)
    });
  }, true);
})();
