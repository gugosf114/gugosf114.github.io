(function () {
  'use strict';

  var API_BASE = (document.documentElement.dataset.orderApi || 'https://mbc-order-backend.summer-lake-b6ea.workers.dev').replace(/\/$/, '');
  var session = null, preparing = null, turnstileWidget = null;
  var securityToken = '';
  var paidNote = document.getElementById('paypal-paid-note');
  var progress = document.getElementById('saveProgress');
  var progressText = document.getElementById('saveProgressText');
  var progressFill = document.getElementById('saveProgressFill');
  var securityNode = document.getElementById('orderSecurity');

  function say(message, bad) {
    if (!paidNote) return;
    paidNote.style.display = 'block';
    paidNote.style.color = bad ? '#b00020' : '';
    paidNote.textContent = message;
  }

  function showProgress(message, percent) {
    if (!progress) return;
    progress.hidden = false;
    progressText.textContent = message;
    progressFill.style.width = Math.max(0, Math.min(100, percent)) + '%';
  }

  function hideProgress() {
    if (progress) progress.hidden = true;
  }

  async function api(path, options) {
    var response = await fetch(API_BASE + path, options || {});
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      var error = new Error(data.message || 'The secure order service could not finish this step.');
      error.code = data.error || 'order_service_error';
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function sha256(blob) {
    var digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
    return Array.from(new Uint8Array(digest)).map(function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
  }

  function quote() {
    return window.__mbcOrderPricing && window.__mbcOrderPricing.getState();
  }

  function approvedDesigns() {
    return window.__mbcDesignStudio && window.__mbcDesignStudio.getDesigns();
  }

  function fingerprint(currentQuote, designs) {
    return JSON.stringify({
      quantity: currentQuote.quantity,
      photos: currentQuote.photos,
      fulfil: currentQuote.fulfil,
      zip: currentQuote.zip,
      service: currentQuote.service,
      designs: designs.map(function (design) {
        return design && [design.slot, design.quantity, design.shape, design.background, design.approvedAt];
      })
    });
  }

  function turnstileReset() {
    securityToken = '';
    if (window.turnstile && turnstileWidget !== null) window.turnstile.reset(turnstileWidget);
  }

  function renderTurnstile() {
    if (!securityNode || turnstileWidget !== null || !window.turnstile) return;
    var sitekey = securityNode.dataset.sitekey || '';
    if (!sitekey) return;
    turnstileWidget = window.turnstile.render(securityNode, {
      sitekey: sitekey,
      action: 'order_design',
      theme: 'light',
      callback: function (token) { securityToken = token; },
      'expired-callback': function () { securityToken = ''; },
      'error-callback': function () { securityToken = ''; }
    });
  }

  window.mbcTurnstileLoaded = renderTurnstile;
  if (window.turnstile) renderTurnstile();

  function upload(orderSession, design, kind, blob, fileName) {
    return sha256(blob).then(function (hash) {
      return api('/v1/designs/' + orderSession.id + '/files/' + design.slot + '/' + kind, {
        method: 'PUT',
        headers: {
          authorization: 'Bearer ' + orderSession.token,
          'content-type': blob.type || 'image/png',
          'x-file-name': encodeURIComponent(fileName),
          'x-file-sha256': hash
        },
        body: blob
      });
    });
  }

  async function prepareOrder() {
    if (preparing) return preparing;
    var currentQuote = quote();
    var designs = approvedDesigns();
    if (!currentQuote || !currentQuote.ready) throw new Error('Enter the delivery ZIP and choose a FedEx speed before you pay.');
    if (!designs || designs.length !== currentQuote.photos || designs.some(function (design) { return !design; })) {
      throw new Error('Approve every cookie design before you pay.');
    }
    var mark = fingerprint(currentQuote, designs);
    if (session && session.fingerprint === mark) return session;
    if (!securityToken) throw new Error('Finish the secure order check above the PayPal button.');

    preparing = (async function () {
      showProgress('Opening your private order folder…', 4);
      var created = await api('/v1/designs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          quantity: currentQuote.quantity,
          photoCount: currentQuote.photos,
          fulfilment: currentQuote.fulfil,
          postalCode: currentQuote.zip,
          shippingService: currentQuote.service,
          turnstileToken: securityToken
        })
      });
      session = { id: created.id, token: created.token, fingerprint: mark };
      turnstileReset();

      var completed = 0, fileCount = designs.length * 3;
      for (var index = 0; index < designs.length; index++) {
        var design = designs[index];
        showProgress('Saving original photo ' + design.slot + ' of ' + designs.length + '…', 8 + completed / fileCount * 74);
        await upload(session, design, 'original', design.file, design.file.name || ('photo-' + design.slot));
        completed++;
        showProgress('Saving clean print art ' + design.slot + ' of ' + designs.length + '…', 8 + completed / fileCount * 74);
        await upload(session, design, 'artwork', design.artworkBlob, 'design-' + design.slot + '-print-art.png');
        completed++;
        showProgress('Saving approved cookie ' + design.slot + ' of ' + designs.length + '…', 8 + completed / fileCount * 74);
        await upload(session, design, 'approved', design.approvedBlob, 'design-' + design.slot + '-approved-cookie.png');
        completed++;
      }

      showProgress('Locking the exact designs you approved…', 88);
      await api('/v1/designs/' + session.id + '/finalize', {
        method: 'POST',
        headers: { authorization: 'Bearer ' + session.token, 'content-type': 'application/json' },
        body: JSON.stringify({ designs: designs.map(function (design) {
          return {
            slot: design.slot,
            quantity: design.quantity,
            shape: design.shape,
            background: design.background,
            approvedAt: design.approvedAt
          };
        }) })
      });
      showProgress('Saved. Opening PayPal…', 100);
      return session;
    })().catch(function (error) {
      if (!session) turnstileReset();
      hideProgress();
      throw error;
    }).finally(function () { preparing = null; });
    return preparing;
  }

  window.__mbcOrderUpload = {
    invalidate: function () { session = null; preparing = null; hideProgress(); turnstileReset(); },
    prepare: prepareOrder
  };

  function validationError() {
    var currentQuote = quote();
    var designs = approvedDesigns();
    if (!designs || !designs.length || designs.some(function (design) { return !design; })) return 'Approve every cookie design before you pay.';
    if (!currentQuote || !currentQuote.ready) return 'Enter the delivery ZIP and choose a FedEx speed before you pay.';
    if (!securityToken && !session) return 'Finish the secure order check above the PayPal button.';
    return '';
  }

  async function captureWithRetry(paypalOrderId) {
    var lastError;
    for (var attempt = 1; attempt <= 3; attempt++) {
      try {
        return await api('/v1/paypal/orders/' + encodeURIComponent(paypalOrderId) + '/capture', {
          method: 'POST',
          headers: { authorization: 'Bearer ' + session.token, 'content-type': 'application/json' },
          body: '{}'
        });
      } catch (error) {
        lastError = error;
        if (attempt < 3) await new Promise(function (resolve) { setTimeout(resolve, attempt * 700); });
      }
    }
    throw lastError;
  }

  if (!window.paypal || !document.getElementById('paypal-button-container')) return;
  window.paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
    onClick: function (data, actions) {
      var problem = validationError();
      if (problem) {
        say(problem, true);
        if (problem.indexOf('cookie design') >= 0 && window.__mbcDesignStudio) {
          document.getElementById('designTray').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return actions.reject();
      }
      say('Saving your approved files before PayPal opens…', false);
      return prepareOrder().then(function () { return actions.resolve(); }).catch(function (error) {
        say(error.message, true);
        return actions.reject();
      });
    },
    createOrder: function () {
      return prepareOrder().then(function (ready) {
        return api('/v1/paypal/orders', {
          method: 'POST',
          headers: { authorization: 'Bearer ' + ready.token, 'content-type': 'application/json' },
          body: '{}'
        });
      }).then(function (data) { return data.id; });
    },
    onShippingAddressChange: function (data, actions) {
      var currentQuote = quote();
      if (!currentQuote || currentQuote.fulfil !== 'ship') return;
      var address = data.shippingAddress || {};
      if (address.countryCode && address.countryCode !== 'US') return actions.reject(data.errors.COUNTRY_ERROR);
      var paypalZip = String(address.postalCode || '').slice(0, 5);
      if (paypalZip && paypalZip !== currentQuote.zip) return actions.reject(data.errors.ZIP_ERROR);
    },
    onApprove: function (data) {
      showProgress('Checking the payment and filing the order…', 100);
      return captureWithRetry(data.orderID).then(function (receipt) {
        ['.pc-ship', '#paypal-button-container', '#payLabel', '#payHint', '#orderSecurity'].forEach(function (selector) {
          var element = document.querySelector(selector); if (element) element.style.display = 'none';
        });
        hideProgress();
        say('Payment received. Order ' + receipt.orderId + ' is complete. Your approved pictures and print files are with the bakery.', false);
        window.dispatchEvent(new CustomEvent('mbc:orderpaid', { detail: receipt }));
      }).catch(function (error) {
        hideProgress();
        say(error.message + ' Your saved order is still here. Tap PayPal once more so we can check it.', true);
      });
    },
    onCancel: function () {
      hideProgress();
      say('Payment was not made. Your approved design is still ready.', false);
    },
    onError: function () {
      hideProgress();
      say('PayPal could not open. Your approved design is saved. Tap PayPal once more.', true);
    }
  }).render('#paypal-button-container');
})();
