// Existing storefront rates and ZIP rules. Shared contract with mbc-order-backend.
(function () {
  var qtyInput = document.getElementById("cookieQty");
  var photoCount = document.getElementById("photoCount");
  var qtyDown = document.getElementById("qtyDown");
  var qtyUp = document.getElementById("qtyUp");
  var zipInput = document.getElementById("shippingZip");
  var shippingBox = document.getElementById("shippingCalculator");
  var shippingOptions = document.getElementById("shippingOptions");
  var shippingMessage = document.getElementById("shippingMessage");
  var cookieSubtotal = document.getElementById("cookieSubtotal");
  var shippingPrice = document.getElementById("shippingPrice");
  var orderTotal = document.getElementById("orderTotal");
  var payLabel = document.getElementById("payLabel");
  var shipDateBox = document.getElementById("shipDateBox");
  var shipDateInput = document.getElementById("shipDate");
  var shipDateMessage = document.getElementById("shipDateMessage");
  var SHIP_DATE_MIN_DAYS = 2,
    SHIP_DATE_MAX_DAYS = 90;
  if (!qtyInput || !zipInput) return;

  var RATE_WEIGHTS = [4, 15, 50];
  var SERVICE_NAMES = {
    ground: "Ground",
    twoDay: "2Day",
    overnight: "Standard Overnight",
  };
  var RATES = {
    2: {
      ground: [14.74, 19.28, 41.92],
      twoDay: [28.84, 47.58, 107.5],
      overnight: [51.04, 73.84, 156.04],
    },
    3: {
      ground: [15.76, 20.39, 53.6],
      twoDay: [31.1, 56.11, 133.62],
      overnight: [66.52, 112.6, 227.04],
    },
    4: {
      ground: [16.61, 22.2, 66.7],
      twoDay: [35.06, 70.83, 174.84],
      overnight: [100.08, 192.4, 418.15],
    },
    5: {
      ground: [18.77, 31.23, 83.07],
      twoDay: [49.55, 108.11, 249.79],
      overnight: [109.92, 212.64, 460.99],
    },
    6: {
      ground: [21.55, 40.74, 105.07],
      twoDay: [63.78, 158.49, 417.37],
      overnight: [121.26, 223.98, 475.41],
    },
    7: {
      ground: [23.05, 48.74, 122.48],
      twoDay: [70.55, 168.8, 435.6],
      overnight: [129.67, 248.44, 514.7],
    },
    8: {
      ground: [26.27, 55.57, 142.47],
      twoDay: [73.29, 175.97, 444.32],
      overnight: [138.26, 256.08, 544.87],
    },
  };
  var ZIP_ZONES = [
    [1000, 37499, 8],
    [37500, 37599, 7],
    [37600, 37999, 8],
    [38000, 38199, 7],
    [38200, 38599, 8],
    [38600, 38799, 7],
    [38800, 49999, 8],
    [50000, 50999, 7],
    [51000, 51199, 6],
    [51200, 52899, 7],
    [53000, 53499, 8],
    [53500, 54099, 7],
    [54100, 54399, 8],
    [54400, 56799, 7],
    [57000, 57799, 6],
    [58000, 58299, 7],
    [58300, 58899, 6],
    [59000, 59199, 5],
    [59200, 59399, 6],
    [59400, 59999, 5],
    [60000, 60999, 8],
    [61000, 61799, 7],
    [61800, 61999, 8],
    [62000, 66799, 7],
    [66800, 67299, 6],
    [67300, 67399, 7],
    [67400, 69399, 6],
    [70000, 70499, 8],
    [70500, 70699, 7],
    [70700, 70999, 8],
    [71000, 72999, 7],
    [73000, 73299, 6],
    [73300, 73399, 7],
    [73400, 73999, 6],
    [74000, 74599, 7],
    [74600, 74699, 6],
    [74700, 76299, 7],
    [76300, 76399, 6],
    [76400, 76799, 7],
    [76800, 76999, 6],
    [77000, 78799, 7],
    [78800, 78899, 6],
    [78900, 78999, 7],
    [79000, 79799, 6],
    [79800, 83299, 5],
    [83300, 83399, 4],
    [83400, 83599, 5],
    [83600, 83799, 4],
    [83800, 83899, 5],
    [84000, 84499, 4],
    [84500, 84599, 5],
    [84600, 84799, 4],
    [85000, 85399, 5],
    [85400, 85499, 4],
    [85500, 85999, 5],
    [86000, 86499, 4],
    [86500, 88099, 5],
    [88100, 88299, 6],
    [88300, 88399, 5],
    [88400, 88499, 6],
    [88500, 88599, 5],
    [88900, 89399, 4],
    [89400, 89799, 3],
    [89800, 92999, 4],
    [93000, 93599, 3],
    [93600, 95499, 2],
    [95500, 95599, 3],
    [95600, 95999, 2],
    [96000, 96199, 3],
    [96200, 96699, 2],
    [97000, 97499, 4],
    [97500, 97699, 3],
    [97700, 97999, 4],
    [98000, 98599, 5],
    [98600, 98699, 4],
    [98700, 98799, 2],
    [98800, 99299, 5],
    [99300, 99399, 4],
    [99400, 99499, 5],
  ];
  var state = {
    quantity: 12,
    photos: 1,
    fulfil: "ship",
    zip: "",
    zone: null,
    weight: 4,
    service: "ground",
    serviceLabel: "Ground",
    shipping: null,
    subtotal: 60,
    total: null,
    shipWhen: "soon",
    shipDate: "",
    shipDateLabel: "Within 48 hours",
    ready: false,
  };

  function money(value) {
    return "$" + Math.round(value);
  }
  function quantity() {
    return Math.max(12, Math.round(parseInt(qtyInput.value, 10) || 12));
  }
  function fulfilment() {
    var checked = document.querySelector('input[name="fulfil"]:checked');
    return checked ? checked.value : "ship";
  }
  function service() {
    var checked = document.querySelector(
      'input[name="shippingService"]:checked',
    );
    return checked ? checked.value : "ground";
  }
  function shipWhen() {
    var checked = document.querySelector('input[name="shipWhen"]:checked');
    return checked ? checked.value : "soon";
  }
  function isoDay(date) {
    return date.toISOString().slice(0, 10);
  }
  // The bakery's day decides "today", the same way the order backend checks it.
  function bakeryToday() {
    try {
      var text = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    } catch (error) {}
    var now = new Date();
    return isoDay(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
  }
  function addDays(iso, days) {
    var parts = iso.split("-");
    return isoDay(new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2] + days)));
  }
  function readableDay(iso) {
    var parts = iso.split("-");
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2])));
  }
  function shipDateProblem(value, pickup) {
    var today = bakeryToday(),
      first = addDays(today, SHIP_DATE_MIN_DAYS),
      last = addDays(today, SHIP_DATE_MAX_DAYS);
    shipDateInput.min = first;
    shipDateInput.max = last;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
      return pickup ? "Choose your pickup day." : "Choose your ship day.";
    if (value < first)
      return "We need 48 hours to bake. The first open day is " + readableDay(first) + ".";
    if (value > last) return "Choose a day within the next " + SHIP_DATE_MAX_DAYS + " days.";
    var parts = value.split("-");
    if (!pickup && new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2])).getUTCDay() === 0)
      return "FedEx does not pick up on Sundays. Choose another day.";
    return "";
  }
  function updateShipDate() {
    var pickup = state.fulfil === "pickup";
    state.shipWhen = shipWhen();
    state.shipDate = "";
    state.shipDateLabel = "Within 48 hours";
    document.getElementById("shipWhenLegend").textContent = pickup
      ? "When will you pick up?"
      : "When should we ship?";
    document.getElementById("shipWhenDateTitle").textContent = pickup
      ? "Choose a pickup date"
      : "Choose a ship date";
    document.getElementById("shipDateLabel").textContent = pickup ? "Pickup date" : "Ship date";
    document.getElementById("shipDateReceiptLabel").textContent = pickup ? "Ready for pickup" : "Ships";
    shipDateBox.hidden = state.shipWhen !== "date";
    var problem = "";
    if (state.shipWhen === "date") {
      problem = shipDateProblem(shipDateInput.value, pickup);
      var touched = !!shipDateInput.value;
      shipDateInput.classList.toggle("is-error", !!problem && touched);
      shipDateMessage.classList.toggle("is-error", !!problem && touched);
      if (problem) {
        shipDateMessage.textContent = problem;
      } else {
        state.shipDate = shipDateInput.value;
        state.shipDateLabel = readableDay(state.shipDate);
        shipDateMessage.textContent = pickup
          ? "We'll have your cookies ready on " + state.shipDateLabel + "."
          : "Your box ships on " + state.shipDateLabel + ". Travel time starts that day.";
      }
    }
    document.getElementById("shipDateReceipt").textContent = problem
      ? "Choose a date"
      : state.shipDateLabel;
    var timing = document.getElementById("shippingTiming");
    if (timing)
      timing.textContent = state.shipDate
        ? "Baked fresh for your date. Travel time starts after shipping."
        : "Baked and shipped within 48 hours. Travel time starts after shipping.";
    return problem;
  }
  function zoneForZip(zip) {
    var number = parseInt(zip, 10);
    if (
      (number >= 600 && number <= 999) ||
      (number >= 96700 && number <= 96999) ||
      (number >= 99500 && number <= 99999)
    )
      return "remote";
    for (var i = 0; i < ZIP_ZONES.length; i++) {
      if (number >= ZIP_ZONES[i][0] && number <= ZIP_ZONES[i][1])
        return ZIP_ZONES[i][2];
    }
    return null;
  }
  function estimatedWeight(count) {
    return Math.ceil(3.5 + Math.max(0, count - 12) * 0.22);
  }
  function rateFor(zone, serviceName, weight) {
    if (!RATES[zone] || weight > 50) return null;
    var values = RATES[zone][serviceName],
      lowIndex = weight <= 15 ? 0 : 1,
      highIndex = lowIndex + 1;
    var lowWeight = RATE_WEIGHTS[lowIndex],
      highWeight = RATE_WEIGHTS[highIndex];
    var clamped = Math.max(lowWeight, Math.min(highWeight, weight));
    var ratio = (clamped - lowWeight) / (highWeight - lowWeight);
    return Math.round(
      values[lowIndex] + (values[highIndex] - values[lowIndex]) * ratio,
    );
  }
  function rebuildPhotoChoices(count) {
    var old = parseInt(photoCount.value, 10) || 1,
      max = Math.max(1, Math.floor(count / 12));
    photoCount.innerHTML = "";
    for (var i = 1; i <= max; i++) {
      var option = document.createElement("option");
      option.value = String(i);
      option.textContent = i + (i === 1 ? " photo" : " different photos");
      photoCount.appendChild(option);
    }
    photoCount.value = String(Math.min(old, max));
  }
  function setShippingMessage(text, isError) {
    shippingMessage.textContent = text;
    shippingMessage.classList.toggle("is-error", !!isError);
  }
  function update() {
    state.quantity = quantity();
    state.photos = parseInt(photoCount.value, 10) || 1;
    state.fulfil = fulfilment();
    state.zip = zipInput.value.replace(/\D/g, "").slice(0, 5);
    state.service = service();
    state.serviceLabel = SERVICE_NAMES[state.service];
    state.weight = estimatedWeight(state.quantity);
    state.subtotal = state.quantity * 5;
    state.zone = null;
    state.shipping = null;
    state.total = null;
    state.ready = false;
    var dateProblem = updateShipDate();
    qtyInput.value = String(state.quantity);
    zipInput.value = state.zip;
    cookieSubtotal.textContent = money(state.subtotal);

    if (state.fulfil === "pickup") {
      shippingBox.hidden = true;
      state.shipping = 0;
      state.total = state.subtotal;
      state.ready = !dateProblem;
      shippingPrice.textContent = "Free pickup";
      orderTotal.textContent = money(state.total);
      payLabel.textContent = dateProblem
        ? "Choose your pickup date"
        : "Pay " + money(state.total) + " — card or PayPal";
      window.dispatchEvent(
        new CustomEvent("mbc:quotechange", {
          detail: Object.assign({}, state),
        }),
      );
      return;
    }

    shippingBox.hidden = false;
    if (state.zip.length !== 5) {
      shippingOptions.hidden = true;
      shippingPrice.textContent = "Enter ZIP";
      orderTotal.textContent = money(state.subtotal) + " + shipping";
      payLabel.textContent = "Enter ZIP to see your total";
      setShippingMessage(
        "Enter five numbers to see your FedEx choices.",
        false,
      );
      window.dispatchEvent(
        new CustomEvent("mbc:quotechange", {
          detail: Object.assign({}, state),
        }),
      );
      return;
    }
    state.zone = zoneForZip(state.zip);
    if (state.zone === "remote") {
      shippingOptions.hidden = true;
      shippingPrice.textContent = "We confirm it";
      orderTotal.textContent = money(state.subtotal) + " + shipping";
      payLabel.textContent = "Ask us for the FedEx price";
      setShippingMessage(
        "We ship to Alaska, Hawaii, and Puerto Rico. Send an order request so we can price that box correctly.",
        true,
      );
      window.dispatchEvent(
        new CustomEvent("mbc:quotechange", {
          detail: Object.assign({}, state),
        }),
      );
      return;
    }
    if (!state.zone || state.weight > 50) {
      shippingOptions.hidden = true;
      shippingPrice.textContent = "We confirm it";
      orderTotal.textContent = money(state.subtotal) + " + shipping";
      payLabel.textContent = "Ask us for the FedEx price";
      setShippingMessage(
        state.weight > 50
          ? "This is a large shipment. Send an order request so we can price the boxes correctly."
          : "That ZIP needs a manual FedEx check.",
        true,
      );
      window.dispatchEvent(
        new CustomEvent("mbc:quotechange", {
          detail: Object.assign({}, state),
        }),
      );
      return;
    }

    ["ground", "twoDay", "overnight"].forEach(function (name) {
      var rate = rateFor(state.zone, name, state.weight);
      var node = document.querySelector('[data-rate="' + name + '"]');
      if (node) node.textContent = money(rate);
    });
    shippingOptions.hidden = false;
    state.shipping = rateFor(state.zone, state.service, state.weight);
    state.total = state.subtotal + state.shipping;
    state.ready = !dateProblem;
    shippingPrice.textContent = money(state.shipping);
    orderTotal.textContent = money(state.total);
    payLabel.textContent = dateProblem
      ? "Choose your ship date"
      : "Pay " + money(state.total) + " — card or PayPal";
    setShippingMessage(
      "FedEx price for this ZIP and about " +
        state.weight +
        " lb packed. No shipping markup.",
      false,
    );
    window.dispatchEvent(
      new CustomEvent("mbc:quotechange", { detail: Object.assign({}, state) }),
    );
  }
  function updateQuantity(next) {
    qtyInput.value = String(Math.max(12, Math.round(next || 12)));
    rebuildPhotoChoices(quantity());
    update();
  }

  qtyDown.addEventListener("click", function () {
    updateQuantity(quantity() - 1);
  });
  qtyUp.addEventListener("click", function () {
    updateQuantity(quantity() + 1);
  });
  qtyInput.addEventListener("change", function () {
    updateQuantity(quantity());
  });
  qtyInput.addEventListener("blur", function () {
    updateQuantity(quantity());
  });
  photoCount.addEventListener("change", update);
  zipInput.addEventListener("input", function () {
    zipInput.value = zipInput.value.replace(/\D/g, "").slice(0, 5);
    update();
  });
  document
    .querySelectorAll(
      'input[name="fulfil"], input[name="shippingService"], input[name="shipWhen"]',
    )
    .forEach(function (input) {
      input.addEventListener("change", update);
    });
  shipDateInput.addEventListener("input", update);
  shipDateInput.addEventListener("change", update);
  rebuildPhotoChoices(12);
  update();
  window.__mbcOrderPricing = {
    getState: function () {
      return Object.assign({}, state);
    },
    update: update,
    zoneForZip: zoneForZip,
    rateFor: rateFor,
  };
})();
