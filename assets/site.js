/* Continental Coffee — static showcase app (hash router, no build step). */
(function () {
  'use strict';

  var D = window.CC;
  var app = document.getElementById('app');
  if (!D || !app) {
    if (app) app.innerHTML = '<div class="wrap py-16 text-center font-vazir text-espresso">داده‌های سایت بارگذاری نشد.</div>';
    return;
  }

  /* ───────────────────────────── utils ───────────────────────────── */
  var FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  var faNum = function (v) { return String(v == null ? '' : v).replace(/[0-9]/g, function (d) { return FA[+d]; }); };
  var money = function (n) { return new Intl.NumberFormat('fa-IR').format(Number(n) || 0) + ' تومان'; };
  var moneyShort = function (n) {
    n = Number(n) || 0;
    if (n >= 1000000) return faNum((n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)) + ' میلیون';
    if (n >= 1000) return faNum(Math.round(n / 1000)) + ' هزار';
    return faNum(n);
  };
  var pricePerWeight = function (base, grams) {
    var table = { 100: 0.5, 250: 1, 500: 1.82, 1000: 3.4 };
    return Math.round((base * (table[grams] || 1)) / 1000) * 1000;
  };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var toFa = function (s) { return String(s).replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); }); };
  var uid = function () { return Math.random().toString(36).slice(2, 9); };
  var pad2 = function (n) { return String(n).padStart(2, '0'); };

  var products = D.products || [];
  var bySlug = {};
  products.forEach(function (p) { bySlug[p.slug] = p; });
  var categories = D.categories || [];
  var FREE = D.FREE_SHIPPING_OVER || 1500000;
  var giftPrice = function (key) {
    var g = (D.giftOptions || []).filter(function (x) { return x.key === key; })[0];
    return g ? g.price : 0;
  };
  var giftLabel = function (key) {
    var g = (D.giftOptions || []).filter(function (x) { return x.key === key; })[0];
    return g && key !== 'none' ? g.label : '';
  };
  var finding = function (slug) { return bySlug[slug] || products[0]; };

  /* ───────────────────────────── icons ───────────────────────────── */
  var P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    cart: '<path d="M4 5h2l2.2 11.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L22 8H7"/><circle cx="10" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronUp: '<path d="m6 15 6-6 6 6"/>',
    chevronLeft: '<path d="m15 6-6 6 6 6"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    arrowLeft: '<path d="M20 12H4"/><path d="m10 6-6 6 6 6"/>',
    arrowRight: '<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>',
    arrowUpLeft: '<path d="M17 17 7 7"/><path d="M7 15V7h8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    check: '<path d="m5 13 4 4L19 7"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>',
    heart: '<path d="M12 20s-7-4.3-9.2-8.4C1.2 8.4 3.3 5 6.7 5c2 0 3.3 1.1 4.3 2.4C12 6.1 13.3 5 15.3 5c3.4 0 5.5 3.4 3.9 6.6C19 15.7 12 20 12 20Z"/>',
    truck: '<path d="M3 17V6h11v11M14 9h4l3 4v4h-7"/><circle cx="7" cy="19" r="1.6"/><circle cx="18" cy="19" r="1.6"/>',
    flame: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2.5-5 .3 1.6 1 2.5 2 3 .8-2.5.5-5.5.5-8Z"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    cup: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9h2a3 3 0 0 1 0 6h-2"/><path d="M7 3c0 1 1 1.5 1 2.5M11 3c0 1 1 1.5 1 2.5"/>',
    leaf: '<path d="M20 4C10 4 4 9 4 16c0 2 1 4 1 4s2-7 10-9c-4 3-6 5-8 9"/><path d="M20 4c0 8-4 12-9 13"/>',
    handshake: '<path d="m4 12 4-4 3 3 3-3 2 2 4-2"/><path d="M4 12v5l5 3 3-2 3 2 5-3v-5"/><path d="m8 8 4-3 4 3"/>',
    gift: '<path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13"/><path d="M12 7c-3 0-5-1-5-2.5S9 3 12 7Zm0 0c3 0 5-1 5-2.5S15 3 12 7Z"/>',
    award: '<circle cx="12" cy="9" r="5"/><path d="m8 13-2 8 6-3 6 3-2-8"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9M4 5v4h4"/><path d="M4 13a8 8 0 0 0 14 4l2-2M20 19v-4h-4"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a1.5 1.5 0 0 1-1.7 1.5C10.5 19.7 4.3 13.5 3.5 5.7A1.5 1.5 0 0 1 5 4Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    map: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
    telegram: '<path d="m21 4-3 16-6-4-3 3-1-6L3 11l18-7Z"/>',
    whatsapp: '<path d="M20 12a8 8 0 0 1-12 7L4 20l1-4a8 8 0 1 1 15-4Z"/><path d="M9 9c0 3 3 6 6 6 1 0 1-1 1-1.5s-1.5-.7-2-1c-.5.5-1 .7-1.5.5S10 12 9.5 11c0-.5.5-1 1-1 .2 0 .5-.5.5-1S10 8 9.5 8 9 8 9 9Z"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M7 7v.1M11 17v-4a2 2 0 0 1 4 0v4M11 10v7"/>',
    send: '<path d="m21 3-7 18-3-7-8-4 18-7Z"/><path d="m11 14 5-5"/>',
    sparkles: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.7 1.8L7.5 16.5l-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7L5 14Z"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    box: '<path d="m12 3 8 4v10l-8 4-8-4V7l8-4Z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-5 3 3 5-7"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.8-3.4 3.2-5 6-5s5.2 1.6 6 5"/><path d="M16 5.5a3.2 3.2 0 0 1 0 5.9M18 15c2 .5 3.2 2 3.7 5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.5-2-3.3-2.3 1a7 7 0 0 0-2.7-1.6L15.5 2h-4l-.3 2.9A7 7 0 0 0 8.5 6.5l-2.3-1-2 3.3 2 1.5A7 7 0 0 0 6 12c0 .6 0 1.1.2 1.6l-2 1.5 2 3.3 2.3-1a7 7 0 0 0 2.7 1.6l.3 2.9h4l.3-2.9a7 7 0 0 0 2.7-1.6l2.3 1 2-3.3-2-1.5c.1-.5.2-1 .2-1.6Z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-4 1 2-5 4-1Z"/>',
    store: '<path d="M4 9h16v11H4zM3 9l2-5h14l2 5"/><path d="M9 20v-6h6v6"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
    download: '<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 21h16"/>',
    edit: '<path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z"/><path d="m14 7 3 3"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    bell: '<path d="M18 9a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2"/>',
    play: '<path d="M8 5v14l11-7L8 5Z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5Z"/><path d="M8 3v18M11 8h5M11 12h5"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    quote: '<path d="M7 7h4v5H7a3 3 0 0 0 3 3M14 7h4v5h-4a3 3 0 0 0 3 3"/>',
    pin: '<circle cx="12" cy="10" r="3"/><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/>',
    coffee: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9h2a3 3 0 0 1 0 6h-2"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
    tag: '<path d="m20 13-7 7-9-9V4h7l9 9Z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5M3 17l9 5 9-5"/>',
    scale: '<path d="M12 3v18M5 21h14"/><path d="M12 6 5 9l3 5 4-8Zm0 0 7 3-3 5-4-8Z"/>',
    fruit: '<circle cx="12" cy="13" r="6"/><path d="M12 7c0-2 1-3 3-4M12 7c-1-1.5-2-2-3.5-2"/>',
    balance: '<path d="M12 4v16M5 20h14"/><path d="M4 8h16M4 8l-2 5h4L4 8Zm16 0-2 5h4l-2-5Z"/>',
    chocolate: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 10h16M4 15h16M10 4v16M15 4v16"/>',
    press: '<path d="M7 4h10v6H7zM9 10v4M15 10v4M9 14h6l-1 7h-4l-1-7Z"/>',
    bolt: '<path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
    list: '<path d="M4 6h16M4 12h16M4 18h10"/>'
  };
  var FILLED = { star: 1, heart: 1, play: 1 };
  function icon(name, size, cls, sw) {
    var d = P[name] || P.sparkles;
    size = size || 20;
    if (FILLED[name]) {
      return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" class="' + (cls || '') + '" aria-hidden="true">' + d + '</svg>';
    }
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.65) + '" stroke-linecap="round" stroke-linejoin="round" class="' + (cls || '') + '" aria-hidden="true">' + d + '</svg>';
  }
  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      var name = el.getAttribute('data-icon');
      var size = Number(el.getAttribute('data-size') || 20);
      el.innerHTML = icon(name, size);
      el.removeAttribute('data-icon');
    });
  }

  var stars = function (n, size) {
    size = size || 11;
    var full = Math.round(Number(n) || 0);
    var out = '<span class="inline-flex items-center gap-0.5 text-gold" aria-hidden="true">';
    for (var i = 0; i < 5; i++) out += '<span class="' + (i < full ? 'opacity-100' : 'opacity-25') + '">' + icon('star', size) + '</span>';
    return out + '</span>';
  };

  /* ───────────────────────────── storage ───────────────────────────── */
  var K = { cart: 'cc.cart.v1', wish: 'cc.wish.v1', orders: 'cc.orders.v1' };
  function read(k, fb) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; }
  }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var cart = read(K.cart, []);
  var wish = read(K.wish, []);
  var orders = read(K.orders, []);
  if (!Array.isArray(cart)) cart = [];
  if (!Array.isArray(wish)) wish = [];
  if (!Array.isArray(orders)) orders = [];

  function cartCount() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function cartSubtotal() { return cart.reduce(function (s, i) { return s + i.unitPrice * i.qty; }, 0); }
  function saveCart() { write(K.cart, cart); syncCartBadge(); }
  function addToCart(o) {
    var p = bySlug[o.slug];
    if (!p) return;
    var weight = p.slug === 'gift-trio-box' ? 250 : Number(o.weight || 250);
    var grind = o.grind || 'دانه کامل';
    var gift = o.gift || 'none';
    var unit = p.slug === 'gift-trio-box' ? p.price : pricePerWeight(p.price, weight) + giftPrice(gift);
    var key = [p.slug, weight, grind, gift].join('|');
    var found = cart.filter(function (i) { return i.key === key; })[0];
    if (found) found.qty += Number(o.qty || 1);
    else cart.push({ key: key, slug: p.slug, name: p.name, image: p.image, weight: weight, grind: grind, gift: gift, qty: Number(o.qty || 1), unitPrice: unit });
    saveCart();
    renderCartDrawer();
    toast(p.name + ' به سبد اضافه شد');
    openLayer('cart');
  }
  function setQty(key, q) {
    cart = cart.map(function (i) { return i.key === key ? Object.assign({}, i, { qty: Math.max(0, q) }) : i; }).filter(function (i) { return i.qty > 0; });
    saveCart();
    renderCartDrawer();
    if (currentPath() === '/cart') render();
  }
  function removeItem(key) {
    cart = cart.filter(function (i) { return i.key !== key; });
    saveCart();
    renderCartDrawer();
    if (currentPath() === '/cart') render();
    toast('محصول از سبد حذف شد', 'trash');
  }
  function toggleWish(slug) {
    var has = wish.indexOf(slug) >= 0;
    wish = has ? wish.filter(function (s) { return s !== slug; }) : wish.concat(slug);
    write(K.wish, wish);
    document.querySelectorAll('[data-wish="' + slug + '"]').forEach(function (b) {
      b.classList.toggle('is-on', !has);
      b.setAttribute('aria-pressed', String(!has));
    });
    toast(has ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد', 'heart');
  }

  /* ───────────────────────────── layers / toast ───────────────────────────── */
  var LAYERS = { mobile: 'mobile-menu', search: 'search-overlay', cart: 'cart-layer' };
  function openLayer(name) {
    var el = document.getElementById(LAYERS[name]);
    if (!el) return;
    Object.keys(LAYERS).forEach(function (k) {
      if (k === name) return;
      var other = document.getElementById(LAYERS[k]);
      if (other) { other.classList.remove('is-open'); other.setAttribute('aria-hidden', 'true'); }
    });
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cc-lock');
    if (name === 'search') setTimeout(function () { var i = document.getElementById('search-input'); if (i) i.focus(); }, 180);
  }
  function closeLayers() {
    Object.keys(LAYERS).forEach(function (k) {
      var el = document.getElementById(LAYERS[k]);
      if (el) { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); }
    });
    document.body.classList.remove('cc-lock');
  }
  var toastTimer;
  function toast(msg, ic) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.innerHTML = icon(ic || 'check', 16, 'text-goldl') + '<span>' + esc(msg) + '</span>';
    el.classList.remove('hidden');
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-on');
      setTimeout(function () { el.classList.add('hidden'); }, 250);
    }, 2600);
  }

  /* ───────────────────────────── cart drawer ───────────────────────────── */
  function renderCartDrawer() {
    var body = document.getElementById('cart-body');
    var foot = document.getElementById('cart-footer');
    var sub = document.getElementById('cart-subtitle');
    if (!body || !foot) return;
    var total = cartSubtotal();
    var n = cartCount();
    if (sub) sub.textContent = n ? faNum(n) + ' قلم کالا' : 'خالی';
    if (!cart.length) {
      body.innerHTML = '<div class="flex h-full flex-col items-center justify-center gap-4 py-14 text-center">' +
        '<span class="cc-empty-ring">' + icon('cart', 30) + '</span>' +
        '<div><p class="font-vazir text-[13.5px] font-black text-espresso">سبد خرید خالی است</p>' +
        '<p class="mt-1 font-vazir text-[11px] text-muted">از فروشگاه، قهوه تازه‌رست انتخاب کنید.</p></div>' +
        '<a href="#/shop" data-close="cart" class="btn btn-dark btn-sm">' + icon('bag', 15) + ' رفتن به فروشگاه</a></div>';
      foot.innerHTML = '<p class="text-center font-vazir text-[10px] text-muted">ارسال رایگان برای سفارش‌های بالای ' + money(FREE) + '</p>';
      syncCartBadge();
      return;
    }
    body.innerHTML = cart.map(function (i) {
      var meta = (i.weight ? faNum(i.weight) + ' گرم' : '') + (i.grind ? ' · ' + i.grind : '') + (i.gift && i.gift !== 'none' ? ' · ' + giftLabel(i.gift) : '');
      return '<div class="flex gap-3 border-b border-line/70 py-3.5 last:border-0">' +
        '<div class="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-[#fdf8ee] to-[#eadfca]"><img src="' + i.image + '" alt="' + esc(i.name) + '" class="h-full w-full object-contain p-1.5" /></div>' +
        '<div class="min-w-0 flex-1">' +
          '<div class="flex items-start justify-between gap-2"><p class="font-vazir text-[12.5px] font-black text-espresso">' + esc(i.name) + '</p>' +
          '<button type="button" data-cart-remove="' + i.key + '" aria-label="حذف" class="text-espresso/35 transition hover:text-wine">' + icon('trash', 15) + '</button></div>' +
          '<p class="mt-1 font-vazir text-[9.5px] text-muted">' + meta + '</p>' +
          '<div class="mt-2 flex items-center justify-between gap-2">' +
            '<div class="inline-flex items-center rounded-full border border-line bg-paper">' +
              '<button type="button" data-cart-dec="' + i.key + '" class="grid h-8 w-8 place-items-center text-espresso/70" aria-label="کم کردن">' + icon('minus', 13) + '</button>' +
              '<span class="min-w-6 text-center font-vazir text-[11px] font-black">' + faNum(i.qty) + '</span>' +
              '<button type="button" data-cart-inc="' + i.key + '" class="grid h-8 w-8 place-items-center text-espresso/70" aria-label="افزودن">' + icon('plus', 13) + '</button>' +
            '</div>' +
            '<span class="font-vazir text-[11.5px] font-black text-espresso">' + money(i.unitPrice * i.qty) + '</span>' +
          '</div>' +
        '</div></div>';
    }).join('');
    var pct = Math.min(100, Math.round((total / FREE) * 100));
    foot.innerHTML =
      '<div class="mb-3">' +
        '<div class="mb-1.5 flex items-center justify-between font-vazir text-[9.5px]"><span class="text-muted">' + (total >= FREE ? 'ارسال رایگان فعال شد' : 'تا ارسال رایگان ' + money(Math.max(0, FREE - total))) + '</span><span class="font-bold text-[#8a6634]">' + faNum(pct) + '٪</span></div>' +
        '<div class="h-1.5 overflow-hidden rounded-full bg-line/70"><div class="h-full rounded-full bg-gradient-to-l from-[#b08d57] to-[#8a6634]" style="width:' + pct + '%"></div></div>' +
      '</div>' +
      '<div class="flex items-center justify-between font-vazir"><span class="text-[11px] text-muted">جمع سبد</span><span class="text-[14px] font-black text-espresso">' + money(total) + '</span></div>' +
      '<a href="#/checkout" data-close="cart" class="btn btn-dark mt-3 w-full">تکمیل خرید ' + icon('arrowLeft', 16) + '</a>' +
      '<a href="#/cart" data-close="cart" class="mt-2 block text-center font-vazir text-[10.5px] font-bold text-espresso/55 transition hover:text-espresso">مشاهده جزئیات سبد</a>';
    syncCartBadge();
  }
  function syncCartBadge() {
    var badge = document.getElementById('cart-count');
    if (!badge) return;
    var n = cartCount();
    badge.textContent = faNum(n);
    badge.classList.toggle('hidden', n === 0);
  }

  /* ───────────────────────────── product card ───────────────────────────── */
  function productCard(p, compact) {
    if (!p) return '';
    var wished = wish.indexOf(p.slug) >= 0;
    var tone = p.roastKey === 'dark' ? 'from-[#efe3d0] via-[#f6eddd] to-[#e7d8c1]' : 'from-[#fdf8ee] via-[#f8efe0] to-[#eadfca]';
    return '<article class="group card-3d tilt-card relative overflow-hidden rounded-[26px] p-2.5">' +
      '<a href="#/product/' + p.slug + '" class="block">' +
        '<div class="relative overflow-hidden rounded-[20px] bg-gradient-to-b ' + tone + ' ' + (compact ? 'aspect-square' : 'aspect-[4/5]') + '">' +
          '<div class="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,.9),transparent_45%)]"></div>' +
          '<div class="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-2/3 -translate-x-1/2 rounded-full bg-espresso/20 blur-xl"></div>' +
          '<img src="' + p.image + '" alt="' + esc(p.name) + '" loading="lazy" class="cc-prod-img relative h-full w-full object-contain p-5" />' +
          (p.badge ? '<span class="absolute right-3 top-3 rounded-full bg-choco/90 px-2.5 py-1 font-vazir text-[10px] font-extrabold text-goldxl shadow-lg backdrop-blur">' + esc(p.badge) + '</span>' : '') +
          '<button type="button" data-wish="' + p.slug + '" aria-pressed="' + wished + '" aria-label="' + (wished ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها') + '" class="cc-wish ' + (wished ? 'is-on' : '') + ' absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-line/70 bg-paper/80 text-espresso/60 backdrop-blur transition hover:text-wine">' + icon('heart', 14) + '</button>' +
          '<div class="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-between gap-2 rounded-2xl border border-white/50 bg-paper/85 px-3 py-2 opacity-0 shadow-soft backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">' +
            '<span class="font-vazir text-[10.5px] font-bold text-espresso/70">' + esc((D.ROAST_LABEL || {})[p.roastKey] || '') + ' · ' + esc(p.process || '') + '</span>' +
            '<span class="flex items-center gap-1 font-vazir text-[10.5px] font-extrabold text-[#8a6634]">مشاهده ' + icon('arrowLeft', 12) + '</span>' +
          '</div>' +
        '</div></a>' +
      '<div class="px-2.5 pb-2 pt-4">' +
        '<div class="flex items-center justify-between gap-2">' +
          '<span class="font-vazir text-[10px] font-extrabold tracking-wide text-gold">' + esc(p.country === 'ترکیبی' ? 'بلند امضا' : p.region) + '</span>' +
          '<span class="flex items-center gap-1 font-vazir text-[10.5px] font-bold text-espresso/70">' + icon('star', 11, 'text-gold') + faNum((p.rating || 0).toFixed(1).replace('.', '٫')) + '</span>' +
        '</div>' +
        '<a href="#/product/' + p.slug + '"><h3 class="mt-1.5 font-vazir text-[16.5px] font-black leading-7 text-espresso transition group-hover:text-[#8a6634]">' + esc(p.name) + '</h3></a>' +
        '<p class="mt-0.5 truncate font-vazir text-[11px] text-muted">' + esc((p.notes || []).join(' · ')) + '</p>' +
        '<div class="mt-3.5 flex items-end justify-between gap-2">' +
          '<div><div class="font-vazir text-[15px] font-black text-espresso">' + money(p.price) + '</div><div class="font-vazir text-[10px] text-muted">/ ' + faNum(250) + ' گرم</div></div>' +
          '<button type="button" data-add="' + p.slug + '" data-weight="250" data-gift="none" aria-label="افزودن ' + esc(p.name) + ' به سبد" class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-choco text-goldxl shadow-[0_8px_18px_-8px_rgba(43,29,22,.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-espresso">' + icon('plus', 18) + '</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function sectionHead(o) {
    return '<div class="' + (o.center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl') + '">' +
      '<span class="eyebrow">' + esc(o.eyebrow) + '</span>' +
      '<h2 class="display-2 mt-3">' + o.title + '</h2>' +
      (o.desc ? '<p class="mt-3 font-vazir text-[12.5px] leading-7 text-muted">' + esc(o.desc) + '</p>' : '') +
    '</div>';
  }
  function headRow(o) {
    return '<div class="mb-8 flex flex-wrap items-end justify-between gap-4">' + sectionHead(o) +
      (o.href ? '<a href="' + o.href + '" class="link-gold !text-[11.5px]">' + esc(o.linkLabel || 'مشاهده همه') + ' ' + icon('arrowLeft', 14) + '</a>' : '') + '</div>';
  }

  /* ───────────────────────────── home ───────────────────────────── */
  function viewHome() {
    var featured = ['ethiopia-yirgacheffe', 'colombia-huila', 'continental-house-blend', 'panama-geisha'].map(finding);
    var t = D.testimonials || [];
    var offer = bySlug['continental-house-blend'] || products[0];
    return '' +
    '<section class="cc-hero relative overflow-hidden">' +
      '<div class="cc-hero-ring" style="right:-160px;top:40px;width:520px;height:520px"></div>' +
      '<div class="cc-hero-ring" style="right:-96px;top:96px;width:380px;height:380px"></div>' +
      '<div class="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-olive/10 blur-3xl"></div>' +
      '<div class="wrap relative grid items-center gap-10 pb-14 pt-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-6 lg:pb-20 lg:pt-14">' +
        '<div class="relative z-10">' +
          '<div class="flex items-center gap-3">' +
            '<span class="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-paper/70 px-3 py-1 font-vazir text-[10px] font-extrabold text-[#8a6634] backdrop-blur"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>رست تازه این هفته آماده است</span>' +
            '<span class="hidden font-script text-[22px] leading-none text-gold sm:block">For Valuable Moments</span>' +
          '</div>' +
          '<h1 class="display-1 mt-5 text-espresso">طعمِ قاره‌ها،<span class="mt-1 block">در یک <span class="gold-text">فنجان.</span></span></h1>' +
          '<p class="mt-6 max-w-xl font-vazir text-[13.5px] leading-9 text-muted sm:text-[14.5px]">دانه‌های اسپشیالتی از مزارع منتخب چهار قاره؛ رست‌شده در شیراز، با تاریخ رست روی هر بسته، داستان خاستگاه و مشاوری که سلیقه‌تان را می‌شناسد.</p>' +
          '<div class="mt-8 flex flex-wrap items-center gap-3">' +
            '<a href="#/shop" class="btn btn-dark btn-lg">کشف قهوه‌ها ' + icon('arrowLeft', 18) + '</a>' +
            '<a href="#/guide" class="btn btn-outline btn-lg">' + icon('compass', 17) + ' راهنمای انتخاب</a>' +
          '</div>' +
          '<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">' +
            '<div class="flex items-center gap-2.5">' +
              '<div class="flex -space-x-2 space-x-reverse">' +
                t.slice(0, 3).map(function (x) { return '<span class="grid h-8 w-8 place-items-center rounded-full border-2 border-cream bg-gradient-to-br from-goldl to-gold font-vazir text-[8.5px] font-black text-choco">' + esc(x.initials) + '</span>'; }).join('') +
                '<span class="grid h-8 w-8 place-items-center rounded-full border-2 border-cream bg-espresso font-vazir text-[6.5px] font-black tracking-tighter text-cream">+۴۸٬۰۰۰</span>' +
              '</div>' +
              '<div>' + stars(4.9, 11) + '<p class="mt-0.5 font-vazir text-[9.5px] text-muted">۴٫۹ از ۴٬۲۰۰ نظر</p></div>' +
            '</div>' +
            '<span class="hidden h-8 w-px bg-line sm:block"></span>' +
            '<div class="flex items-center gap-2 font-vazir text-[10.5px] font-bold text-espresso/70">' + icon('shield', 16, 'text-olive') + ' ضمانت اصالت و تازگی</div>' +
          '</div>' +
        '</div>' +
        '<div class="relative">' +
          '<div class="cc-stage">' +
            '<div class="cc-steam"></div><div class="cc-steam"></div><div class="cc-steam"></div>' +
            '<img src="assets/img/bag-cream.png" alt="بسته قهوه کانتیننتال" class="cc-hero-bag relative z-10" />' +
            '<img src="assets/img/seal.png" alt="" class="cc-hero-seal absolute -left-1 top-4 z-20 sm:left-2" />' +
            '<img src="assets/img/medal-bean.png" alt="" class="absolute bottom-4 right-0 z-20 w-16 object-contain drop-shadow-[0_12px_14px_rgba(43,29,22,.3)] sm:w-24" />' +
            '<div class="cc-float-card left-0 top-8 z-20"><div class="lbl">تاریخ رست</div><div class="val">۱۴۰۴/۰۸/۱۴</div></div>' +
            '<div class="cc-float-card bottom-8 right-0 z-20 hidden sm:block"><div class="lbl">امتیاز SCA</div><div class="val">۹۳ / ۱۰۰</div></div>' +
          '</div>' +
          '<div class="mt-3 grid grid-cols-3 gap-2">' +
            [['۴۸٬۶۰۰+', 'مشتری همراه'], ['۳۸', 'خاستگاه'], ['۱۲+', 'سال رست']].map(function (x) {
              return '<div class="rounded-2xl border border-line/70 bg-paper/70 px-2 py-2.5 text-center backdrop-blur"><div class="font-vazir text-[15px] font-black text-espresso">' + x[0] + '</div><div class="mt-0.5 font-vazir text-[9px] text-muted">' + x[1] + '</div></div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="wrap relative pb-10">' +
        '<div class="card-3d grid grid-cols-2 gap-y-4 rounded-3xl px-4 py-5 sm:grid-cols-4 sm:px-6">' +
          (D.features || []).map(function (f) {
            return '<div class="flex items-center gap-3 px-1"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-goldxl/60 to-gold/20 text-[#8a6634]">' + icon(f.icon, 18) + '</span><span><span class="block font-vazir text-[11.5px] font-extrabold text-espresso">' + esc(f.title) + '</span><span class="mt-0.5 block font-vazir text-[9.5px] text-muted">' + esc(f.text) + '</span></span></div>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section-tight border-y border-line/70 bg-gradient-to-b from-[#faf4e8] to-cream">' +
      '<div class="wrap">' +
        headRow({ eyebrow: 'قهوه‌های منتخب', title: 'چهار فنجان برای شروع', desc: 'از روشن و گلی تا شکلاتی و پربادی؛ هر کدام با تاریخ رست تازه و پروفایل طعم شفاف.', href: '#/shop' }) +
        '<div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">' + featured.map(function (p, i) { return '<div class="reveal" style="--d:' + i * 90 + 'ms">' + productCard(p) + '</div>'; }).join('') + '</div>' +
        '<div class="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/70 bg-paper/60 px-4 py-3"><p class="font-vazir text-[11px] font-bold text-espresso/70">نمی‌دانید از کجا شروع کنید؟ <span class="text-muted">سه سؤال کوتاه، پیشنهاد دقیق می‌دهد.</span></p><a href="#/guide" class="link-gold !text-[11.5px]">آزمون انتخاب قهوه ' + icon('arrowLeft', 14) + '</a></div>' +
      '</div>' +
    '</section>' +

    '<section class="relative overflow-hidden bg-choco py-16 grain sm:py-20">' +
      '<div class="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-wine/20 blur-3xl"></div>' +
      '<div class="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl"></div>' +
      '<div class="wrap relative grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">' +
        '<div class="on-dark">' +
          '<span class="eyebrow">پیشنهاد امروز</span>' +
          '<h2 class="display-2 mt-3 text-cream">بلند خانه؛ با ۱۵٪ تخفیف تا پایان امشب.</h2>' +
          '<p class="mt-3 max-w-lg font-vazir text-[12.5px] leading-7 text-cream/60">ترکیب ۵۰٪ برزیل، ۳۰٪ کلمبیا و ۲۰٪ اتیوپی؛ تعادلی که هر روز جواب می‌دهد. رست تازه این هفته با ارسال رایگان.</p>' +
          '<div class="mt-6 flex items-center gap-3" dir="ltr"><span data-countdown class="cc-num rounded-2xl border border-goldl/25 bg-white/5 px-4 py-3 font-vazir text-[20px] font-black text-goldxl">۰۰:۰۰:۰۰</span><span class="font-vazir text-[10px] text-cream/45">ساعت تا پایان</span></div>' +
          '<div class="mt-6 flex flex-wrap items-center gap-4">' +
            '<div><div class="font-vazir text-[11px] text-cream/45 line-through">' + money(offer.price) + '</div><div class="font-vazir text-[22px] font-black text-goldxl">' + money(Math.round(offer.price * 0.85 / 1000) * 1000) + '</div></div>' +
            '<button type="button" data-add="' + offer.slug + '" data-weight="250" data-gift="none" class="btn btn-gold">' + icon('plus', 17) + ' افزودن به سبد</button>' +
          '</div>' +
        '</div>' +
        '<div class="relative flex items-center justify-center">' +
          '<div class="absolute h-64 w-64 rounded-full bg-gold/15 blur-3xl"></div>' +
          '<img src="' + offer.image + '" alt="' + esc(offer.name) + '" class="relative w-[62%] max-w-[300px] drop-shadow-[0_36px_40px_rgba(0,0,0,.55)]" />' +
          '<span class="absolute right-2 top-2 rounded-full border border-goldl/30 px-3 py-1 font-vazir text-[9px] font-bold text-goldl">تخفیف محدود</span>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap">' +
        headRow({ eyebrow: 'مسیرهای کشف', title: 'از کجا شروع می‌کنی؟', desc: 'خاستگاه، رست یا حال‌وهوای فنجان؛ مسیر خودت را انتخاب کن.', href: '#/shop', linkLabel: 'همه محصولات' }) +
        '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">' +
          (D.categories || []).map(function (cat, i) {
            var tones = ['from-[#fdf8ee] to-[#ebddc5]', 'from-[#f5eae2] to-[#e3cfc3]', 'from-[#f0ead9] to-[#d9c9ab]', 'from-[#eff0e3] to-[#d5dbc0]'];
            return '<a href="#/shop?category=' + cat.slug + '" class="group relative block overflow-hidden rounded-[26px] border border-line/80 bg-gradient-to-br ' + tones[i % 4] + ' p-4 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">' +
              '<div class="flex items-start justify-between"><span class="font-vazir text-[9px] font-extrabold tracking-[0.18em] text-[#8a6634]">' + esc(cat.en) + '</span><span class="grid h-7 w-7 place-items-center rounded-full border border-espresso/15 text-espresso/50 transition group-hover:border-gold group-hover:text-espresso">' + icon('arrowUpLeft', 13) + '</span></div>' +
              '<div class="relative mt-2 h-[150px]"><img src="' + cat.image + '" alt="' + esc(cat.name) + '" loading="lazy" class="cc-prod-img h-full w-full object-contain p-2" /></div>' +
              '<h3 class="mt-2 font-vazir text-[15px] font-black text-espresso">' + esc(cat.name) + '</h3><p class="mt-1 font-vazir text-[10.5px] text-espresso/55">' + esc(cat.desc) + '</p></a>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section relative overflow-hidden">' +
      '<div class="wrap grid items-center gap-12 lg:grid-cols-[.95fr_1.05fr]">' +
        '<div class="reveal relative mx-auto w-full max-w-[470px]">' +
          '<div class="absolute -inset-4 rounded-[36px] border border-gold/25"></div>' +
          '<div class="relative grid grid-cols-2 gap-3 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#fdf7ea] via-[#f2e6d2] to-[#e2d0b4] p-6 shadow-lift">' +
            '<div class="relative col-span-2 flex h-[190px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#4a3226] to-[#241812]"><img src="assets/img/bag-dark.png" alt="بسته قهوه" class="h-[92%] w-auto drop-shadow-[0_20px_25px_rgba(0,0,0,.45)]" /><img src="assets/img/seal.png" alt="" class="absolute -left-2 bottom-2 w-16 animate-spin-slow opacity-90" /><span class="absolute right-3 top-3 rounded-full border border-goldl/30 px-2 py-0.5 font-serif text-[8px] uppercase tracking-[0.2em] text-goldl">Since 2013</span></div>' +
            '<div class="flex h-[150px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#fdf8ee] to-[#eedfc8]"><img src="assets/img/cup-crema.png" alt="فنجان اسپرسو" class="h-[88%] w-auto object-contain drop-shadow-[0_14px_14px_rgba(43,29,22,.25)]" /></div>' +
            '<div class="flex h-[150px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#f3f1e6] to-[#dfe2cd]"><img src="assets/img/medal-cup.png" alt="مدال کیفیت" class="h-[86%] w-auto object-contain drop-shadow-[0_14px_14px_rgba(43,29,22,.25)]" /></div>' +
          '</div>' +
          '<div class="absolute -bottom-5 -right-3 rounded-2xl border border-gold/30 bg-paper px-4 py-3 shadow-lift"><div class="font-vazir text-[20px] font-black text-espresso">' + faNum(12) + '<span class="text-gold">+</span></div><div class="font-vazir text-[9px] text-muted">سال رست تخصصی</div></div>' +
        '</div>' +
        '<div>' + sectionHead({ eyebrow: 'داستان کانتیننتال', title: 'قهوه را جدی می‌گیریم؛ اما نه آن‌قدر که فنجان را فراموش کنیم.', desc: 'از یک دستگاه رست یک‌کیلویی در انباری کوچک شروع کردیم. امروز، هر بچ را در شیراز رست می‌کنیم، با کشاورزانی کار می‌کنیم که می‌شناسیم و تاریخ رست را روی هر بسته مهر می‌زنیم.' }) +
          '<div class="mt-7 grid gap-4 sm:grid-cols-2">' + (D.values || []).map(function (v) {
            return '<div class="flex gap-3"><span class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-goldxl/20 text-[#8a6634]">' + icon(v.icon, 16) + '</span><div><h3 class="font-vazir text-[12.5px] font-extrabold text-espresso">' + esc(v.title) + '</h3><p class="mt-1 font-vazir text-[10.5px] leading-6 text-muted">' + esc(v.text) + '</p></div></div>';
          }).join('') + '</div>' +
          '<div class="mt-8 flex flex-wrap items-center gap-4"><a href="#/about" class="btn btn-dark btn-sm">داستان کامل ما ' + icon('arrowLeft', 15) + '</a><span class="font-script text-[26px] text-gold">Brewed with care</span></div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section-tight relative overflow-hidden bg-gradient-to-b from-cream via-[#f2e9da] to-cream">' +
      '<div class="wrap">' +
        '<div class="mb-9 flex flex-wrap items-end justify-between gap-4">' + sectionHead({ eyebrow: 'حرف‌های مشتریان', title: 'فنجانی که دوباره سفارش می‌شود', desc: 'بیش از ۴٬۲۰۰ نظر ثبت‌شده؛ این‌ها چند نمونه از میان آن‌هاست.' }) +
          '<div class="flex items-center gap-2 rounded-full border border-gold/25 bg-paper/70 px-3.5 py-2">' + stars(4.9, 12) + '<span class="font-vazir text-[10.5px] font-bold text-espresso/70">۴٫۹ از ۵</span></div></div>' +
        '<div class="relative rounded-[30px] border border-line/80 bg-paper/80 p-6 shadow-soft sm:p-9">' + icon('quote', 30, 'text-gold/40') +
          '<div id="testi-body" class="mt-4 min-h-[150px]"></div>' +
          '<div class="mt-5 flex items-center justify-between"><button type="button" data-t-prev class="grid h-10 w-10 place-items-center rounded-full border border-line bg-paper text-espresso/60 transition hover:border-gold hover:text-espresso" aria-label="قبلی">' + icon('arrowRight', 18) + '</button><div id="testi-dots" class="flex gap-1.5"></div><button type="button" data-t-next class="grid h-10 w-10 place-items-center rounded-full border border-line bg-paper text-espresso/60 transition hover:border-gold hover:text-espresso" aria-label="بعدی">' + icon('arrowLeft', 18) + '</button></div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section-tight border-y border-line/70 bg-[#fbf6eb]">' +
      '<div class="wrap"><div class="mb-8 flex flex-wrap items-center justify-between gap-3"><span class="eyebrow">کانتیننتال در یک نگاه</span><span class="font-vazir text-[10px] text-muted">آخرین به‌روزرسانی: امروز</span></div>' +
        '<div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">' + (D.stats || []).map(function (s) {
          return '<div class="card-3d rounded-2xl px-4 py-5 text-center"><div class="font-vazir text-[26px] font-black text-espresso">' + faNum(s.value.toLocaleString ? s.value.toLocaleString('fa-IR') : s.value) + '<span class="text-gold">' + esc(s.suffix || '') + '</span></div><div class="mt-1 font-vazir text-[11px] font-extrabold text-espresso/70">' + esc(s.label) + '</div><div class="mt-0.5 font-vazir text-[9px] text-muted">' + esc(s.sub) + '</div></div>';
        }).join('') + '</div></div>' +
    '</section>' +

    '<section class="relative overflow-hidden bg-[#1d1410] py-16 grain sm:py-20">' +
      '<div class="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl"></div>' +
      '<div class="wrap relative grid items-center gap-10 lg:grid-cols-[1fr_.9fr]">' +
        '<div>' + sectionHead({ dark: true, eyebrow: 'پشت صحنه رستری', title: 'یک روز در کانتیننتال', desc: 'از کاپینگ دانه خام تا فنجانی که به دست شما می‌رسد؛ هر مرحله را می‌بینید.' }) +
          '<div class="on-dark mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">' + ['کاپینگ روزانه', 'رست هفتگی', 'بسته‌بندی دستی', 'ارسال سراسری', 'کنترل کیفیت', 'آزمایشگاه طعم'].map(function (x) {
            return '<span class="rounded-xl border border-cream/10 bg-white/5 px-3 py-2.5 font-vazir text-[10.5px] font-bold text-cream/65">' + x + '</span>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="group relative overflow-hidden rounded-[28px] border border-cream/10 bg-gradient-to-br from-[#3b271c] to-[#17110d] p-4">' +
          '<div class="relative h-[260px] overflow-hidden rounded-2xl"><img src="assets/img/beans.png" alt="دانه‌های قهوه" class="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105" /><div class="absolute inset-0 bg-gradient-to-t from-[#17110d] via-transparent to-transparent"></div>' +
          '<button type="button" data-toast="ویدئوی پشت صحنه در نسخه نمایشی استاتیک در دسترس نیست" class="absolute inset-0 grid place-items-center"><span class="grid h-16 w-16 place-items-center rounded-full border border-goldl/40 bg-ink/50 text-goldxl backdrop-blur transition hover:scale-110">' + icon('play', 22) + '</span></button></div>' +
          '<div class="flex items-center justify-between px-2 py-3"><span class="font-vazir text-[10.5px] text-cream/55">فیلم کوتاه رستری · ۲:۴۰</span><span class="font-script text-[20px] text-goldl">Our craft</span></div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap">' + headRow({ eyebrow: 'مرکز دانش قهوه', title: 'تازه‌های وبلاگ', desc: 'راهنما، داستان و آموزش؛ برای اینکه فنجان بعدی‌تان بهتر باشد.', href: '#/blog' }) +
        '<div class="grid gap-4 sm:gap-5 md:grid-cols-3">' + (D.posts || []).slice(0, 3).map(function (post, i) {
          return '<a href="#/blog/' + post.slug + '" class="group card-3d reveal block overflow-hidden rounded-[26px]" style="--d:' + i * 90 + 'ms"><div class="relative aspect-[16/11] overflow-hidden bg-gradient-to-br from-[#faf2e2] to-[#ead9bf]"><img src="' + post.image + '" alt="' + esc(post.title) + '" loading="lazy" class="h-full w-full object-contain p-6 transition duration-700 group-hover:scale-105" /><span class="absolute right-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 font-vazir text-[9.5px] font-extrabold text-[#8a6634] backdrop-blur">' + esc(post.category) + '</span></div><div class="p-5"><div class="flex items-center gap-2 font-vazir text-[9.5px] text-muted"><span>' + esc(post.date) + '</span><span class="h-1 w-1 rounded-full bg-line"></span><span>' + faNum(post.readTime) + ' دقیقه مطالعه</span></div><h3 class="mt-2.5 font-vazir text-[15.5px] font-black leading-7 text-espresso transition group-hover:text-[#8a6634]">' + esc(post.title) + '</h3><p class="mt-2 line-clamp-2 font-vazir text-[11px] leading-6 text-muted">' + esc(post.excerpt) + '</p><span class="link-gold mt-4 !text-[11px]">ادامه مطلب ' + icon('arrowLeft', 13) + '</span></div></a>';
        }).join('') + '</div></div>' +
    '</section>' +

    '<section class="border-y border-line/70 bg-[#efe6d6] py-8">' +
      '<div class="mb-5 text-center"><span class="font-vazir text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#8a6634]">استانداردها و گواهینامه‌ها</span></div>' +
      '<div class="mask-fade-x overflow-hidden"><div class="flex w-max animate-marquee gap-3">' + (D.certifications || []).concat(D.certifications || []).map(function (c) {
        return '<div class="flex shrink-0 items-center gap-2.5 rounded-full border border-[#d5c3a5] bg-paper/70 px-4 py-2"><span class="grid h-7 w-7 place-items-center rounded-full border border-gold/40 text-[#8a6634]">' + icon(c.icon, 13) + '</span><span><span class="block font-serif text-[10px] font-bold uppercase tracking-wider text-espresso">' + esc(c.name) + '</span><span class="block font-vazir text-[8.5px] text-muted">' + esc(c.desc) + '</span></span></div>';
      }).join('') + '</div></div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">' +
        '<div>' + sectionHead({ eyebrow: 'اشتراک قهوه', title: 'هر ماه، یک فنجان تازه در خانه.', desc: 'سلیقه، روش دم‌آوری و دوره تحویل را انتخاب کنید؛ ما هر دوره بسته تازه‌رست را می‌رسانیم. هر زمان بخواهید متوقف، تغییر یا لغو کنید.' }) +
          '<ul class="mt-6 space-y-3">' + ['۱۵٪ تخفیف نسبت به خرید تکی', 'انتخاب سلیقه و روش دم‌آوری', 'دسترسی زودتر به بچ‌های محدود', 'توقف یا تغییر در هر زمان'].map(function (f) {
            return '<li class="flex items-center gap-2.5 font-vazir text-[12px] text-espresso/75"><span class="grid h-5 w-5 place-items-center rounded-full bg-olive/15 text-olive">' + icon('check', 11) + '</span>' + f + '</li>';
          }).join('') + '</ul>' +
          '<a href="#/subscription" class="btn btn-gold mt-7">انتخاب طرح اشتراک ' + icon('arrowLeft', 16) + '</a>' +
        '</div>' +
        '<div class="grid gap-3">' + (D.plans || []).map(function (pl) {
          return '<a href="#/subscription" class="group flex items-center justify-between rounded-2xl border ' + (pl.highlight ? 'border-gold/50 bg-[#fdf8ee]' : 'border-line/80 bg-paper/70') + ' px-4 py-4 transition hover:-translate-y-0.5 hover:border-gold">' +
            '<div><div class="flex items-center gap-2"><span class="font-vazir text-[13px] font-black text-espresso">' + esc(pl.name) + '</span>' + (pl.highlight ? '<span class="rounded-full bg-goldxl/50 px-2 py-0.5 font-vazir text-[8.5px] font-extrabold text-[#7a5b2e]">پرفروش</span>' : '') + '</div><p class="mt-1 font-vazir text-[10px] text-muted">' + esc(pl.desc) + '</p></div>' +
            '<div class="text-left"><div class="font-vazir text-[13px] font-black text-espresso">' + money(pl.price) + '</div><div class="font-vazir text-[9px] text-muted">' + esc(pl.period) + '</div></div></a>';
        }).join('') + '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section-tight border-y border-line/70 bg-gradient-to-b from-[#faf4e8] to-[#f4ecdf]">' +
      '<div class="wrap"><div class="mb-6 flex items-end justify-between gap-4"><div><span class="eyebrow">از رستری ما</span><h2 class="display-3 mt-2">لحظه‌های قهوه</h2></div><span class="font-script text-[24px] text-gold">Everyday ritual</span></div>' +
        '<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">' + (D.gallery || []).map(function (g) {
          return '<div class="group overflow-hidden rounded-2xl border border-line/70 bg-paper/60 p-2"><div class="flex h-[110px] items-center justify-center rounded-xl bg-gradient-to-br from-[#fdf8ee] to-[#e9dcc4]"><img src="' + g.src + '" alt="' + esc(g.title) + '" loading="lazy" class="h-full w-auto object-contain p-2 transition duration-500 group-hover:scale-105" /></div><p class="mt-1.5 truncate text-center font-vazir text-[9px] text-espresso/60">' + esc(g.title) + '</p></div>';
        }).join('') + '</div></div>' +
    '</section>' +

    '<section class="section">' +
      '<div class="wrap grid gap-4 lg:grid-cols-2">' +
        '<div class="card-3d relative overflow-hidden rounded-[28px] p-7"><div class="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-2xl"></div><span class="eyebrow">آزمون سلیقه</span><h2 class="display-3 mt-3">سه سؤال؛ یک فنجان دقیقاً مال شما.</h2><p class="mt-3 font-vazir text-[11.5px] leading-7 text-muted">سلیقه، روش دم‌آوری و رست مورد علاقه‌تان را بگویید تا پیشنهاد اختصاصی بگیرید.</p><a href="#/guide" class="btn btn-dark btn-sm mt-6">شروع آزمون ' + icon('arrowLeft', 15) + '</a></div>' +
        '<div class="relative overflow-hidden rounded-[28px] bg-choco p-7 text-cream grain"><span class="font-vazir text-[10px] font-extrabold uppercase tracking-[0.25em] text-goldl">خبرنامه</span><h2 class="display-3 mt-3 text-cream">رست‌های تازه را زودتر بدانید.</h2><p class="mt-3 font-vazir text-[11.5px] leading-7 text-cream/55">هر دو هفته یک ایمیل کوتاه از بچ‌های تازه و دستور دم‌آوری.</p><form data-newsletter class="mt-5 flex flex-col gap-2 sm:flex-row"><input type="email" required placeholder="ایمیل شما" dir="ltr" class="field !border-cream/15 !bg-white/5 !text-cream placeholder:!text-cream/35" /><button type="submit" class="btn btn-gold shrink-0">عضویت</button></form></div>' +
      '</div>' +
    '</section>' +

    '<section class="section-tight pb-16">' +
      '<div class="wrap">' + headRow({ eyebrow: 'پرسش‌های پرتکرار', title: 'قبل از خرید بدانید', href: '#/faq', linkLabel: 'همه سؤالات' }) +
        '<div class="grid gap-3 md:grid-cols-2">' + (D.faqs || []).slice(0, 6).map(function (f, i) {
          return '<details class="cc-accordion rounded-2xl border border-line/80 bg-paper/70 px-4 py-3"><summary class="flex items-center justify-between gap-3 font-vazir text-[12px] font-extrabold text-espresso"><span>' + esc(f.q) + '</span><span class="acc-icon text-gold">' + icon('plus', 15) + '</span></summary><p class="mt-2.5 font-vazir text-[11px] leading-7 text-muted">' + esc(f.a) + '</p></details>';
        }).join('') + '</div>' +
      '</div>' +
    '</section>';
  }

  /* ───────────────────────────── shop ───────────────────────────── */
  var shop = null;
  function defaultShop(query) {
    return {
      q: (query && query.get('q')) || '',
      category: (query && query.get('category')) || 'all',
      roast: 'all',
      origin: 'all',
      flavor: 'all',
      max: Number((query && query.get('max')) || 1500000),
      organic: false,
      inStock: false,
      sort: 'featured'
    };
  }
  function flavorOf(p) {
    var text = [p.name, p.description, (p.notes || []).join(' ')].join(' ');
    if (/شکلات|کاکائو|ملاس|کارامل/.test(text)) return 'chocolate';
    if (/یاس|گل|برگاموت|لیچی|نارنج/.test(text)) return 'floral';
    if (/بادام|فندق|گردو/.test(text)) return 'nutty';
    if (/ادویه|فلفل|سدر|تنباکو|دارچین/.test(text)) return 'spicy';
    if (/انگور|گریپ|هلو|سیب|پرتقال|میوه|لیمو/.test(text)) return 'fruity';
    return 'fruity';
  }
  function filteredProducts() {
    if (!shop) return products;
    var q = shop.q.trim().toLowerCase();
    var list = products.filter(function (p) {
      if (q) {
        var hay = [p.name, p.en, p.origin, p.region, (p.notes || []).join(' ')].join(' ').toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      if (shop.category !== 'all' && p.category !== shop.category) return false;
      if (shop.roast !== 'all' && p.roastKey !== shop.roast) return false;
      if (shop.origin !== 'all' && p.origin !== shop.origin) return false;
      if (shop.flavor !== 'all' && flavorOf(p) !== shop.flavor) return false;
      if (p.price > shop.max) return false;
      if (shop.organic && !p.organic) return false;
      if (shop.inStock && !(p.stock > 0)) return false;
      return true;
    });
    if (shop.sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
    else if (shop.sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
    else if (shop.sort === 'rating') list.sort(function (a, b) { return b.rating - a.rating; });
    return list;
  }
  function viewShop(query) {
    shop = defaultShop(query);
    var catChips = [{ slug: 'all', name: 'همه' }].concat(categories).map(function (c) {
      return '<button type="button" data-shop-cat="' + c.slug + '" class="chip ' + (shop.category === c.slug ? 'chip-gold' : '') + ' transition hover:border-gold">' + esc(c.name) + '</button>';
    }).join('');
    var roasts = (D.roastFilters || []).map(function (r) {
      return '<button type="button" data-shop-roast="' + r.key + '" class="chip ' + (shop.roast === r.key ? 'chip-gold' : '') + '">' + esc(r.label) + '</button>';
    }).join('');
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream">' +
        '<div class="wrap py-9 sm:py-12"><div class="flex flex-wrap items-end justify-between gap-4"><div><span class="eyebrow">فروشگاه</span><h1 class="display-2 mt-3">قهوه‌های کانتیننتال</h1><p class="mt-3 max-w-xl font-vazir text-[12.5px] leading-7 text-muted">' + faNum(products.length) + ' محصول، هر کدام با تاریخ رست، کد بچ و پروفایل طعم شفاف. با فیلترها فنجان خودتان را پیدا کنید.</p></div><div class="hidden items-center gap-2 rounded-full border border-gold/25 bg-paper/70 px-3.5 py-2 sm:flex">' + stars(4.9, 12) + '<span class="font-vazir text-[10.5px] font-bold text-espresso/70">۴٫۹ از ۴٬۲۰۰ نظر</span></div></div></div>' +
      '</section>' +
      '<section class="section-tight"><div class="wrap">' +
        '<div class="mb-5 flex flex-wrap items-center gap-2">' + catChips + '</div>' +
        '<div class="grid gap-6 lg:grid-cols-[260px_1fr]">' +
          '<aside class="cc-sticky-filters hidden space-y-5 lg:block">' +
            '<div class="card-3d rounded-2xl p-4"><label class="label">جستجو</label><div class="flex items-center gap-2 rounded-xl border border-line bg-paper px-3"><span class="text-gold">' + icon('search', 15) + '</span><input id="shop-q" value="' + esc(shop.q) + '" placeholder="نام یا نت طعم…" class="h-10 w-full bg-transparent font-vazir text-[12px] outline-none" /></div></div>' +
            '<div class="card-3d rounded-2xl p-4"><p class="label">رست</p><div class="flex flex-wrap gap-2">' + roasts + '</div></div>' +
            '<div class="card-3d rounded-2xl p-4"><label class="label" for="shop-origin">خاستگاه</label><select id="shop-origin" class="field !min-h-0 !py-2.5 !text-[12px]"><option value="all">همه خاستگاه‌ها</option>' + (D.origins || []).map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('') + '</select>' +
              '<label class="label mt-4" for="shop-flavor">نت طعم</label><select id="shop-flavor" class="field !min-h-0 !py-2.5 !text-[12px]"><option value="all">همه نت‌ها</option>' + (D.flavorFilters || []).map(function (f) { return '<option value="' + f.key + '">' + esc(f.label) + '</option>'; }).join('') + '</select></div>' +
            '<div class="card-3d rounded-2xl p-4"><div class="flex items-center justify-between"><p class="label !mb-0">حداکثر قیمت</p><span id="shop-max-label" class="font-vazir text-[10.5px] font-bold text-[#8a6634]">' + money(shop.max) + '</span></div><input id="shop-max" type="range" min="300000" max="1500000" step="50000" value="' + shop.max + '" class="cc-range mt-3" /><div class="mt-1 flex justify-between font-vazir text-[8.5px] text-muted"><span>۳۰۰ هزار</span><span>۱٫۵ میلیون</span></div></div>' +
            '<div class="card-3d rounded-2xl p-4"><p class="label">ویژگی‌ها</p><label class="flex items-center gap-2 font-vazir text-[11.5px] text-espresso/75"><input id="shop-organic" type="checkbox" class="cc-check" ' + (shop.organic ? 'checked' : '') + ' /> ارگانیک</label><label class="mt-2.5 flex items-center gap-2 font-vazir text-[11.5px] text-espresso/75"><input id="shop-stock" type="checkbox" class="cc-check" ' + (shop.inStock ? 'checked' : '') + ' /> فقط موجود</label></div>' +
            '<button type="button" id="shop-reset" class="link-gold !text-[11px]">' + icon('refresh', 14) + ' پاک کردن فیلترها</button>' +
          '</aside>' +
          '<div>' +
            '<div class="mb-4 flex flex-wrap items-center justify-between gap-3"><p id="shop-count" class="font-vazir text-[11px] font-bold text-espresso/60">' + faNum(filteredProducts().length) + ' محصول</p><div class="flex items-center gap-2"><span class="font-vazir text-[10px] text-muted">مرتب‌سازی:</span><select id="shop-sort" class="field !min-h-0 !w-auto !py-2 !text-[11px]"><option value="featured">پیشنهاد ما</option><option value="price-asc">ارزان‌ترین</option><option value="price-desc">گران‌ترین</option><option value="rating">بیشترین امتیاز</option></select></div></div>' +
            '<div id="shop-grid" class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">' + shopGrid() + '</div>' +
            '<div class="mt-6 flex justify-center lg:hidden"><button type="button" id="shop-filters-toggle" class="btn btn-outline btn-sm">' + icon('filter', 15) + ' فیلترها</button></div>' +
          '</div>' +
        '</div>' +
      '</div></section>';
  }
  function shopGrid() {
    var list = filteredProducts();
    if (!list.length) {
      return '<div class="col-span-full rounded-3xl border border-line/80 bg-paper/70 px-6 py-14 text-center"><span class="cc-empty-ring mx-auto">' + icon('search', 28) + '</span><p class="mt-4 font-vazir text-[14px] font-black text-espresso">محصولی با این فیلترها پیدا نشد</p><p class="mt-1 font-vazir text-[11px] text-muted">فیلترها را کمتر کنید یا همه را پاک کنید.</p><button type="button" id="shop-reset-2" class="btn btn-dark btn-sm mt-5">پاک کردن فیلترها</button></div>';
    }
    return list.map(function (p, i) { return '<div class="reveal" style="--d:' + Math.min(i * 50, 250) + 'ms">' + productCard(p) + '</div>'; }).join('');
  }

  /* ───────────────────────────── product ───────────────────────────── */
  function viewProduct(p) {
    if (!p) return viewNotFound();
    var related = products.filter(function (x) { return x.slug !== p.slug && x.category !== 'gift'; }).slice(0, 3);
    var wished = wish.indexOf(p.slug) >= 0;
    var isBox = p.slug === 'gift-trio-box';
    var flavorRows = [['اسیدیتی', 'acidity'], ['بدنه', 'body'], ['شیرینی', 'sweetness'], ['عطر', 'aroma'], ['تعادل', 'balance']].map(function (r) {
      var v = (p.flavor || {})[r[1]] || 0;
      return '<div class="flex items-center gap-3"><span class="w-14 shrink-0 font-vazir text-[10px] text-muted">' + r[0] + '</span><div class="cc-compare-bar flex-1"><span style="width:' + v * 20 + '%"></span></div><span class="w-6 text-left font-vazir text-[10px] font-bold text-espresso/70">' + faNum(v) + '</span></div>';
    }).join('');
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap py-6"><div class="flex items-center gap-2 font-vazir text-[10.5px] text-muted"><a href="#/" class="transition hover:text-espresso">خانه</a><span>/</span><a href="#/shop" class="transition hover:text-espresso">فروشگاه</a><span>/</span><a href="#/shop?category=' + p.category + '" class="transition hover:text-espresso">' + esc((categories.filter(function (c) { return c.slug === p.category; })[0] || {}).name || '') + '</a><span>/</span><span class="text-espresso/70">' + esc(p.name) + '</span></div></div></section>' +
      '<section class="section-tight"><div class="wrap grid gap-10 lg:grid-cols-[1fr_440px]">' +
        '<div>' +
          '<div class="relative overflow-hidden rounded-[30px] border border-line/80 bg-gradient-to-b from-[#fdf8ee] via-[#f8efe0] to-[#eadfca] p-4">' +
            '<div class="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,.9),transparent_45%)]"></div>' +
            '<div class="relative flex h-[330px] items-center justify-center sm:h-[430px]"><img id="p-main" src="' + p.image + '" alt="' + esc(p.name) + '" class="cc-product-img h-full w-auto object-contain p-6 transition duration-500" /></div>' +
            '<div class="relative mt-3 flex gap-2">' + [p.image, 'assets/img/cup-crema.png', 'assets/img/beans.png', 'assets/img/medal-bean.png'].map(function (src, i) {
              return '<button type="button" data-thumb="' + src + '" class="cc-thumb ' + (i === 0 ? 'is-active' : '') + ' h-16 w-16 shrink-0 p-1"><img src="' + src + '" alt="" class="h-full w-full object-contain" /></button>';
            }).join('') + '</div>' +
          '</div>' +
          '<div class="card-3d mt-5 rounded-2xl p-5"><h2 class="font-vazir text-[13px] font-black text-espresso">پروفایل طعم</h2><div class="mt-4 space-y-2.5">' + flavorRows + '</div></div>' +
          '<div class="mt-5 grid gap-4 sm:grid-cols-2">' +
            '<div class="card-3d rounded-2xl p-5"><h2 class="font-vazir text-[13px] font-black text-espresso">مشخصات بچ</h2><dl class="mt-3 space-y-2 font-vazir text-[11px]">' + [['کد بچ', p.batch], ['تاریخ رست', p.roastDate], ['ارتفاع کشت', p.altitude], ['فرآوری', p.process], ['امتیاز SCA', p.score ? faNum(p.score) + ' / ۱۰۰' : '—'], ['موجودی', p.stock > 0 ? faNum(p.stock) + ' بسته' : 'ناموجود']].map(function (r) {
              return '<div class="flex items-center justify-between gap-3 border-b border-line/60 pb-2 last:border-0 last:pb-0"><dt class="text-muted">' + r[0] + '</dt><dd class="font-bold text-espresso">' + esc(r[1]) + '</dd></div>';
            }).join('') + '</dl></div>' +
            '<div class="card-3d rounded-2xl p-5"><h2 class="font-vazir text-[13px] font-black text-espresso">پیشنهاد دم‌آوری</h2><p class="mt-2 font-vazir text-[11px] leading-6 text-muted">' + esc(p.bestFor) + ' · آسیاب ' + esc(p.grind) + '</p><div class="mt-3 flex flex-wrap gap-1.5">' + (p.brew || []).map(function (b) { return '<span class="chip">' + icon('cup', 13, 'text-gold') + esc(b) + '</span>'; }).join('') + '</div><div class="mt-3 rounded-xl bg-goldxl/20 px-3 py-2 font-vazir text-[10px] leading-6 text-[#7a5b2e]">نسبت پیشنهادی: ' + (p.roastKey === 'light' ? '۱:۱۶' : p.roastKey === 'dark' ? '۱:۱۵' : '۱:۱۵٫۵') + ' · دمای ' + (p.roastKey === 'light' ? '۹۳' : p.roastKey === 'dark' ? '۸۹' : '۹۱') + ' درجه</div></div>' +
          '</div>' +
          '<div class="card-3d mt-5 rounded-2xl p-5"><h2 class="font-vazir text-[13px] font-black text-espresso">داستان این بچ</h2><p class="mt-3 font-vazir text-[11.5px] leading-7 text-muted">' + esc(p.story) + '</p></div>' +
        '</div>' +
        '<div class="cc-buy-sticky">' +
          '<div class="card-3d rounded-[26px] p-5">' +
            '<div class="flex items-center justify-between gap-2"><span class="font-vazir text-[10px] font-extrabold tracking-wide text-gold">' + esc(p.region) + '</span>' + (p.badge ? '<span class="chip chip-gold !text-[9px]">' + esc(p.badge) + '</span>' : '') + '</div>' +
            '<h1 class="mt-2 font-vazir text-[24px] font-black leading-9 text-espresso">' + esc(p.name) + '</h1>' +
            '<div class="mt-2 flex flex-wrap items-center gap-2 font-vazir text-[10.5px] text-muted"><span class="flex items-center gap-1">' + stars(p.rating, 11) + faNum((p.rating || 0).toFixed(1).replace('.', '٫')) + '</span><span>·</span><span>' + faNum(p.reviewCount) + ' نظر</span><span>·</span><span>' + esc(p.process) + '</span></div>' +
            '<p class="mt-3 font-vazir text-[12px] leading-7 text-espresso/70">' + esc(p.tagline) + '</p>' +
            '<div class="mt-3 flex flex-wrap gap-1.5">' + (p.notes || []).map(function (n) { return '<span class="chip chip-gold !text-[10px]">' + esc(n) + '</span>'; }).join('') + '</div>' +
            '<div class="my-4 h-px bg-line/70"></div>' +
            (isBox ? '' : '<p class="label">وزن</p><div class="grid grid-cols-3 gap-2">' + [250, 500, 1000].map(function (w) {
              return '<button type="button" data-weight="' + w + '" class="rounded-xl border border-line bg-paper px-2 py-2.5 font-vazir text-[11px] font-bold text-espresso/70 transition ' + (w === 250 ? '!border-gold !bg-goldxl/25 !text-espresso' : 'hover:border-gold') + '">' + faNum(w) + ' گرم</button>';
            }).join('') + '</div>') +
            '<div class="mt-3 grid grid-cols-2 gap-2">' +
              '<div><label class="label" for="buy-grind">آسیاب</label><select id="buy-grind" class="field !min-h-0 !py-2.5 !text-[11.5px]">' + (isBox ? ['دانه کامل'] : ['دانه کامل', 'اسپرسو (ریز)', 'موکاپات', 'V60 (متوسط)', 'فرنچ‌پرس (درشت)']).map(function (g) { return '<option>' + g + '</option>'; }).join('') + '</select></div>' +
              '<div><label class="label" for="buy-gift">هدیه</label><select id="buy-gift" class="field !min-h-0 !py-2.5 !text-[11.5px]">' + (D.giftOptions || []).map(function (g) { return '<option value="' + g.key + '">' + esc(g.label) + (g.price ? ' (+' + moneyShort(g.price) + ')' : '') + '</option>'; }).join('') + '</select></div>' +
            '</div>' +
            '<div class="mt-4 flex items-end justify-between gap-3"><div><div class="font-vazir text-[10px] text-muted">قیمت</div><div id="buy-price" class="font-vazir text-[22px] font-black text-espresso">' + money(isBox ? p.price : p.price) + '</div><div id="buy-unit" class="font-vazir text-[9.5px] text-muted">' + (isBox ? 'بسته سه‌گانه' : 'برای ' + faNum(250) + ' گرم') + '</div></div>' +
              '<div class="inline-flex items-center rounded-full border border-line bg-paper"><button type="button" data-buy-dec class="grid h-10 w-10 place-items-center text-espresso/70" aria-label="کاهش">' + icon('minus', 14) + '</button><span id="buy-qty" class="min-w-7 text-center font-vazir text-[12px] font-black">۱</span><button type="button" data-buy-inc class="grid h-10 w-10 place-items-center text-espresso/70" aria-label="افزایش">' + icon('plus', 14) + '</button></div></div>' +
            '<button type="button" id="buy-add" class="btn btn-dark mt-4 w-full">' + icon('cart', 18) + ' افزودن به سبد خرید</button>' +
            '<div class="mt-2 grid grid-cols-2 gap-2"><button type="button" data-wish="' + p.slug + '" aria-pressed="' + wished + '" class="cc-wish ' + (wished ? 'is-on' : '') + ' btn btn-outline btn-sm !px-2 !text-[10.5px]">' + icon('heart', 14) + ' علاقه‌مندی</button><a href="#/consultant" class="btn btn-ghost btn-sm !px-2 !text-[10.5px]">' + icon('sparkles', 14, 'text-gold') + ' مشاوره</a></div>' +
            '<div class="mt-4 space-y-2 rounded-xl bg-cream/70 px-3 py-3 font-vazir text-[10px] text-espresso/65">' +
              '<div class="flex items-center gap-2">' + icon('truck', 14, 'text-gold') + ' ارسال رایگان بالای ' + moneyShort(FREE) + ' تومان</div>' +
              '<div class="flex items-center gap-2">' + icon('shield', 14, 'text-gold') + ' ضمانت اصالت و تازگی</div>' +
              '<div class="flex items-center gap-2">' + icon('refresh', 14, 'text-gold') + ' تعویض تا ۷ روز پس از دریافت</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div></section>' +
      '<section class="section-tight border-t border-line/70"><div class="wrap">' +
        '<div class="flex flex-wrap items-end justify-between gap-3"><div><span class="eyebrow">تجربه مشتریان</span><h2 class="display-3 mt-2">نظرها درباره ' + esc(p.name) + '</h2></div><span class="flex items-center gap-2 font-vazir text-[11px] font-bold text-espresso/70">' + stars(p.rating, 13) + faNum((p.rating || 0).toFixed(1).replace('.', '٫')) + ' از ۵</span></div>' +
        '<div class="mt-5 grid gap-4 md:grid-cols-3">' + (p.reviews || []).map(function (r) {
          return '<div class="card-3d rounded-2xl p-5"><div class="flex items-center justify-between">' + stars(r.rating, 12) + '<span class="font-vazir text-[9px] text-muted">' + esc(r.date) + '</span></div><p class="mt-3 font-vazir text-[11.5px] leading-7 text-espresso/75">' + esc(r.text) + '</p><p class="mt-3 font-vazir text-[10.5px] font-extrabold text-espresso">' + esc(r.name) + '</p></div>';
        }).join('') + '</div>' +
      '</div></section>' +
      '<section class="section-tight border-t border-line/70 bg-[#fbf6eb]"><div class="wrap"><div class="mb-6 flex items-end justify-between gap-3"><h2 class="display-3">شاید این‌ها را هم دوست داشته باشید</h2><a href="#/shop" class="link-gold !text-[11px]">همه محصولات ' + icon('arrowLeft', 14) + '</a></div><div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">' + related.map(function (r) { return productCard(r); }).join('') + '</div></div></section>';
  }

  /* ───────────────────────────── cart page ───────────────────────────── */
  function cartRows(editable) {
    return cart.map(function (i) {
      var meta = [faNum(i.weight) + ' گرم', i.grind, giftLabel(i.gift)].filter(Boolean).join(' · ');
      return '<div class="flex gap-3 border-b border-line/70 py-4 last:border-0">' +
        '<a href="#/product/' + i.slug + '" class="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-[#fdf8ee] to-[#eadfca]"><img src="' + i.image + '" alt="' + esc(i.name) + '" class="h-full w-full object-contain p-2" /></a>' +
        '<div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-2"><div><a href="#/product/' + i.slug + '" class="font-vazir text-[13px] font-black text-espresso">' + esc(i.name) + '</a><p class="mt-1 font-vazir text-[9.5px] text-muted">' + meta + '</p></div><button type="button" data-cart-remove="' + i.key + '" class="text-espresso/35 transition hover:text-wine" aria-label="حذف">' + icon('trash', 16) + '</button></div>' +
        '<div class="mt-3 flex flex-wrap items-center justify-between gap-2"><div class="inline-flex items-center rounded-full border border-line bg-paper"><button type="button" data-cart-dec="' + i.key + '" class="grid h-8 w-8 place-items-center text-espresso/70" aria-label="کاهش">' + icon('minus', 13) + '</button><span class="min-w-7 text-center font-vazir text-[11px] font-black">' + faNum(i.qty) + '</span><button type="button" data-cart-inc="' + i.key + '" class="grid h-8 w-8 place-items-center text-espresso/70" aria-label="افزایش">' + icon('plus', 13) + '</button></div><span class="font-vazir text-[12px] font-black text-espresso">' + money(i.unitPrice * i.qty) + '</span></div></div></div>';
    }).join('');
  }
  function summaryBox(o) {
    return '<div class="card-3d rounded-[24px] p-5">' +
      '<h2 class="font-vazir text-[14px] font-black text-espresso">خلاصه سفارش</h2>' +
      '<div class="mt-4 space-y-2.5 border-b border-line/70 pb-4 font-vazir text-[11.5px]">' +
        '<div class="flex justify-between"><span class="text-muted">جمع کالاها</span><span class="font-bold">' + money(o.sub) + '</span></div>' +
        '<div class="flex justify-between"><span class="text-muted">هزینه ارسال</span><span class="font-bold">' + (o.ship === 0 ? '<span class="text-olive">رایگان</span>' : money(o.ship)) + '</span></div>' +
        (o.disc ? '<div class="flex justify-between text-olive"><span>تخفیف' + (o.coupon ? ' (' + esc(o.coupon) + ')' : '') + '</span><span class="font-bold">− ' + money(o.disc) + '</span></div>' : '') +
      '</div>' +
      '<div class="mt-4 flex items-end justify-between"><span class="font-vazir text-[11px] text-muted">مبلغ قابل پرداخت</span><span class="font-vazir text-[18px] font-black text-espresso">' + money(o.total) + '</span></div>' +
      '<a href="#/checkout" class="btn btn-dark mt-4 w-full">تکمیل خرید ' + icon('arrowLeft', 16) + '</a>' +
      '<div class="mt-3 flex items-center justify-center gap-1.5 font-vazir text-[9px] text-muted">' + icon('lock', 12, 'text-gold') + ' پرداخت نمایشی؛ سفارش در همین مرورگر ذخیره می‌شود</div>' +
    '</div>';
  }
  function viewCartPage() {
    if (!cart.length) {
      return '<section class="section"><div class="wrap flex flex-col items-center py-16 text-center"><span class="cc-empty-ring">' + icon('cart', 30) + '</span><h1 class="mt-5 font-vazir text-[22px] font-black text-espresso">سبد خرید خالی است</h1><p class="mt-2 font-vazir text-[12px] text-muted">هنوز محصولی انتخاب نکرده‌اید. از فروشگاه شروع کنید.</p><a href="#/shop" class="btn btn-dark mt-6">' + icon('bag', 16) + ' رفتن به فروشگاه</a></div></section>';
    }
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap py-9"><span class="eyebrow">سبد خرید</span><h1 class="display-2 mt-3">مرور انتخاب‌های شما</h1><p class="mt-2 font-vazir text-[12px] text-muted">' + faNum(cartCount()) + ' قلم · ' + money(cartSubtotal()) + '</p></div></section>' +
      '<section class="section-tight"><div class="wrap grid gap-6 lg:grid-cols-[1fr_340px]"><div class="card-3d rounded-[24px] px-5 py-2">' + cartRows() + '</div><div>' + summaryBox({ sub: cartSubtotal(), ship: cartSubtotal() >= FREE ? 0 : 65000, disc: 0, total: cartSubtotal() + (cartSubtotal() >= FREE ? 0 : 65000) }) + '</div></div></section>';
  }

  /* ───────────────────────────── checkout ───────────────────────────── */
  var checkout = { coupon: null, shipping: 'post' };
  function calcTotals() {
    var sub = cartSubtotal();
    var method = (D.shippingMethods || []).filter(function (m) { return m.key === checkout.shipping; })[0] || { price: 0 };
    var ship = sub >= FREE ? 0 : method.price;
    var disc = 0;
    if (checkout.coupon) {
      var c = (D.coupons || {})[checkout.coupon];
      if (c) disc = c.type === 'percent' ? Math.round((sub * c.value) / 100) : Math.min(sub, c.value);
    }
    return { sub: sub, ship: ship, disc: disc, total: Math.max(0, sub + ship - disc), coupon: checkout.coupon };
  }
  function viewCheckout() {
    checkout = { coupon: checkout.coupon, shipping: checkout.shipping || 'post' };
    if (!cart.length) {
      return '<section class="section"><div class="wrap flex flex-col items-center py-16 text-center"><span class="cc-empty-ring">' + icon('cart', 30) + '</span><h1 class="mt-5 font-vazir text-[22px] font-black text-espresso">برای پرداخت، سبد نباید خالی باشد</h1><a href="#/shop" class="btn btn-dark mt-6">انتخاب قهوه</a></div></section>';
    }
    var t = calcTotals();
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap py-8"><span class="eyebrow">پرداخت</span><h1 class="display-2 mt-3">تکمیل سفارش</h1><p class="mt-2 font-vazir text-[11.5px] text-muted">این یک پرداخت نمایشی است؛ هیچ مبلغی برداشت نمی‌شود و سفارش فقط در همین مرورگر ثبت می‌شود.</p></div></section>' +
      '<section class="section-tight"><div class="wrap grid gap-6 lg:grid-cols-[1fr_360px]">' +
        '<form id="co-form" class="space-y-5" novalidate>' +
          '<div class="card-3d rounded-[24px] p-5"><h2 class="font-vazir text-[13.5px] font-black text-espresso">۱. اطلاعات تحویل</h2><div class="mt-4 grid gap-3 sm:grid-cols-2">' +
            '<div><label class="label" for="co-name">نام و نام خانوادگی</label><input id="co-name" required class="field" placeholder="مثلاً سارا محمدی" /></div>' +
            '<div><label class="label" for="co-phone">شماره موبایل</label><input id="co-phone" required inputmode="tel" dir="ltr" class="field text-left" placeholder="0912 345 6789" /></div>' +
            '<div><label class="label" for="co-email">ایمیل (اختیاری)</label><input id="co-email" type="email" dir="ltr" class="field text-left" placeholder="you@example.com" /></div>' +
            '<div><label class="label" for="co-province">استان</label><select id="co-province" class="field">' + ['فارس', 'تهران', 'البرز', 'اصفهان', 'خراسان رضوی', 'آذربایجان شرقی', 'گیلان', 'مازندران', 'یزد', 'کرمان', 'سایر'].map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>' +
            '<div><label class="label" for="co-city">شهر</label><input id="co-city" required class="field" placeholder="مثلاً شیراز" /></div>' +
            '<div><label class="label" for="co-postal">کد پستی</label><input id="co-postal" required inputmode="numeric" dir="ltr" class="field text-left" placeholder="1234567890" /></div>' +
            '<div class="sm:col-span-2"><label class="label" for="co-address">نشانی کامل</label><textarea id="co-address" required class="field !min-h-[92px]" placeholder="خیابان، کوچه، پلاک، واحد"></textarea></div>' +
            '<div class="sm:col-span-2"><label class="label" for="co-note">یادداشت سفارش (اختیاری)</label><input id="co-note" class="field" placeholder="مثلاً کارت هدیه بنویسید" /></div>' +
          '</div></div>' +
          '<div class="card-3d rounded-[24px] p-5"><h2 class="font-vazir text-[13.5px] font-black text-espresso">۲. روش ارسال</h2><div class="mt-4 grid gap-2">' +
            (D.shippingMethods || []).map(function (m) {
              var price = m.price === 0 ? 'رایگان' : money(m.price);
              return '<label class="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border ' + (checkout.shipping === m.key ? 'border-gold bg-goldxl/20' : 'border-line bg-paper') + ' px-4 py-3"><span class="flex items-center gap-3"><input type="radio" name="shipping" value="' + m.key + '" data-ship ' + (checkout.shipping === m.key ? 'checked' : '') + ' class="accent-[#b08d57]" /><span><span class="block font-vazir text-[12px] font-extrabold text-espresso">' + esc(m.label) + '</span><span class="mt-0.5 block font-vazir text-[9.5px] text-muted">' + esc(m.eta) + '</span></span></span><span class="font-vazir text-[11px] font-bold text-espresso/70">' + price + '</span></label>';
            }).join('') +
          '</div></div>' +
          '<div class="card-3d rounded-[24px] p-5"><h2 class="font-vazir text-[13.5px] font-black text-espresso">۳. پرداخت</h2><div class="mt-4 grid gap-2 sm:grid-cols-2">' +
            '<label class="flex cursor-pointer items-center gap-3 rounded-2xl border border-gold bg-goldxl/20 px-4 py-3"><input type="radio" name="pay" value="online" checked class="accent-[#b08d57]" /><span><span class="block font-vazir text-[12px] font-extrabold text-espresso">پرداخت آنلاین (نمایشی)</span><span class="mt-0.5 block font-vazir text-[9.5px] text-muted">بدون برداشت واقعی</span></span></label>' +
            '<label class="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3"><input type="radio" name="pay" value="cod" class="accent-[#b08d57]" /><span><span class="block font-vazir text-[12px] font-extrabold text-espresso">پرداخت در محل</span><span class="mt-0.5 block font-vazir text-[9.5px] text-muted">ویژه شیراز و فارس</span></span></label>' +
          '</div></div>' +
          '<div class="card-3d rounded-[24px] p-5"><h2 class="font-vazir text-[13.5px] font-black text-espresso">کد تخفیف</h2><div class="mt-3 flex gap-2"><input id="co-coupon" dir="ltr" class="field text-left" placeholder="CONTINENTAL10" value="' + (checkout.coupon || '') + '" /><button type="button" id="co-apply" class="btn btn-outline btn-sm shrink-0">اعمال</button></div><p class="mt-2 font-vazir text-[9.5px] text-muted">کدهای نمایشی: CONTINENTAL10 (۱۰٪) · NOWRUZ (۱۵٪) · FIRSTBREW (۱۰۰ هزار تومان)</p></div>' +
          '<button type="submit" class="btn btn-dark btn-lg w-full">ثبت سفارش و پرداخت ' + icon('lock', 16) + '</button>' +
          '<p class="text-center font-vazir text-[9.5px] text-muted">با ثبت سفارش، قوانین فروشگاه را می‌پذیرید. این نسخه نمایشی است و سفارش واقعی ثبت نمی‌شود.</p>' +
        '</form>' +
        '<aside class="cc-buy-sticky space-y-3"><div class="card-3d rounded-[24px] p-4"><h2 class="font-vazir text-[13px] font-black text-espresso">' + faNum(cartCount()) + ' قلم کالا</h2><div class="mt-3 max-h-[270px] space-y-3 overflow-y-auto no-scrollbar">' + cart.map(function (i) {
          return '<div class="flex items-center gap-2.5"><span class="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-cream"><img src="' + i.image + '" alt="" class="h-full w-full object-contain p-1" /></span><span class="min-w-0 flex-1"><span class="block truncate font-vazir text-[11px] font-bold text-espresso">' + esc(i.name) + '</span><span class="mt-0.5 block font-vazir text-[9px] text-muted">' + faNum(i.qty) + ' × ' + faNum(i.weight) + ' گرم</span></span><span class="font-vazir text-[10.5px] font-bold text-espresso">' + money(i.unitPrice * i.qty) + '</span></div>';
        }).join('') + '</div>' +
        '<div class="mt-4 space-y-2 border-t border-line/70 pt-4 font-vazir text-[11px]">' +
          '<div class="flex justify-between"><span class="text-muted">جمع کالاها</span><span id="co-sub">' + money(t.sub) + '</span></div>' +
          '<div class="flex justify-between"><span class="text-muted">ارسال</span><span id="co-ship">' + (t.ship ? money(t.ship) : 'رایگان') + '</span></div>' +
          '<div id="co-disc-row" class="flex justify-between text-olive ' + (t.disc ? '' : 'hidden') + '"><span>تخفیف</span><span id="co-disc">− ' + money(t.disc) + '</span></div>' +
        '</div>' +
        '<div class="mt-3 flex items-end justify-between border-t border-line/70 pt-3"><span class="font-vazir text-[10.5px] text-muted">قابل پرداخت</span><span id="co-total" class="font-vazir text-[17px] font-black text-espresso">' + money(t.total) + '</span></div>' +
        '<div class="mt-3 flex items-center gap-2 rounded-xl bg-cream/70 px-3 py-2 font-vazir text-[9px] text-espresso/60">' + icon('truck', 13, 'text-gold') + ' ارسال رایگان بالای ' + moneyShort(FREE) + ' تومان</div></div></aside>' +
      '</div></section>';
  }
  function paintTotals() {
    var t = calcTotals();
    var set = function (id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; };
    set('co-sub', money(t.sub));
    set('co-ship', t.ship ? money(t.ship) : 'رایگان');
    set('co-total', money(t.total));
    var row = document.getElementById('co-disc-row');
    if (row) row.classList.toggle('hidden', !t.disc);
    set('co-disc', '− ' + money(t.disc));
  }
  function placeOrder(form) {
    if (!form.reportValidity()) return;
    if (!cart.length) { toast('سبد خرید خالی است', 'cart'); return; }
    var t = calcTotals();
    var pay = (form.querySelector('input[name="pay"]:checked') || {}).value || 'online';
    var method = (D.shippingMethods || []).filter(function (m) { return m.key === checkout.shipping; })[0] || { key: 'post', label: 'پست پیشتاز' };
    var code = 'CC-' + Math.floor(100000 + Math.random() * 899999);
    var order = {
      code: code,
      createdAt: new Date().toISOString(),
      status: 'pending',
      items: cart.map(function (i) { return Object.assign({}, i); }),
      customer: {
        name: form.querySelector('#co-name').value.trim(),
        phone: form.querySelector('#co-phone').value.trim(),
        email: form.querySelector('#co-email').value.trim(),
        province: form.querySelector('#co-province').value,
        city: form.querySelector('#co-city').value.trim(),
        postal: form.querySelector('#co-postal').value.trim(),
        address: form.querySelector('#co-address').value.trim(),
        note: form.querySelector('#co-note').value.trim()
      },
      shippingKey: method.key,
      shippingLabel: method.label,
      payment: pay,
      coupon: t.coupon,
      subtotal: t.sub,
      discount: t.disc,
      shippingCost: t.ship,
      total: t.total
    };
    orders.unshift(order);
    write(K.orders, orders);
    cart = [];
    saveCart();
    renderCartDrawer();
    checkout = { coupon: null, shipping: 'post' };
    location.hash = '#/order/' + code;
    setTimeout(function () { toast('سفارش نمایشی ثبت شد', 'check'); }, 300);
  }

  /* ───────────────────────────── order / tracking ───────────────────────────── */
  function orderStatus(code) { return (D.ORDER_STATUS || {})[code] || { label: code, step: 0 }; }
  function orderSteps(order) {
    var flow = D.ORDER_FLOW || ['pending', 'confirmed', 'processing', 'roasting', 'packed', 'shipped', 'delivered'];
    var idx = order.status === 'cancelled' || order.status === 'refunded' ? -1 : Math.max(0, flow.indexOf(order.status));
    return '<div class="grid grid-cols-4 gap-2 sm:grid-cols-7">' + flow.map(function (s, i) {
      var active = idx >= i;
      var label = orderStatus(s).label;
      return '<div class="flex flex-col items-center gap-1.5 text-center"><span class="cc-step-dot ' + (active ? 'bg-choco text-goldxl' : 'bg-cream text-muted border border-line') + '">' + (active ? icon('check', 13) : faNum(i + 1)) + '</span><span class="font-vazir text-[8.5px] ' + (active ? 'font-bold text-espresso' : 'text-muted') + '">' + esc(label) + '</span></div>';
    }).join('') + '</div>';
  }
  function orderSummary(order) {
    return '<div class="card-3d rounded-[24px] p-5"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4"><div><p class="font-vazir text-[10px] text-muted">کد سفارش</p><p class="mt-1 font-vazir text-[16px] font-black text-espresso" dir="ltr">' + esc(order.code) + '</p></div><div class="text-left"><p class="font-vazir text-[10px] text-muted">وضعیت</p><span class="mt-1 inline-flex rounded-full bg-goldxl/30 px-3 py-1 font-vazir text-[10px] font-extrabold text-[#7a5b2e]">' + esc(orderStatus(order.status).label) + '</span></div></div>' +
      '<div class="mt-5">' + orderSteps(order) + '</div>' +
      '<div class="mt-6 divide-y divide-line/60">' + order.items.map(function (i) {
        return '<div class="flex items-center gap-3 py-3"><span class="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-cream"><img src="' + i.image + '" alt="" class="h-full w-full object-contain p-1" /></span><span class="min-w-0 flex-1"><span class="block font-vazir text-[11.5px] font-bold text-espresso">' + esc(i.name) + '</span><span class="mt-0.5 block font-vazir text-[9px] text-muted">' + faNum(i.qty) + ' × ' + faNum(i.weight) + ' گرم · ' + esc(i.grind) + '</span></span><span class="font-vazir text-[11px] font-bold text-espresso">' + money(i.unitPrice * i.qty) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="mt-4 space-y-2 border-t border-line/70 pt-4 font-vazir text-[11px]"><div class="flex justify-between"><span class="text-muted">جمع کالاها</span><span>' + money(order.subtotal) + '</span></div><div class="flex justify-between"><span class="text-muted">ارسال (' + esc(order.shippingLabel) + ')</span><span>' + (order.shippingCost ? money(order.shippingCost) : 'رایگان') + '</span></div>' + (order.discount ? '<div class="flex justify-between text-olive"><span>تخفیف' + (order.coupon ? ' (' + esc(order.coupon) + ')' : '') + '</span><span>− ' + money(order.discount) + '</span></div>' : '') + '<div class="flex justify-between border-t border-line/70 pt-2"><span class="font-bold text-espresso">مبلغ کل</span><span class="font-black text-espresso">' + money(order.total) + '</span></div></div>' +
      '<div class="mt-4 rounded-xl bg-cream/70 px-3 py-3 font-vazir text-[10px] leading-6 text-espresso/65">' + icon('pin', 13, 'text-gold') + ' ' + esc(order.customer.province) + '، ' + esc(order.customer.city) + '، ' + esc(order.customer.address) + '<br />' + icon('user', 13, 'text-gold') + ' ' + esc(order.customer.name) + ' · ' + esc(order.customer.phone) + '</div>' +
    '</div>';
  }
  function viewOrder(code) {
    var order = orders.filter(function (o) { return o.code === code; })[0];
    if (!order) return viewNotFound();
    return '<section class="section"><div class="wrap max-w-3xl"><div class="text-center"><span class="cc-success-ring mx-auto">' + icon('check', 30) + '</span><h1 class="display-2 mt-5">سفارش شما ثبت شد!</h1><p class="mt-3 font-vazir text-[12px] leading-7 text-muted">این یک سفارش نمایشی است و در همین مرورگر ذخیره شده. برای پیگیری، کد زیر را نگه دارید.</p></div><div class="mt-8">' + orderSummary(order) + '</div><div class="mt-5 flex flex-wrap justify-center gap-3"><a href="#/track?code=' + order.code + '" class="btn btn-dark">' + icon('truck', 16) + ' پیگیری سفارش</a><a href="#/shop" class="btn btn-outline">ادامه خرید</a></div></div></section>';
  }
  function viewTrack(query) {
    var code = (query && query.get('code')) || '';
    var found = code ? orders.filter(function (o) { return o.code.toLowerCase() === code.toLowerCase(); })[0] : null;
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap py-10"><span class="eyebrow">پیگیری</span><h1 class="display-2 mt-3">سفارش شما کجاست؟</h1><p class="mt-2 max-w-lg font-vazir text-[12px] leading-7 text-muted">کد سفارش را وارد کنید. در این نسخه نمایشی، سفارش‌های ثبت‌شده در همین مرورگر قابل پیگیری هستند.</p></div></section>' +
      '<section class="section-tight"><div class="wrap max-w-2xl"><form id="track-form" class="card-3d flex flex-col gap-2 rounded-[24px] p-4 sm:flex-row"><input id="track-code" value="' + esc(code) + '" dir="ltr" placeholder="CC-123456" class="field text-left" /><button type="submit" class="btn btn-dark shrink-0">' + icon('search', 16) + ' پیگیری</button></form>' +
      '<div id="track-result" class="mt-5">' + (code && !found ? '<div class="rounded-2xl border border-wine/20 bg-wine/5 p-5 text-center"><p class="font-vazir text-[12.5px] font-bold text-wine">سفارشی با این کد پیدا نشد</p><p class="mt-1 font-vazir text-[10px] text-muted">کد را بررسی کنید یا از صفحه سفارش‌های نمایشی شروع کنید.</p></div>' : found ? orderSummary(found) : '<div class="grid gap-3 sm:grid-cols-2">' + orders.slice(0, 2).map(function (o) { return '<a href="#/track?code=' + o.code + '" class="card-3d rounded-2xl p-4 transition hover:-translate-y-0.5"><div class="flex items-center justify-between"><span class="font-vazir text-[11.5px] font-black text-espresso" dir="ltr">' + esc(o.code) + '</span><span class="rounded-full bg-goldxl/30 px-2 py-0.5 font-vazir text-[8.5px] font-bold text-[#7a5b2e]">' + esc(orderStatus(o.status).label) + '</span></div><p class="mt-2 font-vazir text-[9.5px] text-muted">' + faNum(o.items.length) + ' قلم · ' + money(o.total) + '</p></a>'; }).join('') + (orders.length ? '' : '<div class="sm:col-span-2 rounded-2xl border border-line/80 bg-paper/70 p-6 text-center"><p class="font-vazir text-[12px] font-bold text-espresso">هنوز سفارشی ثبت نشده</p><a href="#/shop" class="link-gold mt-2 !text-[11px]">شروع خرید ' + icon('arrowLeft', 13) + '</a></div>') + '</div>') + '</div></div></section>';
  }

  /* ───────────────────────────── consultant ───────────────────────────── */
  var consultMsgs = [{ role: 'bot', text: 'سلام! من مشاور قهوه کانتیننتال هستم.\nسلیقه، روش دم‌آوری و بودجه‌تان را بگویید تا دو پیشنهاد دقیق بدهم. مثلاً: «قهوه میوه‌ای برای V60 تا ۵۰۰ هزار» یا «برای اسپرسو چی بخرم؟»' }];
  function parseBudget(text) {
    var t = toFa(text).replace(/[,،]/g, '');
    var m = t.match(/(\d+(?:\.\d+)?)\s*(میلیون|هزار)/);
    if (m) {
      var n = parseFloat(m[1]);
      if (!isNaN(n)) return Math.round(n * (m[2] === 'میلیون' ? 1000000 : 1000));
    }
    m = t.match(/(\d+(?:\.\d+)?)\s*تومان/);
    if (m && !isNaN(parseFloat(m[1]))) return Math.round(parseFloat(m[1]));
    m = t.match(/(?:^|[^0-9a-zA-Z])(\d{3,})(?![0-9])/);
    if (m && !isNaN(parseFloat(m[1]))) return Math.round(parseFloat(m[1]));
    return null;
  }
  function consultReply(text) {
    var t = toFa(text);
    var budget = parseBudget(t);
    var wantEspresso = /اسپرسو|موکا|لاته|کاپوچینو|ماشین/.test(t);
    var wantFilter = /فیلتر|v60|وی\s?۶۰|کمکس|ایروپرس|دمی|دم‌آوری|پوراور/i.test(t);
    var wantPress = /فرنچ|پرس/.test(t);
    var fruity = /میوه|گل|یاس|برگاموت|لیچی|مرکبات|اسید|روشن|عطر/.test(t);
    var choco = /شکلات|کاکائو|کارامل|فندق|بادام|بدنه|تیره|قوی|تلخ/.test(t);
    var balanced = /متعادل|ملایم|هر روز|همه‌کاره|شیر|صبح/.test(t);
    var gift = /هدیه|کادو|گیفت|باکس|مناسبتی/.test(t);
    var limited = /محدود|خاص|نادر|گیشا|مسابقه/.test(t);
    var scored = products.map(function (p) {
      var s = (p.rating || 0) * 0.6;
      var reasons = [];
      var fl = flavorOf(p);
      if (gift) {
        if (p.category === 'gift') { s += 9; reasons.push('بسته‌بندی آماده هدیه'); }
        else s -= 5;
      } else if (p.category === 'gift') s -= 6;
      if (wantEspresso) {
        if ((p.brew || []).indexOf('اسپرسو') >= 0) { s += 4; reasons.push('مناسب اسپرسو'); }
        if (p.roastKey === 'medium-dark' || p.roastKey === 'dark') { s += 2; reasons.push('بدنه و کرمای بیشتر'); }
      }
      if (wantFilter) {
        if (p.roastKey === 'light' || p.roastKey === 'light-medium') { s += 3; reasons.push('رست روشن برای فیلتر'); }
        if ((p.brew || []).some(function (b) { return /V60|کمکس|ایروپرس/.test(b); })) { s += 2; }
      }
      if (wantPress && (p.brew || []).indexOf('فرنچ‌پرس') >= 0) { s += 3; reasons.push('بدنه مناسب فرنچ‌پرس'); }
      if (fruity) {
        if (fl === 'fruity' || fl === 'floral') { s += 4; reasons.push('پروفایل میوه‌ای و گلی'); }
        if ((p.flavor || {}).acidity >= 4) s += 2;
      }
      if (choco) {
        if (fl === 'chocolate') { s += 4; reasons.push('نت‌های شکلاتی و کارامل'); }
        if ((p.flavor || {}).body >= 4) { s += 2; reasons.push('بادی سنگین'); }
      }
      if (balanced && (p.flavor || {}).balance >= 4) { s += 2; reasons.push('تعادل بالا'); }
      if (limited && p.limited) { s += 5; reasons.push('بچ محدود و کمیاب'); }
      if (budget) {
        if (p.price <= budget) s += 3;
        else if (p.price > budget * 1.35) s -= 8;
      }
      if (p.stock <= 0) s -= 3;
      return { p: p, s: s, reasons: reasons.slice(0, 3) };
    }).sort(function (a, b) { return b.s - a.s; });
    var withinBudget = budget ? scored.filter(function (x) { return x.p.price <= budget * 1.15; }) : [];
    var top = (withinBudget.length ? withinBudget : scored).slice(0, 2);
    var intro;
    if (gift) intro = 'برای هدیه، این انتخاب‌ها هم ارائه و هم تجربه را خاص می‌کنند:';
    else if (wantEspresso) intro = 'برای اسپرسو، این دو گزینه بیشترین هماهنگی را با درخواستت دارند:';
    else if (wantFilter) intro = 'برای دم‌آوری فیلتر، این دو فنجان پیشنهاد من هستند:';
    else if (fruity) intro = 'با توجه به علاقه‌ات به طعم‌های روشن و معطر:';
    else if (choco) intro = 'اگر دنبال فنجان شکلاتی و پربادی هستی:';
    else intro = 'بر اساس سلیقه‌ای که گفتی، این دو گزینه را پیشنهاد می‌کنم:';
    var lines = top.map(function (x, i) {
      var why = x.reasons.length ? x.reasons.join('، ') : 'تعادل خوب و امتیاز مشتریان';
      return (i + 1) + ') ' + x.p.name + ' — ' + why + '.';
    });
    var budgetLine = '';
    if (budget) {
      var over = top.filter(function (x) { return x.p.price > budget; });
      budgetLine = over.length
        ? '\nبودجه‌ات ' + money(budget) + ' است؛ نزدیک‌ترین گزینه ' + money(over[0].p.price) + ' است و بسته ۲۵۰ گرمی‌اش شروع خوبی است.'
        : '\nبودجه‌ات (' + money(budget) + ') با این پیشنهادها هماهنگ است.';
    }
    if (!budget && /بودجه|قیمت|ارزان|گران/.test(t)) budgetLine = '\nاگر بودجه‌ات را بگویی، دقیق‌تر انتخاب می‌کنم.';
    return {
      text: intro + '\n' + lines.join('\n') + budgetLine + '\nبرای دیدن جزئیات یا افزودن به سبد، کارت‌های زیر را ببین.',
      cards: top.map(function (x) { return x.p.slug; })
    };
  }
  function chatMessagesHTML() {
    return consultMsgs.map(function (m) {
      if (m.role === 'user') return '<div class="flex justify-end"><div class="cc-bubble cc-bubble-user">' + esc(m.text) + '</div></div>';
      return '<div class="flex justify-start"><div class="max-w-[92%]"><div class="cc-bubble cc-bubble-bot">' + esc(m.text) + '</div>' + (m.cards && m.cards.length ? '<div class="mt-2 grid gap-2">' + m.cards.map(function (slug) {
        var p = bySlug[slug];
        if (!p) return '';
        return '<div class="flex items-center gap-2.5 rounded-2xl border border-line bg-paper p-2.5"><a href="#/product/' + p.slug + '" class="flex min-w-0 flex-1 items-center gap-2.5"><span class="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-cream"><img src="' + p.image + '" alt="" class="h-full w-full object-contain p-1" /></span><span class="min-w-0"><span class="block truncate font-vazir text-[11px] font-black text-espresso">' + esc(p.name) + '</span><span class="mt-0.5 block font-vazir text-[9px] text-muted">' + money(p.price) + '</span></span></a><button type="button" data-add="' + p.slug + '" data-weight="250" data-gift="none" class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-choco text-goldxl" aria-label="افزودن">' + icon('plus', 14) + '</button></div>';
      }).join('') + '</div>' : '') + '</div></div>';
    }).join('');
  }
  function viewConsultant() {
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap py-9"><div class="flex items-center gap-2"><span class="grid h-10 w-10 place-items-center rounded-full bg-choco text-goldxl">' + icon('sparkles', 18) + '</span><div><span class="eyebrow">مشاور هوشمند</span><h1 class="display-2 mt-2">فنجان مناسب شما</h1></div></div><p class="mt-3 max-w-xl font-vazir text-[12px] leading-7 text-muted">این مشاور روی همین صفحه کار می‌کند؛ سلیقه، روش دم‌آوری و بودجه را ترکیب می‌کند و از میان ۱۲ محصول پیشنهاد می‌دهد.</p></div></section>' +
      '<section class="section-tight"><div class="wrap grid gap-6 lg:grid-cols-[1fr_300px]"><div class="card-3d flex min-h-[520px] flex-col rounded-[26px] p-4 sm:p-5"><div id="chat-scroll" class="cc-chat-scroll flex-1 space-y-3 pr-1">' + chatMessagesHTML() + '</div><div id="chat-typing" class="hidden pt-3"><span class="cc-typing inline-flex rounded-full bg-paper px-3 py-2"><span></span><span></span><span></span></span></div><div class="mt-3 flex flex-wrap gap-1.5" id="chat-prompts">' + ['برای اسپرسو چی بخرم؟', 'قهوه میوه‌ای تا ۵۰۰ هزار', 'یک هدیه خاص پیشنهاد بده', 'قهوه شکلاتی و پربادی', 'برای V60 چی مناسبه؟'].map(function (q) {
        return '<button type="button" data-prompt="' + esc(q) + '" class="chip !text-[10px] transition hover:border-gold hover:text-espresso">' + esc(q) + '</button>';
      }).join('') + '</div><form id="consult-form" class="mt-3 flex items-center gap-2 rounded-2xl border border-line bg-cream/50 px-3"><input id="consult-input" class="h-12 w-full bg-transparent font-vazir text-[12.5px] outline-none placeholder:text-muted/60" placeholder="سلیقه یا بودجه‌ات را بنویس…" autocomplete="off" /><button type="submit" class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-choco text-goldxl" aria-label="ارسال">' + icon('send', 16) + '</button></form></div>' +
      '<aside class="space-y-3"><div class="card-3d rounded-2xl p-4"><p class="font-vazir text-[11px] font-black text-espresso">مشاور چه می‌داند؟</p><ul class="mt-2 space-y-2 font-vazir text-[10px] leading-6 text-muted">' + ['سلیقه: میوه‌ای، شکلاتی، متعادل', 'روش: اسپرسو، فیلتر، فرنچ‌پرس', 'بودجه: «۵۰۰ هزار» یا «۱.۵ میلیون»', 'هدف: هدیه، هر روز، بچ محدود'].map(function (x) { return '<li class="flex gap-2"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"></span>' + x + '</li>'; }).join('') + '</ul></div><div class="rounded-2xl bg-choco p-4 text-cream"><p class="font-vazir text-[10.5px] font-bold text-goldl">نسخه نمایشی</p><p class="mt-2 font-vazir text-[10px] leading-6 text-cream/55">در نسخه کامل، این چت به مدل هوش مصنوعی و پروفایل مشتری متصل است. در نسخه استاتیک، پیشنهادها به‌صورت محلی محاسبه می‌شوند.</p></div></aside></div></section>';
  }
  function pushChat(text) {
    consultMsgs.push({ role: 'user', text: text });
    var box = document.getElementById('chat-scroll');
    if (box) { box.innerHTML = chatMessagesHTML(); box.scrollTop = box.scrollHeight; hydrateIcons(box); }
    var typing = document.getElementById('chat-typing');
    if (typing) typing.classList.remove('hidden');
    setTimeout(function () {
      var reply = consultReply(text);
      consultMsgs.push({ role: 'bot', text: reply.text, cards: reply.cards });
      if (typing) typing.classList.add('hidden');
      if (box) { box.innerHTML = chatMessagesHTML(); box.scrollTop = box.scrollHeight; hydrateIcons(box); }
    }, 750);
  }

  /* ───────────────────────────── guide ───────────────────────────── */
  function guidePick(a) {
    if (a.taste === 'fruity' && a.brew !== 'espresso') return { slug: 'ethiopia-yirgacheffe', reason: 'عطر گلی و اسیدیتی زنده یلچچف، دقیقاً همان چیزی است که برای دم‌آوری فیلتر می‌خواهی.' };
    if (a.taste === 'fruity' && a.brew === 'espresso') return { slug: 'kenya-aa', reason: 'کنیا با رست روشن، در اسپرسو هم شفافیت میوه‌ای حفظ می‌کند؛ برای تجربه‌ای متفاوت.' };
    if (a.taste === 'bold' && a.brew === 'espresso') return { slug: 'continental-espresso', reason: 'بلند اسپرسو با بدنه سنگین و کرمای پایدار، برای فنجان غلیظ و شکلاتی ساخته شده.' };
    if (a.taste === 'bold') return { slug: 'brazil-cerrado', reason: 'شکلات تلخ، ملاس و بدنه پرباد سرادو، انتخاب طبیعی برای فنجان‌های سنگین است.' };
    if (a.roast === 'dark') return { slug: 'sumatra-mandheling', reason: 'بادی چرب و رایحه ادویه‌ای ماندلینگ، برای طرفداران قهوه‌های کم‌اسید و عمیق.' };
    if (a.brew === 'filter') return { slug: 'costa-rica-honey', reason: 'شیرینی عسلی و عطر گل نارنج کاستاریکا، در فیلتر بی‌نظیر است.' };
    return { slug: 'colombia-huila', reason: 'کلمبیا هویلا با تعادل کارامل و سیب سرخ، تقریباً با هر سلیقه و روشی هماهنگ است.' };
  }
  function viewGuide() {
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap py-9"><span class="eyebrow">آزمون سلیقه</span><h1 class="display-2 mt-3">سه سؤال تا فنجان مناسب</h1><p class="mt-2 max-w-lg font-vazir text-[12px] leading-7 text-muted">لازم نیست متخصص باشید. فقط بگویید قهوه را چطور دوست دارید و با چه روشی دم می‌کنید.</p></div></section>' +
      '<section class="section-tight"><div class="wrap max-w-3xl" id="guide-body"></div></section>';
  }
  var guideState = { step: 0, answers: {} };
  function paintGuide() {
    var box = document.getElementById('guide-body');
    if (!box) return;
    var steps = D.guideSteps || [];
    var s = steps[guideState.step];
    if (!s) {
      var res = guidePick(guideState.answers);
      var p = bySlug[res.slug];
      box.innerHTML = '<div class="card-3d rounded-[28px] p-6 sm:p-8"><div class="flex items-center gap-2 text-olive">' + icon('check', 18) + '<span class="font-vazir text-[11px] font-extrabold">پیشنهاد آماده است</span></div><h2 class="display-3 mt-2">فنجان شما: ' + esc(p.name) + '</h2><p class="mt-2 font-vazir text-[12px] leading-7 text-muted">' + esc(res.reason) + '</p><div class="mt-5 max-w-[300px]">' + productCard(p) + '</div><div class="mt-6 flex flex-wrap gap-3"><button type="button" id="guide-restart" class="btn btn-outline btn-sm">' + icon('refresh', 14) + ' آزمون دوباره</button><a href="#/shop" class="btn btn-dark btn-sm">همه محصولات</a></div></div>';
      return;
    }
    var pct = Math.round((guideState.step / steps.length) * 100);
    box.innerHTML = '<div class="card-3d rounded-[28px] p-6 sm:p-8"><div class="flex items-center justify-between font-vazir text-[10px] text-muted"><span>سؤال ' + faNum(guideState.step + 1) + ' از ' + faNum(steps.length) + '</span><span>' + faNum(pct) + '٪</span></div><div class="mt-2 h-1.5 overflow-hidden rounded-full bg-line/70"><div class="h-full rounded-full bg-gradient-to-l from-[#b08d57] to-[#8a6634]" style="width:' + pct + '%"></div></div><h2 class="mt-6 font-vazir text-[20px] font-black text-espresso">' + esc(s.q) + '</h2><div class="mt-5 grid gap-3 sm:grid-cols-3">' + s.options.map(function (o) {
      return '<button type="button" data-guide-opt="' + o.key + '" class="group rounded-2xl border border-line bg-paper p-4 text-right transition hover:-translate-y-0.5 hover:border-gold hover:bg-goldxl/10"><span class="grid h-11 w-11 place-items-center rounded-full bg-goldxl/30 text-[#8a6634]">' + icon(o.icon, 20) + '</span><span class="mt-3 block font-vazir text-[12.5px] font-extrabold text-espresso">' + esc(o.label) + '</span><span class="mt-1 block font-vazir text-[10px] leading-6 text-muted">' + esc(o.desc) + '</span></button>';
    }).join('') + '</div>' + (guideState.step > 0 ? '<button type="button" id="guide-back" class="link-gold mt-5 !text-[11px]">' + icon('arrowRight', 13) + ' سؤال قبلی</button>' : '') + '</div>';
  }

  /* ───────────────────────────── about ───────────────────────────── */
  function viewAbout() {
    return '<section class="relative overflow-hidden bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="cc-hero-ring" style="left:-140px;top:20px;width:420px;height:420px"></div><div class="wrap relative py-12"><div class="grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr]"><div><span class="eyebrow">درباره ما</span><h1 class="display-1 mt-4">از یک انبار کوچک<br /><span class="gold-text">تا فنجان شما.</span></h1><p class="mt-5 max-w-xl font-vazir text-[13px] leading-8 text-muted">کانتیننتال از سال ۱۳۹۲ با یک دستگاه رست یک‌کیلویی شروع شد. امروز هر بچ را در شیراز رست می‌کنیم، مستقیم از کشاورزان می‌خریم و تاریخ رست را روی هر بسته مهر می‌زنیم.</p><div class="mt-7 flex flex-wrap gap-3"><a href="#/shop" class="btn btn-dark">دیدن محصولات ' + icon('arrowLeft', 16) + '</a><a href="#/contact" class="btn btn-outline">تماس با ما</a></div></div><div class="relative flex justify-center"><img src="assets/img/medal-cup.png" alt="مدال کیفیت کانتیننتال" class="w-[58%] max-w-[260px] drop-shadow-[0_24px_30px_rgba(43,29,22,.25)]" /><img src="assets/img/seal.png" alt="" class="absolute -left-2 top-6 w-20 animate-spin-slow opacity-80" /></div></div></div></section>' +
      '<section class="section-tight border-y border-line/70 bg-[#fbf6eb]"><div class="wrap grid grid-cols-2 gap-3 sm:grid-cols-4">' + (D.stats || []).map(function (s) { return '<div class="rounded-2xl border border-line/70 bg-paper/70 px-3 py-4 text-center"><div class="font-vazir text-[22px] font-black text-espresso">' + faNum(s.value) + '<span class="text-gold">' + esc(s.suffix || '') + '</span></div><div class="mt-1 font-vazir text-[10px] text-muted">' + esc(s.label) + '</div></div>'; }).join('') + '</div></section>' +
      '<section class="section"><div class="wrap grid gap-10 lg:grid-cols-[.9fr_1.1fr]"><div>' + sectionHead({ eyebrow: 'مسیر ما', title: 'دوازده سال، یک وسواس: تازگی.', desc: 'هر سال یک قدم جلوتر؛ از یک دستگاه کوچک تا آزمایشگاه کاپینگ و شبکه تأمین مستقیم.' }) + '<div class="mt-6"><img src="assets/img/beans.png" alt="دانه‌های قهوه" class="w-full rounded-[26px] border border-line/70 object-cover" style="max-height:280px" /></div></div><div class="cc-timeline">' + (D.timeline || []).map(function (x) { return '<div class="cc-timeline-item"><span class="font-vazir text-[10px] font-extrabold text-gold">' + esc(x.year) + '</span><h3 class="mt-1 font-vazir text-[12.5px] font-black text-espresso">' + esc(x.title) + '</h3><p class="mt-1 font-vazir text-[10.5px] leading-6 text-muted">' + esc(x.text) + '</p></div>'; }).join('') + '</div></div></section>' +
      '<section class="section-tight bg-gradient-to-b from-cream to-[#f2e9da]"><div class="wrap">' + headRow({ eyebrow: 'تیم', title: 'آدم‌های پشت فنجان', desc: 'کوچک، متمرکز و وسواسی.' }) + '<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">' + (D.team || []).map(function (m) { return '<div class="card-3d rounded-2xl p-5"><span class="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-goldl to-gold font-vazir text-[12px] font-black text-choco">' + esc(m.initials) + '</span><h3 class="mt-3 font-vazir text-[13px] font-black text-espresso">' + esc(m.name) + '</h3><p class="font-vazir text-[9.5px] font-bold text-gold">' + esc(m.role) + '</p><p class="mt-2 font-vazir text-[10.5px] leading-6 text-muted">' + esc(m.bio) + '</p></div>'; }).join('') + '</div></div></section>' +
      '<section class="section"><div class="wrap grid gap-4 md:grid-cols-3">' + (D.values || []).map(function (v) { return '<div class="rounded-[24px] border border-line/80 bg-paper/70 p-5"><span class="grid h-10 w-10 place-items-center rounded-full bg-goldxl/25 text-[#8a6634]">' + icon(v.icon, 18) + '</span><h3 class="mt-3 font-vazir text-[13px] font-black text-espresso">' + esc(v.title) + '</h3><p class="mt-2 font-vazir text-[10.5px] leading-7 text-muted">' + esc(v.text) + '</p></div>'; }).join('') + '</div><div class="wrap mt-10"><div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">' + (D.certifications || []).slice(0, 8).map(function (c) { return '<div class="flex items-center gap-2.5 rounded-2xl border border-line/70 bg-paper/60 px-3 py-2.5"><span class="grid h-8 w-8 place-items-center rounded-full border border-gold/30 text-[#8a6634]">' + icon(c.icon, 14) + '</span><span><span class="block font-serif text-[10px] font-bold uppercase tracking-wider text-espresso">' + esc(c.name) + '</span><span class="block font-vazir text-[8.5px] text-muted">' + esc(c.desc) + '</span></span></div>'; }).join('') + '</div></div></section>' +
      '<section class="section-tight border-t border-line/70 bg-[#1d1410] py-14 grain"><div class="wrap text-center"><span class="font-script text-[30px] text-goldl">For Valuable Moments</span><h2 class="display-2 mt-3 text-cream">لحظه‌های باارزش، با یک فنجان خوب شروع می‌شوند.</h2><a href="#/shop" class="btn btn-gold mt-6">انتخاب قهوه ' + icon('arrowLeft', 16) + '</a></div></section>';
  }

  /* ───────────────────────────── blog ───────────────────────────── */
  var blogCat = 'all';
  function viewBlog() {
    blogCat = 'all';
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap py-9"><span class="eyebrow">مرکز دانش</span><h1 class="display-2 mt-3">وبلاگ کانتیننتال</h1><p class="mt-2 max-w-xl font-vazir text-[12px] leading-7 text-muted">راهنما، داستان و آموزش؛ برای اینکه فنجان بعدی‌تان بهتر باشد.</p><div class="mt-5 flex flex-wrap gap-2" id="blog-cats">' + (D.postCategories || []).map(function (c) { return '<button type="button" data-blog-cat="' + c.key + '" class="chip ' + (c.key === 'all' ? 'chip-gold' : '') + '">' + esc(c.label) + '</button>'; }).join('') + '</div></div></section><section class="section-tight"><div class="wrap"><div id="blog-grid"></div></div></section>';
  }
  function paintBlog() {
    var box = document.getElementById('blog-grid');
    if (!box) return;
    var list = (D.posts || []).filter(function (p) { return blogCat === 'all' || p.categoryKey === blogCat; });
    var featured = list[0];
    var rest = list.slice(1);
    box.innerHTML = (featured ? '<a href="#/blog/' + featured.slug + '" class="group card-3d grid overflow-hidden rounded-[28px] md:grid-cols-[1.05fr_.95fr]"><div class="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#faf2e2] to-[#ead9bf] md:aspect-auto"><img src="' + featured.image + '" alt="' + esc(featured.title) + '" class="h-full w-full object-contain p-8 transition duration-700 group-hover:scale-105" /><span class="absolute right-4 top-4 rounded-full bg-paper/90 px-3 py-1 font-vazir text-[9.5px] font-extrabold text-[#8a6634] backdrop-blur">' + esc(featured.category) + '</span></div><div class="p-6"><div class="flex items-center gap-2 font-vazir text-[9.5px] text-muted"><span>' + esc(featured.date) + '</span><span class="h-1 w-1 rounded-full bg-line"></span><span>' + faNum(featured.readTime) + ' دقیقه مطالعه</span></div><h2 class="mt-3 font-vazir text-[22px] font-black leading-9 text-espresso transition group-hover:text-[#8a6634]">' + esc(featured.title) + '</h2><p class="mt-2 font-vazir text-[11.5px] leading-7 text-muted">' + esc(featured.excerpt) + '</p><span class="link-gold mt-5 !text-[11.5px]">خواندن مقاله ' + icon('arrowLeft', 14) + '</span></div></a>' : '') +
      '<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">' + rest.map(function (p) { return '<a href="#/blog/' + p.slug + '" class="group card-3d overflow-hidden rounded-[26px]"><div class="relative aspect-[16/11] overflow-hidden bg-gradient-to-br from-[#faf2e2] to-[#ead9bf]"><img src="' + p.image + '" alt="' + esc(p.title) + '" loading="lazy" class="h-full w-full object-contain p-6 transition duration-700 group-hover:scale-105" /><span class="absolute right-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 font-vazir text-[9px] font-extrabold text-[#8a6634]">' + esc(p.category) + '</span></div><div class="p-5"><div class="flex items-center gap-2 font-vazir text-[9px] text-muted"><span>' + esc(p.date) + '</span><span class="h-1 w-1 rounded-full bg-line"></span><span>' + faNum(p.readTime) + ' دقیقه</span></div><h3 class="mt-2 font-vazir text-[14.5px] font-black leading-7 text-espresso transition group-hover:text-[#8a6634]">' + esc(p.title) + '</h3><p class="mt-1.5 line-clamp-2 font-vazir text-[10.5px] leading-6 text-muted">' + esc(p.excerpt) + '</p></div></a>'; }).join('') + '</div>';
  }
  function viewPost(p) {
    if (!p) return viewNotFound();
    var related = (D.posts || []).filter(function (x) { return x.slug !== p.slug; }).slice(0, 3);
    var body = (p.body || []).map(function (b) {
      if (b.type === 'h2') return '<h2>' + esc(b.text) + '</h2>';
      if (b.type === 'h3') return '<h3>' + esc(b.text) + '</h3>';
      if (b.type === 'quote') return '<blockquote>' + esc(b.text) + '</blockquote>';
      return '<p>' + esc(b.text) + '</p>';
    }).join('');
    return '<article><section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap max-w-3xl py-9"><div class="flex flex-wrap items-center gap-2 font-vazir text-[10px] text-muted"><a href="#/blog" class="hover:text-espresso">وبلاگ</a><span>/</span><span class="text-gold">' + esc(p.category) + '</span><span>·</span><span>' + esc(p.date) + '</span><span>·</span><span>' + faNum(p.readTime) + ' دقیقه مطالعه</span></div><h1 class="display-2 mt-4">' + esc(p.title) + '</h1><p class="mt-3 font-vazir text-[12.5px] leading-8 text-muted">' + esc(p.excerpt) + '</p><div class="mt-4 flex items-center gap-2.5"><span class="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-goldl to-gold font-vazir text-[9px] font-black text-choco">نو</span><span class="font-vazir text-[10.5px] font-bold text-espresso/70">' + esc(p.author) + '</span></div></div></section>' +
      '<div class="wrap max-w-3xl py-8"><div class="overflow-hidden rounded-[26px] border border-line/70 bg-gradient-to-br from-[#fdf8ee] to-[#eadfca]"><img src="' + p.image + '" alt="' + esc(p.title) + '" class="mx-auto h-[260px] w-auto object-contain p-8 sm:h-[320px]" /></div><div class="prose-fa mt-8">' + body + '</div>' +
      '<div class="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/70 bg-paper/70 px-4 py-3"><span class="font-vazir text-[10.5px] text-muted">این مقاله را به اشتراک بگذارید</span><div class="flex gap-2"><button type="button" data-toast="لینک مقاله کپی شد (نمایشی)" class="chip">' + icon('linkedin', 13) + ' لینکدین</button><button type="button" data-toast="لینک مقاله کپی شد (نمایشی)" class="chip">' + icon('send', 13) + ' تلگرام</button></div></div>' +
      '<div class="mt-10"><h2 class="display-3">مقالات مرتبط</h2><div class="mt-4 grid gap-4 sm:grid-cols-3">' + related.map(function (r) { return '<a href="#/blog/' + r.slug + '" class="group rounded-2xl border border-line/70 bg-paper/70 p-3 transition hover:-translate-y-0.5 hover:border-gold"><div class="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-[#fdf8ee] to-[#eadfca]"><img src="' + r.image + '" alt="" class="h-full w-auto object-contain p-2" /></div><h3 class="mt-2 font-vazir text-[11.5px] font-black leading-6 text-espresso group-hover:text-[#8a6634]">' + esc(r.title) + '</h3></a>'; }).join('') + '</div></div></div></article>';
  }

  /* ───────────────────────────── contact ───────────────────────────── */
  function viewContact() {
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap py-9"><span class="eyebrow">تماس</span><h1 class="display-2 mt-3">با ما حرف بزنید</h1><p class="mt-2 max-w-xl font-vazir text-[12px] leading-7 text-muted">برای مشاوره انتخاب قهوه، سفارش عمده یا هر سؤالی درباره رست و ارسال، تیم ما پاسخ می‌دهد.</p></div></section>' +
      '<section class="section-tight"><div class="wrap grid gap-6 lg:grid-cols-[1fr_340px]"><form id="contact-form" class="card-3d rounded-[26px] p-5 sm:p-6"><h2 class="font-vazir text-[14px] font-black text-espresso">فرم پیام</h2><div class="mt-4 grid gap-3 sm:grid-cols-2"><div><label class="label" for="ct-name">نام</label><input id="ct-name" required class="field" placeholder="نام شما" /></div><div><label class="label" for="ct-phone">موبایل</label><input id="ct-phone" required dir="ltr" inputmode="tel" class="field text-left" placeholder="0912 345 6789" /></div><div class="sm:col-span-2"><label class="label" for="ct-email">ایمیل</label><input id="ct-email" type="email" dir="ltr" class="field text-left" placeholder="you@example.com" /></div><div class="sm:col-span-2"><label class="label" for="ct-subject">موضوع</label><select id="ct-subject" class="field"><option>مشاوره خرید</option><option>سفارش عمده</option><option>پیگیری سفارش</option><option>همکاری و نمایندگی</option><option>سایر</option></select></div><div class="sm:col-span-2"><label class="label" for="ct-msg">پیام</label><textarea id="ct-msg" required class="field !min-h-[120px]" placeholder="چطور می‌توانیم کمک کنیم؟"></textarea></div></div><button type="submit" class="btn btn-dark mt-5 w-full">ارسال پیام ' + icon('send', 16) + '</button><p id="contact-done" class="mt-3 hidden rounded-xl bg-olive/10 px-3 py-2 text-center font-vazir text-[11px] font-bold text-olive">پیام شما ثبت شد (نمایشی). به‌زودی پاسخ می‌دهیم.</p></form>' +
      '<aside class="space-y-3"><div class="card-3d rounded-2xl p-4"><h3 class="font-vazir text-[11.5px] font-black text-espresso">رستری و فروشگاه</h3><ul class="mt-3 space-y-3 font-vazir text-[10.5px] leading-6 text-espresso/70"><li class="flex gap-2">' + icon('pin', 15, 'mt-0.5 shrink-0 text-gold') + 'شیراز، میدان گلسرخ</li><li class="flex gap-2">' + icon('phone', 15, 'mt-0.5 shrink-0 text-gold') + '<a href="tel:+987132334562" dir="ltr" class="hover:text-espresso">۰۷۱-۳۲۳۳ ۴۵۶۲</a></li><li class="flex gap-2">' + icon('mail', 15, 'mt-0.5 shrink-0 text-gold') + '<a href="mailto:hello@continental.coffee" dir="ltr" class="hover:text-espresso">hello@continental.coffee</a></li><li class="flex gap-2">' + icon('clock', 15, 'mt-0.5 shrink-0 text-gold') + 'شنبه تا پنجشنبه، ۹ صبح تا ۷ عصر</li></ul></div><div class="overflow-hidden rounded-2xl border border-line/80 bg-[#e9e2d2]"><div class="relative h-[210px] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:26px_26px]"><span class="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-wine text-cream shadow-lift">' + icon('pin', 19) + '</span><span class="absolute bottom-3 right-3 rounded-full bg-paper/90 px-3 py-1 font-vazir text-[9px] font-bold text-espresso/70">رستری گلسرخ</span></div></div><a href="#/faq" class="flex items-center justify-between rounded-2xl border border-line/80 bg-paper/70 px-4 py-3 font-vazir text-[11px] font-bold text-espresso/70 transition hover:border-gold"><span>سؤالات متداول</span>' + icon('arrowLeft', 14) + '</a></aside></div></section>';
  }

  /* ───────────────────────────── subscription ───────────────────────────── */
  function viewSubscription() {
    return '<section class="relative overflow-hidden bg-choco py-12 text-cream grain"><div class="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl"></div><div class="wrap relative grid items-center gap-8 lg:grid-cols-[1.1fr_.9fr]"><div><span class="font-vazir text-[10px] font-extrabold uppercase tracking-[0.25em] text-goldl">اشتراک قهوه</span><h1 class="display-2 mt-3 text-cream">هر ماه، یک فنجان تازه در خانه.</h1><p class="mt-3 max-w-lg font-vazir text-[12.5px] leading-7 text-cream/60">سلیقه، روش دم‌آوری و دوره تحویل را انتخاب کنید؛ ما هر دوره بسته تازه‌رست می‌رسانیم. هر زمان بخواهید متوقف یا لغو کنید.</p><div class="mt-6 flex flex-wrap gap-3"><button type="button" data-scroll-form class="btn btn-gold">شروع اشتراک ' + icon('arrowLeft', 16) + '</button><a href="#/faq" class="btn btn-outline !border-cream/25 !bg-transparent !text-cream">سؤالات متداول</a></div></div><img src="assets/img/bag-wine.png" alt="بسته اشتراک" class="mx-auto w-[52%] max-w-[280px] drop-shadow-[0_34px_38px_rgba(0,0,0,.55)]" /></div></section>' +
      '<section class="section-tight"><div class="wrap"><div class="mb-7 text-center"><span class="eyebrow">طرح‌ها</span><h2 class="display-3 mt-2">یک طرح برای هر سلیقه</h2></div><div class="grid gap-4 lg:grid-cols-3">' + (D.plans || []).map(function (pl) {
        return '<div class="relative rounded-[26px] border ' + (pl.highlight ? 'border-gold bg-[#fdf8ee] shadow-lift' : 'border-line/80 bg-paper/70') + ' p-6">' + (pl.highlight ? '<span class="absolute -top-2.5 right-5 rounded-full bg-gold px-3 py-0.5 font-vazir text-[9px] font-black text-choco">پرفروش‌ترین</span>' : '') + '<div class="flex items-center justify-between"><div><span class="font-vazir text-[9px] font-extrabold tracking-widest text-gold">' + esc(pl.en) + '</span><h3 class="mt-1 font-vazir text-[18px] font-black text-espresso">' + esc(pl.name) + '</h3></div><span class="font-vazir text-[10px] text-muted">' + esc(pl.period) + '</span></div><div class="mt-3 font-vazir text-[22px] font-black text-espresso">' + money(pl.price) + '</div><p class="mt-2 font-vazir text-[10.5px] leading-6 text-muted">' + esc(pl.desc) + '</p><ul class="mt-4 space-y-2">' + pl.features.map(function (f) { return '<li class="flex items-start gap-2 font-vazir text-[10.5px] leading-6 text-espresso/75"><span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"></span>' + esc(f) + '</li>'; }).join('') + '</ul><button type="button" data-plan="' + pl.key + '" class="btn ' + (pl.highlight ? 'btn-dark' : 'btn-outline') + ' btn-sm mt-5 w-full">انتخاب ' + esc(pl.name) + '</button></div>';
      }).join('') + '</div></div></section>' +
      '<section class="section-tight border-y border-line/70 bg-[#fbf6eb]"><div class="wrap grid gap-4 sm:grid-cols-3">' + [['۱', 'سلیقه و روش را انتخاب کنید'], ['۲', 'هر دوره بسته تازه رست می‌شود'], ['۳', 'درِ خانه تحویل بگیرید']].map(function (s) { return '<div class="text-center"><span class="mx-auto grid h-11 w-11 place-items-center rounded-full bg-choco font-vazir text-[13px] font-black text-goldxl">' + s[0] + '</span><p class="mt-3 font-vazir text-[11.5px] font-extrabold text-espresso">' + s[1] + '</p></div>'; }).join('') + '</div></section>' +
      '<section class="section-tight" id="sub-form-wrap"><div class="wrap max-w-2xl"><form id="sub-form" class="card-3d rounded-[26px] p-5 sm:p-7"><h2 class="font-vazir text-[16px] font-black text-espresso">شروع اشتراک</h2><p class="mt-1 font-vazir text-[10.5px] text-muted">این فرم در نسخه نمایشی است و اشتراک واقعی ایجاد نمی‌کند.</p><div class="mt-4 grid gap-3 sm:grid-cols-2"><div><label class="label" for="sub-plan">طرح</label><select id="sub-plan" class="field">' + (D.plans || []).map(function (pl) { return '<option value="' + pl.key + '">' + esc(pl.name) + ' — ' + money(pl.price) + '</option>'; }).join('') + '</select></div><div><label class="label" for="sub-period">دوره تحویل</label><select id="sub-period" class="field"><option>هر ماه</option><option>هر دو هفته</option><option>هر دو ماه</option></select></div><div><label class="label" for="sub-taste">سلیقه</label><select id="sub-taste" class="field"><option>میوه‌ای و روشن</option><option>متعادل و شیرین</option><option>شکلاتی و پربادی</option><option>غافلگیری؛ هر بار یک خاستگاه</option></select></div><div><label class="label" for="sub-brew">روش دم‌آوری</label><select id="sub-brew" class="field"><option>فیلتر (V60 / کمکس)</option><option>اسپرسو / موکاپات</option><option>فرنچ‌پرس</option><option>همه روش‌ها</option></select></div><div class="sm:col-span-2"><label class="label" for="sub-name">نام و موبایل</label><input id="sub-name" required class="field" placeholder="نام شما · 0912 345 6789" /></div></div><button type="submit" class="btn btn-dark mt-5 w-full">ثبت درخواست اشتراک</button><p id="sub-done" class="mt-3 hidden rounded-xl bg-olive/10 px-3 py-2 text-center font-vazir text-[11px] font-bold text-olive">درخواست اشتراک ثبت شد (نمایشی).</p></form></div></section>';
  }

  /* ───────────────────────────── services ───────────────────────────── */
  function viewServices() {
    var groups = D.serviceGroups || [];
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap py-9"><span class="eyebrow">خدمات</span><h1 class="display-2 mt-3">از دانه تا فنجان، کنار شما</h1><p class="mt-2 max-w-2xl font-vazir text-[12px] leading-7 text-muted">رست اختصاصی، آموزش، تجهیز منوی کافه و تأمین عمده؛ خدماتی که با دانش قهوه و تجربه عملی همراه است.</p></div></section>' +
      '<section class="section-tight"><div class="wrap space-y-8">' + groups.map(function (g) {
        var items = (D.services || []).filter(function (s) { return s.group === g; });
        return '<div><div class="mb-3 flex items-center gap-3"><span class="h-px flex-1 bg-line/70"></span><h2 class="font-vazir text-[13px] font-black text-espresso">' + esc(g) + '</h2><span class="h-px flex-1 bg-line/70"></span></div><div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">' + items.map(function (s) {
          return '<div class="card-3d rounded-2xl p-4"><span class="grid h-9 w-9 place-items-center rounded-full bg-goldxl/25 text-[#8a6634]">' + icon(s.icon, 17) + '</span><h3 class="mt-2.5 font-vazir text-[12px] font-black text-espresso">' + esc(s.title) + '</h3><p class="mt-1.5 font-vazir text-[10px] leading-6 text-muted">' + esc(s.desc) + '</p></div>';
        }).join('') + '</div></div>';
      }).join('') + '<div class="rounded-[26px] bg-choco p-6 text-center text-cream sm:p-8"><h2 class="display-3 text-cream">خدمات سازمانی یا سفارشی می‌خواهید؟</h2><p class="mx-auto mt-2 max-w-lg font-vazir text-[11px] leading-7 text-cream/55">برای کافه، رستوران یا هدیه سازمانی، فرم سفارش عمده را پر کنید یا مستقیم تماس بگیرید.</p><div class="mt-5 flex flex-wrap justify-center gap-3"><a href="#/wholesale" class="btn btn-gold btn-sm">سفارش عمده</a><a href="#/contact" class="btn btn-outline btn-sm !border-cream/25 !bg-transparent !text-cream">تماس</a></div></div></div></section>';
  }

  /* ───────────────────────────── faq ───────────────────────────── */
  function viewFaq() {
    return '<section class="border-b border-line/70 bg-gradient-to-b from-[#fbf6ea] to-cream"><div class="wrap py-9"><span class="eyebrow">پشتیبانی</span><h1 class="display-2 mt-3">سؤالات متداول</h1><p class="mt-2 max-w-xl font-vazir text-[12px] leading-7 text-muted">پاسخ کوتاه و شفاف به پرتکرارترین سؤال‌ها درباره خرید، رست، ارسال و نگهداری قهوه.</p><div class="mt-5 flex max-w-md items-center gap-2 rounded-2xl border border-line bg-paper px-3"><span class="text-gold">' + icon('search', 16) + '</span><input id="faq-q" placeholder="جستجو در سؤالات…" class="h-12 w-full bg-transparent font-vazir text-[12px] outline-none" /></div></div></section>' +
      '<section class="section-tight"><div class="wrap max-w-3xl"><div id="faq-list" class="space-y-2.5">' + faqList(D.faqs) + '</div><div class="mt-8 rounded-2xl border border-line/70 bg-paper/60 p-5 text-center"><p class="font-vazir text-[11.5px] font-bold text-espresso">پاسخ سوالتان را پیدا نکردید؟</p><a href="#/contact" class="btn btn-dark btn-sm mt-3">تماس با پشتیبانی</a></div></div></section>';
  }
  function faqList(list) {
    if (!list.length) return '<div class="rounded-2xl border border-line/70 bg-paper/60 px-5 py-10 text-center font-vazir text-[12px] text-muted">سؤالی با این عبارت پیدا نشد.</div>';
    return list.map(function (f) { return '<details class="cc-accordion rounded-2xl border border-line/80 bg-paper/70 px-4 py-3.5"><summary class="flex items-center justify-between gap-3 font-vazir text-[12.5px] font-extrabold text-espresso"><span>' + esc(f.q) + '</span><span class="acc-icon text-gold">' + icon('plus', 16) + '</span></summary><p class="mt-3 font-vazir text-[11px] leading-7 text-muted">' + esc(f.a) + '</p></details>'; }).join('');
  }

  /* ───────────────────────────── wholesale ───────────────────────────── */
  function viewWholesale() {
    return '<section class="relative overflow-hidden bg-choco py-12 text-cream grain"><div class="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-wine/20 blur-3xl"></div><div class="wrap relative"><span class="font-vazir text-[10px] font-extrabold uppercase tracking-[0.25em] text-goldl">عمده و نمایندگی</span><h1 class="display-2 mt-3 text-cream">قهوه‌ای که کسب‌وکارتان را ثابت نگه می‌دارد.</h1><p class="mt-3 max-w-xl font-vazir text-[12.5px] leading-7 text-cream/60">از ۵ کیلوگرم شروع می‌شود؛ با قیمت اختصاصی، فاکتور رسمی، رست ثابت و پشتیبانی فنی برای کافه و رستوران.</p><button type="button" data-scroll-form class="btn btn-gold mt-6">درخواست قیمت ' + icon('arrowLeft', 16) + '</button></div></section>' +
      '<section class="section-tight"><div class="wrap"><h2 class="display-3">پلکان تخفیف عمده</h2><div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">' + (D.wholesaleTiers || []).map(function (t) { return '<div class="card-3d rounded-2xl p-5"><span class="font-vazir text-[10px] text-muted">' + esc(t.range) + '</span><div class="mt-2 font-vazir text-[28px] font-black text-[#8a6634]">' + esc(t.discount) + '</div><p class="mt-2 font-vazir text-[10px] leading-6 text-muted">' + esc(t.perks) + '</p></div>'; }).join('') + '</div>' +
        '<div class="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><div class="rounded-[24px] border border-line/70 bg-paper/60 p-5"><h3 class="font-vazir text-[13px] font-black text-espresso">شرایط همکاری</h3><ul class="mt-3 space-y-2.5">' + (D.distributorRequirements || []).map(function (r) { return '<li class="flex items-start gap-2 font-vazir text-[10.5px] leading-6 text-espresso/70"><span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"></span>' + esc(r) + '</li>'; }).join('') + '</ul></div>' +
        '<form id="wholesale-form" class="card-3d rounded-[24px] p-5"><h3 class="font-vazir text-[13px] font-black text-espresso">درخواست قیمت عمده</h3><div class="mt-4 grid gap-3 sm:grid-cols-2"><div><label class="label" for="ws-company">نام کسب‌وکار</label><input id="ws-company" required class="field" placeholder="کافه / رستوران / شرکت" /></div><div><label class="label" for="ws-name">نام مسئول</label><input id="ws-name" required class="field" placeholder="نام شما" /></div><div><label class="label" for="ws-phone">موبایل</label><input id="ws-phone" required dir="ltr" inputmode="tel" class="field text-left" placeholder="0912 345 6789" /></div><div><label class="label" for="ws-volume">حجم ماهانه</label><select id="ws-volume" class="field"><option>۵ تا ۲۰ کیلوگرم</option><option>۲۰ تا ۵۰ کیلوگرم</option><option>۵۰ تا ۱۰۰ کیلوگرم</option><option>بیش از ۱۰۰ کیلوگرم</option></select></div><div class="sm:col-span-2"><label class="label" for="ws-note">توضیحات</label><textarea id="ws-note" class="field !min-h-[90px]" placeholder="نوع مصرف، تجهیزات، شهر…"></textarea></div></div><button type="submit" class="btn btn-dark mt-4 w-full">ارسال درخواست</button><p id="ws-done" class="mt-3 hidden rounded-xl bg-olive/10 px-3 py-2 text-center font-vazir text-[11px] font-bold text-olive">درخواست ثبت شد (نمایشی)؛ کارشناس تماس می‌گیرد.</p></form></div></div></section>';
  }

  /* ───────────────────────────── 404 ───────────────────────────── */
  function viewNotFound() {
    return '<section class="section"><div class="wrap flex flex-col items-center py-20 text-center"><span class="font-script text-[64px] leading-none text-gold/40">404</span><h1 class="mt-2 font-vazir text-[24px] font-black text-espresso">این صفحه پیدا نشد</h1><p class="mt-2 font-vazir text-[12px] text-muted">ممکن است لینک قدیمی باشد. از فروشگاه شروع کنید.</p><div class="mt-6 flex gap-3"><a href="#/" class="btn btn-dark btn-sm">خانه</a><a href="#/shop" class="btn btn-outline btn-sm">فروشگاه</a></div></div></section>';
  }

  /* ───────────────────────────── bindings ───────────────────────────── */
  function bindHome() {
    var t = D.testimonials || [];
    var ti = 0;
    var body = document.getElementById('testi-body');
    var dots = document.getElementById('testi-dots');
    function paintT() {
      if (!body || !t.length) return;
      var x = t[ti % t.length];
      body.innerHTML = '<div class="flex items-start gap-4"><span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-goldl to-gold font-vazir text-[11px] font-black text-choco">' + esc(x.initials) + '</span><div><p class="font-vazir text-[12.5px] leading-8 text-espresso/80">«' + esc(x.text) + '»</p><div class="mt-3 flex flex-wrap items-center gap-2"><span class="font-vazir text-[11px] font-black text-espresso">' + esc(x.name) + '</span><span class="font-vazir text-[9.5px] text-muted">' + esc(x.role) + ' · ' + esc(x.city) + '</span>' + stars(x.rating, 11) + '</div></div></div>';
      if (dots) dots.innerHTML = t.map(function (_, i) { return '<button type="button" data-t-dot="' + i + '" class="h-1.5 w-1.5 rounded-full ' + (i === ti % t.length ? 'bg-gold' : 'bg-line') + '" aria-label="نظر ' + (i + 1) + '"></button>'; }).join('');
      hydrateIcons(body);
    }
    paintT();
    document.querySelectorAll('[data-t-next]').forEach(function (b) { b.addEventListener('click', function () { ti = (ti + 1) % t.length; paintT(); }); });
    document.querySelectorAll('[data-t-prev]').forEach(function (b) { b.addEventListener('click', function () { ti = (ti - 1 + t.length) % t.length; paintT(); }); });
    if (dots) {
      dots.addEventListener('click', function (e) {
        var d = e.target.closest('[data-t-dot]');
        if (!d) return;
        ti = Number(d.getAttribute('data-t-dot')) % t.length;
        paintT();
      });
    }
  }
  function bindShop() {
    var grid = document.getElementById('shop-grid');
    var count = document.getElementById('shop-count');
    function paint() {
      if (!grid) return;
      grid.innerHTML = shopGrid();
      if (count) count.textContent = faNum(filteredProducts().length) + ' محصول';
      document.querySelectorAll('[data-shop-cat]').forEach(function (b) { b.classList.toggle('chip-gold', b.getAttribute('data-shop-cat') === shop.category); });
      document.querySelectorAll('[data-shop-roast]').forEach(function (b) { b.classList.toggle('chip-gold', b.getAttribute('data-shop-roast') === shop.roast); });
      hydrateIcons(grid);
      initReveal();
    }
    document.querySelectorAll('[data-shop-cat]').forEach(function (b) { b.addEventListener('click', function () { shop.category = b.getAttribute('data-shop-cat'); paint(); }); });
    document.querySelectorAll('[data-shop-roast]').forEach(function (b) { b.addEventListener('click', function () { shop.roast = b.getAttribute('data-shop-roast'); paint(); }); });
    var q = document.getElementById('shop-q');
    if (q) { var timer; q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { shop.q = q.value; paint(); }, 200); }); }
    var origin = document.getElementById('shop-origin');
    if (origin) origin.addEventListener('change', function () { shop.origin = origin.value; paint(); });
    var flavor = document.getElementById('shop-flavor');
    if (flavor) flavor.addEventListener('change', function () { shop.flavor = flavor.value; paint(); });
    var max = document.getElementById('shop-max');
    if (max) max.addEventListener('input', function () { shop.max = Number(max.value); var l = document.getElementById('shop-max-label'); if (l) l.textContent = money(shop.max); paint(); });
    var organic = document.getElementById('shop-organic');
    if (organic) organic.addEventListener('change', function () { shop.organic = organic.checked; paint(); });
    var stock = document.getElementById('shop-stock');
    if (stock) stock.addEventListener('change', function () { shop.inStock = stock.checked; paint(); });
    var sort = document.getElementById('shop-sort');
    if (sort) sort.addEventListener('change', function () { shop.sort = sort.value; paint(); });
    function reset() {
      shop = defaultShop(null);
      var url = '#/shop';
      if (location.hash !== url) history.replaceState(null, '', url);
      render();
    }
    var r1 = document.getElementById('shop-reset'); if (r1) r1.addEventListener('click', reset);
    var r2 = document.getElementById('shop-reset-2'); if (r2) r2.addEventListener('click', reset);
    var toggle = document.getElementById('shop-filters-toggle');
    if (toggle) toggle.addEventListener('click', function () {
      var side = document.querySelector('aside.cc-sticky-filters');
      if (side) side.classList.toggle('hidden');
    });
  }
  function bindProduct(p) {
    if (!p) return;
    var isBox = p.slug === 'gift-trio-box';
    var st = { weight: 250, gift: 'none', qty: 1 };
    function unit() { return isBox ? p.price : pricePerWeight(p.price, st.weight) + giftPrice(st.gift); }
    function paint() {
      var price = document.getElementById('buy-price');
      var unitEl = document.getElementById('buy-unit');
      var qty = document.getElementById('buy-qty');
      if (price) price.textContent = money(unit() * st.qty);
      if (unitEl) unitEl.textContent = isBox ? 'بسته سه‌گانه' : 'برای ' + faNum(st.weight) + ' گرم';
      if (qty) qty.textContent = faNum(st.qty);
      document.querySelectorAll('[data-weight]').forEach(function (b) {
        var on = Number(b.getAttribute('data-weight')) === st.weight;
        b.classList.toggle('!border-gold', on);
        b.classList.toggle('!bg-goldxl/25', on);
        b.classList.toggle('!text-espresso', on);
      });
    }
    document.querySelectorAll('[data-weight]').forEach(function (b) { b.addEventListener('click', function () { st.weight = Number(b.getAttribute('data-weight')); paint(); }); });
    var gift = document.getElementById('buy-gift');
    if (gift) gift.addEventListener('change', function () { st.gift = gift.value; paint(); });
    var dec = document.querySelector('[data-buy-dec]');
    var inc = document.querySelector('[data-buy-inc]');
    if (dec) dec.addEventListener('click', function () { st.qty = Math.max(1, st.qty - 1); paint(); });
    if (inc) inc.addEventListener('click', function () { st.qty = Math.min(9, st.qty + 1); paint(); });
    var add = document.getElementById('buy-add');
    if (add) add.addEventListener('click', function () {
      var grind = (document.getElementById('buy-grind') || {}).value || 'دانه کامل';
      addToCart({ slug: p.slug, weight: st.weight, grind: grind, gift: st.gift, qty: st.qty });
    });
    document.querySelectorAll('[data-thumb]').forEach(function (b) { b.addEventListener('click', function () {
      var main = document.getElementById('p-main');
      if (main) main.src = b.getAttribute('data-thumb');
      document.querySelectorAll('[data-thumb]').forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
    }); });
    paint();
  }
  function bindCheckout() {
    document.querySelectorAll('[data-ship]').forEach(function (r) { r.addEventListener('change', function () { checkout.shipping = r.value; document.querySelectorAll('[data-ship]').forEach(function (x) { var l = x.closest('label'); if (l) { l.classList.toggle('border-gold', x.checked); l.classList.toggle('bg-goldxl/20', x.checked); l.classList.toggle('border-line', !x.checked); l.classList.toggle('bg-paper', !x.checked); } }); paintTotals(); }); });
    var apply = document.getElementById('co-apply');
    if (apply) apply.addEventListener('click', function () {
      var input = document.getElementById('co-coupon');
      var code = (input.value || '').trim().toUpperCase();
      if (!code) { checkout.coupon = null; paintTotals(); return; }
      if (!(D.coupons || {})[code]) { toast('این کد تخفیف معتبر نیست', 'percent'); return; }
      checkout.coupon = code;
      paintTotals();
      toast('کد تخفیف اعمال شد: ' + ((D.coupons || {})[code].label || code), 'percent');
    });
    var form = document.getElementById('co-form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); placeOrder(form); });
  }
  function bindTrack() {
    var form = document.getElementById('track-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = (document.getElementById('track-code').value || '').trim();
      if (!code) return;
      location.hash = '#/track?code=' + encodeURIComponent(code);
    });
  }
  function bindConsultant() {
    var form = document.getElementById('consult-form');
    var input = document.getElementById('consult-input');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = (input.value || '').trim();
      if (!text) return;
      input.value = '';
      pushChat(text);
    });
    document.querySelectorAll('[data-prompt]').forEach(function (b) { b.addEventListener('click', function () { pushChat(b.getAttribute('data-prompt')); }); });
    var box = document.getElementById('chat-scroll');
    if (box) box.scrollTop = box.scrollHeight;
  }
  function bindGuide() {
    paintGuide();
    var box = document.getElementById('guide-body');
    if (!box) return;
    box.addEventListener('click', function (e) {
      var opt = e.target.closest('[data-guide-opt]');
      if (opt) {
        var step = (D.guideSteps || [])[guideState.step];
        if (!step) return;
        guideState.answers[step.key] = opt.getAttribute('data-guide-opt');
        guideState.step += 1;
        paintGuide();
        return;
      }
      if (e.target.closest('#guide-back')) { guideState.step = Math.max(0, guideState.step - 1); paintGuide(); return; }
      if (e.target.closest('#guide-restart')) { guideState = { step: 0, answers: {} }; paintGuide(); }
    });
  }
  function bindBlog() { paintBlog(); document.querySelectorAll('[data-blog-cat]').forEach(function (b) { b.addEventListener('click', function () { blogCat = b.getAttribute('data-blog-cat'); document.querySelectorAll('[data-blog-cat]').forEach(function (x) { x.classList.toggle('chip-gold', x === b); }); paintBlog(); }); }); }
  function bindContact() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var ok = document.getElementById('contact-done');
      if (ok) ok.classList.remove('hidden');
      toast('پیام شما ثبت شد (نمایشی)');
      form.reset();
    });
  }
  function bindFaq() {
    var q = document.getElementById('faq-q');
    var list = document.getElementById('faq-list');
    if (!q || !list) return;
    q.addEventListener('input', function () {
      var term = q.value.trim();
      var f = (D.faqs || []).filter(function (x) { return (x.q + ' ' + x.a).indexOf(term) >= 0; });
      list.innerHTML = faqList(f);
      hydrateIcons(list);
    });
  }
  function bindSubscription() {
    var form = document.getElementById('sub-form');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var ok = document.getElementById('sub-done');
      if (ok) ok.classList.remove('hidden');
      toast('درخواست اشتراک ثبت شد (نمایشی)', 'calendar');
    });
    document.querySelectorAll('[data-plan]').forEach(function (b) {
      b.addEventListener('click', function () {
        var sel = document.getElementById('sub-plan');
        if (sel) sel.value = b.getAttribute('data-plan');
        var formEl = document.getElementById('sub-form');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }
  function bindWholesale() {
    var form = document.getElementById('wholesale-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var ok = document.getElementById('ws-done');
      if (ok) ok.classList.remove('hidden');
      toast('درخواست عمده ثبت شد (نمایشی)', 'store');
    });
  }

  /* ───────────────────────────── search ───────────────────────────── */
  function bindSearch() {
    var input = document.getElementById('search-input');
    var body = document.getElementById('search-body');
    if (!input || !body) return;
    var popular = ['اتیوپی', 'شکلاتی', 'اسپرسو', 'کنیا', 'فیلتر', 'هدیه'];
    function paint() {
      var term = input.value.trim();
      if (!term) {
        body.innerHTML = '<p class="mb-3 font-vazir text-[11px] font-extrabold text-muted">جستجوهای محبوب</p><div class="flex flex-wrap gap-2">' + popular.map(function (x) { return '<button type="button" data-term="' + x + '" class="chip transition hover:border-gold">' + x + '</button>'; }).join('') + '</div>';
        return;
      }
      var res = products.filter(function (p) { return [p.name, p.en, p.origin, p.region].concat(p.notes || []).join(' ').toLowerCase().indexOf(term.toLowerCase()) >= 0; }).slice(0, 4);
      if (!res.length) {
        body.innerHTML = '<div class="py-8 text-center"><p class="font-vazir text-[13px] font-bold text-espresso">نتیجه‌ای پیدا نشد</p><p class="mt-1 font-vazir text-[11px] text-muted">با نام خاستگاه یا نت طعم (مثلاً «شکلات» یا «کنیا») جستجو کنید.</p><a href="#/shop" data-close="search" class="btn btn-outline btn-sm mt-4">مشاهده همه محصولات</a></div>';
        return;
      }
      body.innerHTML = '<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">' + res.map(function (p) {
        return '<a href="#/product/' + p.slug + '" data-close="search" class="group flex items-center gap-3 rounded-2xl border border-line bg-cream/40 p-3 transition hover:border-gold hover:bg-paper"><span class="relative h-16 w-14 shrink-0 rounded-xl bg-gradient-to-b from-[#fdf8ee] to-[#eddfc8]"><img src="' + p.image + '" alt="" class="h-full w-full object-contain p-1" /></span><span class="min-w-0"><span class="block truncate font-vazir text-[12.5px] font-black text-espresso">' + esc(p.name) + '</span><span class="mt-0.5 block truncate font-vazir text-[10.5px] text-muted">' + esc(p.region) + ' · ' + esc(p.notes[0]) + '</span><span class="mt-1 block font-vazir text-[11px] font-bold text-[#8a6634]">' + money(p.price) + '</span></span></a>';
      }).join('') + '</div><div class="mt-5 flex justify-end"><a href="#/shop?q=' + encodeURIComponent(term) + '" data-close="search" class="btn btn-dark btn-sm">همه نتایج در فروشگاه ' + icon('arrowLeft', 15) + '</a></div>';
      hydrateIcons(body);
    }
    input.addEventListener('input', paint);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var term = input.value.trim();
        if (term) { location.hash = '#/shop?q=' + encodeURIComponent(term); closeLayers(); }
      }
    });
    body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-term]');
      if (b) { input.value = b.getAttribute('data-term'); paint(); input.focus(); }
    });
    paint();
  }
  function buildMobileNav() {
    var nav = document.getElementById('mobile-nav');
    if (!nav) return;
    nav.innerHTML = (D.menu || []).map(function (m, i) {
      return '<li><a href="#' + m.href + '" data-close="mobile" class="flex items-center justify-between rounded-xl px-3 py-3 font-vazir text-[14px] font-extrabold text-espresso/70 transition hover:bg-cream"><span>' + esc(m.label) + '</span><span class="font-serif text-[10px] text-gold/60">' + pad2(i + 1) + '</span></a></li>';
    }).join('');
  }

  /* ───────────────────────────── router ───────────────────────────── */
  function parseHash() {
    var raw = location.hash.replace(/^#/, '') || '/';
    var parts = raw.split('?');
    var path = parts[0] || '/';
    if (path.charAt(0) !== '/') path = '/' + path;
    return { path: path, query: new URLSearchParams(parts[1] || '') };
  }
  function currentPath() { return parseHash().path; }
  function resolve(path, query) {
    if (path === '/') return { html: viewHome(), bind: bindHome, title: 'قهوه اسپشیالتی، رست تازه' };
    if (path === '/shop') return { html: viewShop(query), bind: bindShop, title: 'فروشگاه' };
    var m = path.match(/^\/product\/([^/]+)$/);
    if (m) {
      var p = bySlug[decodeURIComponent(m[1])];
      return { html: viewProduct(p), bind: function () { bindProduct(p); }, title: p ? p.name : 'محصول' };
    }
    if (path === '/cart') return { html: viewCartPage(), bind: function () {}, title: 'سبد خرید' };
    if (path === '/checkout') return { html: viewCheckout(), bind: bindCheckout, title: 'پرداخت' };
    if (path === '/track') return { html: viewTrack(query), bind: bindTrack, title: 'پیگیری سفارش' };
    m = path.match(/^\/order\/([^/]+)$/);
    if (m) return { html: viewOrder(decodeURIComponent(m[1])), bind: function () {}, title: 'سفارش ثبت شد' };
    if (path === '/consultant') return { html: viewConsultant(), bind: bindConsultant, title: 'مشاور هوشمند' };
    if (path === '/about') return { html: viewAbout(), bind: function () {}, title: 'درباره ما' };
    if (path === '/blog') return { html: viewBlog(), bind: bindBlog, title: 'وبلاگ' };
    m = path.match(/^\/blog\/([^/]+)$/);
    if (m) {
      var post = (D.posts || []).filter(function (x) { return x.slug === decodeURIComponent(m[1]); })[0];
      return { html: viewPost(post), bind: function () {}, title: post ? post.title : 'مقاله' };
    }
    if (path === '/contact') return { html: viewContact(), bind: bindContact, title: 'تماس' };
    if (path === '/guide') return { html: viewGuide(), bind: bindGuide, title: 'راهنمای انتخاب' };
    if (path === '/subscription') return { html: viewSubscription(), bind: bindSubscription, title: 'اشتراک قهوه' };
    if (path === '/services') return { html: viewServices(), bind: function () {}, title: 'خدمات' };
    if (path === '/faq') return { html: viewFaq(), bind: bindFaq, title: 'سؤالات متداول' };
    if (path === '/wholesale') return { html: viewWholesale(), bind: bindWholesale, title: 'سفارش عمده' };
    return { html: viewNotFound(), bind: function () {}, title: 'صفحه پیدا نشد' };
  }
  function syncNav(path) {
    document.querySelectorAll('#main-nav [data-nav]').forEach(function (a) {
      var href = a.getAttribute('data-nav');
      var on = href === '/' ? path === '/' : path === href || path.indexOf(href + '/') === 0;
      a.classList.toggle('cc-nav-active', on);
    });
  }
  function render() {
    var r = parseHash();
    var view = resolve(r.path, r.query);
    app.innerHTML = view.html;
    hydrateIcons(app);
    try { view.bind(r.query); } catch (e) { if (window.console) console.error(e); }
    syncNav(r.path);
    syncCartBadge();
    renderCartDrawer();
    initReveal();
    document.title = (view.title ? view.title + ' | ' : '') + 'کانتیننتال کافی';
    window.scrollTo(0, 0);
  }

  /* ───────────────────────────── reveal / countdown ───────────────────────────── */
  var io = null;
  function initReveal() {
    var els = document.querySelectorAll('.reveal:not(.is-in)');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    els.forEach(function (el) { io.observe(el); });
  }
  function tickCountdown() {
    var els = document.querySelectorAll('[data-countdown]');
    if (!els.length) return;
    var now = new Date();
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    var s = Math.max(0, Math.floor((end - now) / 1000));
    var text = faNum(pad2(Math.floor(s / 3600))) + ':' + faNum(pad2(Math.floor((s % 3600) / 60))) + ':' + faNum(pad2(s % 60));
    els.forEach(function (el) { el.textContent = text; });
  }

  /* ───────────────────────────── global events ───────────────────────────── */
  document.addEventListener('click', function (e) {
    var closer = e.target.closest('[data-close]');
    if (closer) {
      closeLayers();
    }
    var opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      openLayer(opener.getAttribute('data-open'));
    }
    var add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      addToCart({
        slug: add.getAttribute('data-add'),
        weight: Number(add.getAttribute('data-weight') || 250),
        gift: add.getAttribute('data-gift') || 'none',
        grind: add.getAttribute('data-grind') || 'دانه کامل',
        qty: 1
      });
      return;
    }
    var w = e.target.closest('[data-wish]');
    if (w) {
      e.preventDefault();
      e.stopPropagation();
      toggleWish(w.getAttribute('data-wish'));
      return;
    }
    var inc = e.target.closest('[data-cart-inc]');
    if (inc) {
      var key = inc.getAttribute('data-cart-inc');
      var item = cart.filter(function (i) { return i.key === key; })[0];
      if (item) setQty(key, item.qty + 1);
      return;
    }
    var dec = e.target.closest('[data-cart-dec]');
    if (dec) {
      var key2 = dec.getAttribute('data-cart-dec');
      var item2 = cart.filter(function (i) { return i.key === key2; })[0];
      if (item2) setQty(key2, item2.qty - 1);
      return;
    }
    var rem = e.target.closest('[data-cart-remove]');
    if (rem) { removeItem(rem.getAttribute('data-cart-remove')); return; }
    var t = e.target.closest('[data-toast]');
    if (t) { toast(t.getAttribute('data-toast')); return; }
    var sf = e.target.closest('[data-scroll-form]');
    if (sf) {
      e.preventDefault();
      var form = document.querySelector('#sub-form, #wholesale-form');
      if (!form) return;
      var sel = form.id === 'sub-form' ? '#sub-plan' : '#ws-company';
      var head = form.querySelector('h2, h3');
      if (head) head.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var field = form.querySelector(sel);
      if (field) setTimeout(function () { try { field.focus({ preventScroll: true }); } catch (err) {} }, 380);
      return;
    }
  });

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches('[data-newsletter]')) {
      e.preventDefault();
      var input = f.querySelector('input[type="email"]');
      if (input && !input.reportValidity()) return;
      if (input) input.value = '';
      toast('عضویت نمایشی ثبت شد؛ ایمیل واقعی ارسال نمی‌شود', 'mail');
    }
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLayers();
  });
  window.addEventListener('hashchange', render);
  window.addEventListener('storage', function (e) {
    if (e.key === K.cart) { cart = read(K.cart, []); renderCartDrawer(); }
    if (e.key === K.wish) { wish = read(K.wish, []); }
  });

  /* ───────────────────────────── boot ───────────────────────────── */
  var mobileBtn = document.getElementById('open-mobile');
  if (mobileBtn) mobileBtn.addEventListener('click', function () { openLayer('mobile'); });
  var searchBtn = document.getElementById('open-search');
  if (searchBtn) searchBtn.addEventListener('click', function () { openLayer('search'); });
  var cartBtn = document.getElementById('open-cart');
  if (cartBtn) cartBtn.addEventListener('click', function () { openLayer('cart'); });
  var fab = document.getElementById('fab-consultant');
  if (fab) fab.addEventListener('click', function () { location.hash = '#/consultant'; });

  hydrateIcons(document);
  buildMobileNav();
  bindSearch();
  renderCartDrawer();
  tickCountdown();
  setInterval(tickCountdown, 1000);
  render();
})();
