/* The Branded Entertainment Brief — newsletter signup.
 *
 * One copy, loaded by every page that carries a .subscribe-form. This used to
 * be eleven pasted copies of the same handler, which is how the copy on those
 * pages drifted apart three times already.
 *
 * Each submission is gated by Cloudflare Turnstile. The widget renders in
 * "execute" mode, so the challenge runs at submit time and every request
 * carries a token minted seconds earlier — no five-minute expiry window, no
 * token that could be replayed from an earlier page view.
 *
 * The token is verified server-side in netlify/functions/subscribe.mjs before
 * beehiiv is called. Nothing here can be trusted; it is a courtesy layer.
 */
(function () {
  'use strict';

  /* Turnstile site key. Public by design — it renders into the DOM on every
   * page, and Cloudflare treats it as public. The SECRET key never appears in
   * this file or any other frontend file: it lives only in the Netlify
   * environment as TURNSTILE_SECRET_KEY.
   *
   * If this key is ever rotated, this line is the only place it lives. A key
   * that does not match the widget's configured domain list fails verification
   * server-side, which on the page looks exactly like a broken form. */
  var SITE_KEY = '0x4AAAAAAEuHWN8IG5yaCKB1';

  var ENDPOINT      = '/.netlify/functions/subscribe';
  var HONEYPOT_NAME = 'company_website';
  var TOKEN_TIMEOUT = 30000;

  var TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
                    + '?render=explicit&onload=__briefTurnstileReady';

  var records = [];
  var ready   = false;

  /* ---------- small helpers ---------- */

  function sentEl(form) {
    var parent = form.parentNode;
    var el = parent && parent.querySelector ? parent.querySelector('.subscribe-sent') : null;
    return el || form.nextElementSibling;
  }

  function show(rec, message, isError) {
    if (!rec.sent) return;
    rec.sent.textContent = message;
    rec.sent.style.color = isError ? 'var(--error)' : '';
    rec.sent.style.display = 'block';
  }

  function resetButton(rec) {
    rec.button.disabled = false;
    rec.button.textContent = rec.label;
  }

  /* The honeypot is positioned off-screen rather than display:none, and is
   * hidden from keyboard and assistive tech so no real visitor can reach it. */
  function injectHoneypotStyle() {
    if (document.getElementById('subscribe-hp-style')) return;
    var style = document.createElement('style');
    style.id = 'subscribe-hp-style';
    style.textContent =
      '.subscribe-hp{position:absolute!important;left:-9999px!important;' +
      'width:1px!important;height:1px!important;overflow:hidden!important;' +
      'opacity:0!important;pointer-events:none!important;}';
    document.head.appendChild(style);
  }

  function addHoneypot(form) {
    var wrap = document.createElement('div');
    wrap.className = 'subscribe-hp';
    wrap.setAttribute('aria-hidden', 'true');

    var field = document.createElement('input');
    field.type = 'text';
    field.name = HONEYPOT_NAME;
    field.tabIndex = -1;
    field.autocomplete = 'off';
    field.setAttribute('aria-hidden', 'true');

    wrap.appendChild(field);
    form.appendChild(wrap);
    return field;
  }

  /* The widget container sits after the form, not inside it: .subscribe-form is
   * a flex row, and an interaction challenge dropped into that row would squash
   * the input on narrow screens. */
  function addWidgetSlot(form) {
    var slot = document.createElement('div');
    slot.className = 'subscribe-turnstile';
    slot.style.marginTop = '10px';
    if (form.parentNode) form.parentNode.insertBefore(slot, form.nextSibling);
    else form.appendChild(slot);
    return slot;
  }

  /* ---------- Turnstile ---------- */

  function settle(rec, err, token) {
    var pending = rec.pending;
    if (!pending) return;
    rec.pending = null;
    if (pending.timer) clearTimeout(pending.timer);
    if (err) pending.reject(err);
    else pending.resolve(token);
  }

  function renderWidget(rec) {
    try {
      rec.widgetId = window.turnstile.render(rec.slot, {
        sitekey: SITE_KEY,
        action: 'subscribe',
        execution: 'execute',
        appearance: 'interaction-only',
        callback: function (token) { settle(rec, null, token); },
        'error-callback': function () {
          settle(rec, new Error('Verification failed. Please try again.'));
          return true;
        },
        'expired-callback': function () {
          settle(rec, new Error('Verification expired. Please try again.'));
        },
        'timeout-callback': function () {
          settle(rec, new Error('Verification timed out. Please try again.'));
        }
      });
    } catch (err) {
      rec.widgetId = null;
      if (window.console) console.error('Turnstile failed to render:', err);
    }
  }

  window.__briefTurnstileReady = function () {
    ready = true;
    records.forEach(renderWidget);
  };

  function loadTurnstile() {
    if (document.getElementById('cf-turnstile-script')) return;
    var s = document.createElement('script');
    s.id = 'cf-turnstile-script';
    s.src = TURNSTILE_SRC;
    s.async = true;
    s.defer = true;
    s.onerror = function () {
      if (window.console) console.error('Turnstile script failed to load.');
    };
    document.head.appendChild(s);
  }

  /* Resets before executing, so a retry after a failed submit never reuses a
   * token beehiiv's side already saw. */
  function getToken(rec) {
    return new Promise(function (resolve, reject) {
      if (!ready || !window.turnstile || rec.widgetId === null || rec.widgetId === undefined) {
        reject(new Error('Verification is unavailable. Please disable any ad blocker and try again.'));
        return;
      }
      rec.pending = {
        resolve: resolve,
        reject: reject,
        timer: setTimeout(function () {
          settle(rec, new Error('Verification timed out. Please try again.'));
        }, TOKEN_TIMEOUT)
      };
      try {
        window.turnstile.reset(rec.widgetId);
        window.turnstile.execute(rec.widgetId);
      } catch (err) {
        settle(rec, new Error('Verification failed to start. Please try again.'));
      }
    });
  }

  /* ---------- submit ---------- */

  function post(rec, token) {
    var payload = {
      email: rec.input.value.trim(),
      page: location.pathname,
      turnstileToken: token
    };
    payload[HONEYPOT_NAME] = rec.honeypot ? rec.honeypot.value : '';

    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
        return data;
      });
    });
  }

  function onSubmit(e, rec) {
    e.preventDefault();
    if (rec.busy) return;
    rec.busy = true;

    rec.button.disabled = true;
    rec.button.textContent = 'subscribing...';

    getToken(rec)
      .then(function (token) { return post(rec, token); })
      .then(function (data) {
        rec.busy = false;
        show(rec, data.status === 'active'
          ? "You're subscribed →"
          : 'Check your inbox to confirm →', false);
        rec.form.style.display = 'none';
        if (rec.slot) rec.slot.style.display = 'none';
      })
      .catch(function (err) {
        rec.busy = false;
        resetButton(rec);
        show(rec, err.message, true);
        if (ready && window.turnstile && rec.widgetId !== null && rec.widgetId !== undefined) {
          try { window.turnstile.reset(rec.widgetId); } catch (ignore) {}
        }
      });
  }

  /* ---------- init ---------- */

  function init() {
    var forms = document.querySelectorAll('form.subscribe-form');
    if (!forms.length) return;

    injectHoneypotStyle();

    Array.prototype.forEach.call(forms, function (form) {
      var input  = form.querySelector('input[type=email]');
      var button = form.querySelector('button');
      if (!input || !button) return;

      form.removeAttribute('onsubmit');

      var rec = {
        form: form,
        input: input,
        button: button,
        label: button.textContent,
        sent: sentEl(form),
        honeypot: addHoneypot(form),
        slot: addWidgetSlot(form),
        widgetId: null,
        pending: null,
        busy: false
      };

      form.addEventListener('submit', function (e) { onSubmit(e, rec); });
      records.push(rec);
      if (ready) renderWidget(rec);
    });

    loadTurnstile();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
