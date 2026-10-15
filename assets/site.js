/* CULTURE BARBERSHOP — shared site script */
(function(){
  document.documentElement.classList.add('js');

  var SHOP = {
    wa: '66931833522',               // WhatsApp number (093 183 3522 in international format)
    phone: '093 183 3522',
    line: 'https://lin.ee/y9wMJFP',
    ig: 'https://www.instagram.com/culturebarbershop___/',
    maps: 'https://www.google.com/maps/search/?api=1&query=CULTURE+BARBERSHOP+Sukhumvit+89',
    open: 10, close: 22               // every day, 10:00–22:00 (Bangkok time)
  };
  window.CULTURE = SHOP;

  /* ---------- bear mascot (original artwork) ---------- */
  var BEAR = '<svg viewBox="0 0 200 200" aria-hidden="true">' +
    '<g stroke="#07080c" stroke-width="6" stroke-linejoin="round">' +
    '<circle cx="50" cy="60" r="27" fill="#6a4328"/><circle cx="150" cy="60" r="27" fill="#6a4328"/>' +
    '<circle cx="50" cy="60" r="12" fill="#3a2416" stroke-width="0"/><circle cx="150" cy="60" r="12" fill="#3a2416" stroke-width="0"/>' +
    '<path d="M30 110 C30 62 62 40 100 40 C138 40 170 62 170 110 C170 150 140 176 100 176 C60 176 30 150 30 110 Z" fill="#7a4e2f"/>' +
    '</g>' +
    '<path d="M34 100 C34 60 64 42 100 42 C136 42 166 60 166 100 L158 96 C150 76 128 70 100 70 C72 70 50 76 42 96 Z" fill="#101118"/>' +
    '<path d="M42 96 L42 116 L36 112 Z M158 96 L158 116 L164 112 Z" fill="#101118" opacity=".55"/>' +
    '<path d="M60 64 L76 56 M86 52 L102 48 M112 50 L128 54" stroke="#3d6bff" stroke-width="3" stroke-linecap="round" opacity=".9"/>' +
    '<path d="M60 98 L86 104 M140 98 L114 104" stroke="#07080c" stroke-width="7" stroke-linecap="round"/>' +
    '<ellipse cx="76" cy="114" rx="7" ry="8" fill="#07080c"/><ellipse cx="124" cy="114" rx="7" ry="8" fill="#07080c"/>' +
    '<circle cx="78.5" cy="111" r="2.4" fill="#fff"/><circle cx="126.5" cy="111" r="2.4" fill="#fff"/>' +
    '<ellipse cx="100" cy="144" rx="36" ry="27" fill="#d8b085" stroke="#07080c" stroke-width="5"/>' +
    '<path d="M86 128 C86 120 114 120 114 128 C114 136 104 141 100 141 C96 141 86 136 86 128 Z" fill="#07080c"/>' +
    '<path d="M88 154 C96 160 108 159 116 150" fill="none" stroke="#07080c" stroke-width="4.5" stroke-linecap="round"/>' +
    '<path d="M60 176 C72 186 128 186 140 176" fill="none" stroke="#c9ccd6" stroke-width="5" stroke-dasharray="6 5" stroke-linecap="round"/>' +
    '</svg>';
  document.querySelectorAll('[data-bear]').forEach(function(el){ el.innerHTML = BEAR; });

  /* ---------- header ---------- */
  var header = document.querySelector('.site-header');
  function onHeader(){ if(header) header.classList.toggle('solid', window.scrollY > 40 || !document.querySelector('.hero')); }
  onHeader(); window.addEventListener('scroll', onHeader, {passive:true});
  var mb = document.querySelector('.menu-btn');
  if (mb) mb.addEventListener('click', function(){
    var o = header.classList.toggle('open'); mb.setAttribute('aria-expanded', o ? 'true' : 'false');
  });

  /* ---------- Bangkok time helpers ---------- */
  function bkkNow(){
    var s = new Date().toLocaleString('en-US', {timeZone:'Asia/Bangkok'});
    var d = new Date(s); return isNaN(d) ? new Date() : d;
  }
  function openState(){
    var n = bkkNow(), h = n.getHours() + n.getMinutes()/60;
    return h >= SHOP.open && h < SHOP.close;
  }
  document.querySelectorAll('[data-open-now]').forEach(function(el){
    var o = openState();
    el.classList.toggle('closed', !o);
    el.innerHTML = '<i></i>' + (o ? 'Open now · until 22:00' : 'Closed · opens 10:00');
  });
  document.querySelectorAll('.hours').forEach(function(h){
    var idx = (bkkNow().getDay() + 6) % 7; // Mon=0
    var c = h.children[idx]; if (c) c.classList.add('today');
  });

  /* ---------- copy buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){
      var t = b.getAttribute('data-copy');
      var done = function(){ b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy'; }, 1600); };
      try { navigator.clipboard.writeText(t).then(done, function(){ selectNear(b); }); } catch(e){ selectNear(b); }
    });
  });
  function selectNear(b){
    var s = b.previousElementSibling; if (!s) return;
    var r = document.createRange(); r.selectNodeContents(s);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }

  /* ---------- reveal ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.remove('pending'); io.unobserve(e.target); } });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.05});
    document.querySelectorAll('.reveal').forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) { el.classList.add('pending'); io.observe(el); }
    });
  }

  /* ---------- scroll-scrubbed hero video ---------- */
  var hero = document.querySelector('.hero');
  if (hero){
    var v = hero.querySelector('video');
    var panels = [].slice.call(hero.querySelectorAll('.panel'));
    var bar = hero.querySelector('.hero-progress span');
    var small = window.matchMedia('(max-width: 760px)').matches;
    var src = small ? v.getAttribute('data-src-sm') : v.getAttribute('data-src');
    if (!v.canPlayType('video/mp4; codecs="avc1.640028"')) src = src.replace('.mp4', '.webm');
    var target = 0, cur = 0, ready = false;
    if (!reduce){
      v.muted = true;
      // Load the whole clip into memory first: a blob URL is always seekable,
      // whatever range headers the host sends, so scroll scrubbing stays smooth.
      var direct = function(){ v.src = src; v.load(); };
      if (window.fetch && window.URL && URL.createObjectURL){
        fetch(src).then(function(r){ if (!r.ok) throw 0; return r.blob(); })
          .then(function(b){ v.src = URL.createObjectURL(b); v.load(); })
          .catch(direct);
      } else direct();
      var prime = function(){ var p = v.play(); if (p && p.then) p.then(function(){ v.pause(); }).catch(function(){}); };
      v.addEventListener('loadedmetadata', function(){ ready = true; prime(); });
      window.addEventListener('touchstart', prime, {once:true, passive:true});
    }
    function measure(){
      var r = hero.getBoundingClientRect();
      var total = hero.offsetHeight - window.innerHeight;
      target = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    }
    function fade(p, a, b){ // in over [a, a+.05], out over [b-.05, b]
      if (p < a || p > b) return 0;
      var i = Math.min(1, (p - a) / 0.05), o = Math.min(1, (b - p) / 0.05);
      return Math.max(0, Math.min(i, o));
    }
    function tick(){
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      if (v.readyState >= 1 && v.duration){
        var t = cur * (v.duration - 0.06);
        if (Math.abs(v.currentTime - t) > 0.02) { try { v.currentTime = t; } catch(e){} }
      }
      panels.forEach(function(pn, i){
        var a = parseFloat(pn.dataset.a), b = parseFloat(pn.dataset.b);
        var op = (i === 0) ? (cur <= a + 0.0001 ? 1 : fade(cur, -1, b)) : fade(cur, a, b);
        if (i === 0 && cur < b - 0.05) op = 1;
        pn.style.opacity = op.toFixed(3);
        pn.style.transform = 'translateY(' + ((1 - op) * 24).toFixed(1) + 'px)';
        pn.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
        pn.setAttribute('aria-hidden', op > 0.5 ? 'false' : 'true');
      });
      if (bar) bar.style.width = (cur * 100).toFixed(2) + '%';
      requestAnimationFrame(tick);
    }
    if (!reduce){
      measure(); window.addEventListener('scroll', measure, {passive:true}); window.addEventListener('resize', measure);
      requestAnimationFrame(tick);
    }
  }

  /* ---------- lookbook filter + lightbox ---------- */
  var mas = document.querySelector('.masonry');
  if (mas){
    var figs = [].slice.call(mas.querySelectorAll('figure'));
    document.querySelectorAll('.filters .opt').forEach(function(b){
      b.addEventListener('click', function(){
        document.querySelectorAll('.filters .opt').forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var f = b.dataset.f;
        figs.forEach(function(fg){ fg.hidden = !(f === 'all' || fg.dataset.cat === f); });
        try { localStorage.setItem('culture-lookbook-filter', f); } catch(e){}
      });
    });
    try { var saved = localStorage.getItem('culture-lookbook-filter'); if (saved){ var sb = document.querySelector('.filters .opt[data-f="' + saved + '"]'); if (sb) sb.click(); } } catch(e){}
    var lb = null, idx = 0;
    function vis(){ return figs.filter(function(f){ return !f.hidden; }); }
    function show(i){
      var list = vis(); idx = (i + list.length) % list.length;
      var img = list[idx].querySelector('img');
      if (!lb){
        lb = document.createElement('div'); lb.className = 'lightbox'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true');
        lb.innerHTML = '<img alt=""><button class="x" aria-label="Close">×</button><button class="nav-l" aria-label="Previous">‹</button><button class="nav-r" aria-label="Next">›</button>';
        document.body.appendChild(lb);
        lb.querySelector('.x').onclick = close;
        lb.querySelector('.nav-l').onclick = function(e){ e.stopPropagation(); show(idx - 1); };
        lb.querySelector('.nav-r').onclick = function(e){ e.stopPropagation(); show(idx + 1); };
        lb.addEventListener('click', function(e){ if (e.target === lb) close(); });
      }
      lb.hidden = false;
      var big = lb.querySelector('img'); big.src = img.src; big.alt = img.alt;
      lb.querySelector('.x').focus();
    }
    function close(){ if (lb) lb.hidden = true; }
    document.addEventListener('keydown', function(e){
      if (!lb || lb.hidden) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1);
    });
    figs.forEach(function(f){
      f.tabIndex = 0;
      f.addEventListener('click', function(){ show(vis().indexOf(f)); });
      f.addEventListener('keydown', function(e){ if (e.key === 'Enter') show(vis().indexOf(f)); });
    });
  }

  /* ---------- booking widget ---------- */
  var SERVICES = [
    {id:'full', name:'Full Service Haircut', price:900, note:'Cut, beard, hot towel, line-up and wash'},
    {id:'cut', name:'Haircut & Line-up', price:600},
    {id:'beard', name:'Beard Trim & Line-up', price:400},
    {id:'shave', name:'Beard & Mustache Shave', price:300},
    {id:'wash', name:'Hair Wash & Style', price:200},
    {id:'enh', name:'Hair Enhancements', price:200},
    {id:'design', name:'Hair Design', price:200, from:true, upto:1000},
    {id:'towel', name:'Hot Towel', price:100},
    {id:'color', name:'Hair Coloring / Bleaching', price:2000, from:true},
    {id:'perm', name:'Hair Perm', price:2000, from:true}
  ];
  var BARBERS = ['Any barber', 'Barber One', 'Barber Two', 'Barber Three'];
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  function baht(n){ return '฿' + n.toLocaleString('en-US'); }
  function pad(n){ return (n < 10 ? '0' : '') + n; }

  document.querySelectorAll('[data-booking]').forEach(function(root, k){
    var compact = root.getAttribute('data-booking') === 'compact';
    var today = bkkNow(); today.setHours(0,0,0,0);
    var maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 60);
    var st = { svc: compact ? ['cut'] : ['cut'], barber: 'Any barber', date: null, time: null, view: new Date(today.getFullYear(), today.getMonth(), 1) };
    var id = function(s){ return 'bk' + k + '-' + s; };
    var preset = (location.hash || '').replace('#','');
    if (preset && SERVICES.some(function(s){ return s.id === preset; })) st.svc = [preset];

    root.className = 'booker';
    root.innerHTML =
      '<div class="step"><div class="step-h"><h3>Service</h3><span>' + (compact ? 'Pick one or more' : 'Step 1 · Pick one or more') + '</span></div><div class="opts" data-svc></div></div>' +
      (compact ? '' : '<div class="step"><div class="step-h"><h3>Barber</h3><span>Step 2</span></div><div class="opts" data-barber></div></div>') +
      '<div class="step"><div class="step-h"><h3>Date</h3><span>' + (compact ? '' : 'Step 3 · ') + 'Open every day</span></div><div class="cal"><div class="cal-head"><button type="button" data-prev aria-label="Previous month">‹</button><b data-month></b><button type="button" data-next aria-label="Next month">›</button></div><div class="cal-grid" data-grid></div></div></div>' +
      '<div class="step"><div class="step-h"><h3>Time</h3><span data-timehint>Choose a date first</span></div><div class="slots" data-slots></div></div>' +
      '<div class="fields"><div class="field"><label for="' + id('name') + '">Your name</label><input id="' + id('name') + '" autocomplete="name" placeholder="e.g. Somchai"></div>' +
      '<div class="field"><label for="' + id('tel') + '">Phone (optional)</label><input id="' + id('tel') + '" autocomplete="tel" inputmode="tel" placeholder="08x xxx xxxx"></div></div>' +
      (compact ? '' : '<div class="field"><label for="' + id('note') + '">Anything we should know? (optional)</label><textarea id="' + id('note') + '" rows="3" placeholder="Reference photo, hair type, the fade you want…"></textarea></div>') +
      '<div class="summary"><div class="summary-line"><span data-sumtext>Haircut & Line-up</span><b data-total>฿600</b></div>' +
      '<div class="err" data-err role="status" aria-live="polite"></div>' +
      '<div class="actions"><a class="btn btn--wa" data-wa href="#" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.1L2 22l5-1.3A11 11 0 0 0 20.5 3.5ZM12 20.1a9 9 0 0 1-4.6-1.3l-.3-.2-3 .8.8-2.9-.2-.3A9.1 9.1 0 1 1 12 20.1Zm5-6.8c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.9 1.1-.3.2-.6.1a7.4 7.4 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.6a.5.5 0 0 0 0-.5l-.9-2.1c-.2-.6-.5-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"/></svg>Book on WhatsApp</a>' +
      '<a class="btn btn--ghost" href="' + SHOP.line + '" target="_blank" rel="noopener">Book on LINE</a></div>' +
      '<p class="note">WhatsApp opens with your booking already written. Tap send and we confirm your chair. Walk-ins are welcome when a chair is free.</p></div>';

    var $ = function(s){ return root.querySelector(s); };

    // services
    var svcBox = $('[data-svc]');
    (compact ? SERVICES.slice(0, 6) : SERVICES).forEach(function(s){
      var b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.dataset.id = s.id;
      b.innerHTML = s.name + ' <span>' + (s.from ? 'from ' : '') + baht(s.price) + '</span>';
      b.onclick = function(){
        var i = st.svc.indexOf(s.id);
        if (i > -1) { if (st.svc.length > 1) st.svc.splice(i, 1); }
        else {
          if (s.id === 'full') st.svc = ['full'];
          else { st.svc = st.svc.filter(function(x){ return x !== 'full'; }); st.svc.push(s.id); }
        }
        render();
      };
      svcBox.appendChild(b);
    });
    // barbers
    var bb = $('[data-barber]');
    if (bb) BARBERS.forEach(function(n){
      var b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.textContent = n;
      b.onclick = function(){ st.barber = n; render(); }; bb.appendChild(b);
    });
    $('[data-prev]').onclick = function(){ st.view.setMonth(st.view.getMonth() - 1); render(); };
    $('[data-next]').onclick = function(){ st.view.setMonth(st.view.getMonth() + 1); render(); };
    root.addEventListener('input', update);

    function render(){
      svcBox.querySelectorAll('.opt').forEach(function(b){ b.setAttribute('aria-pressed', st.svc.indexOf(b.dataset.id) > -1 ? 'true' : 'false'); });
      if (bb) bb.querySelectorAll('.opt').forEach(function(b){ b.setAttribute('aria-pressed', b.textContent === st.barber ? 'true' : 'false'); });
      // calendar
      var y = st.view.getFullYear(), m = st.view.getMonth();
      $('[data-month]').textContent = MONTHS[m] + ' ' + y;
      $('[data-prev]').disabled = (y === today.getFullYear() && m === today.getMonth());
      $('[data-next]').disabled = (new Date(y, m + 1, 1) > maxDate);
      var g = $('[data-grid]'); g.innerHTML = '';
      DOW.forEach(function(d){ var e = document.createElement('div'); e.className = 'dow'; e.textContent = d; g.appendChild(e); });
      var first = (new Date(y, m, 1).getDay() + 6) % 7;
      for (var i = 0; i < first; i++) g.appendChild(document.createElement('span'));
      var days = new Date(y, m + 1, 0).getDate();
      for (var d = 1; d <= days; d++){
        var dt = new Date(y, m, d);
        var b = document.createElement('button'); b.type = 'button'; b.textContent = d;
        b.setAttribute('aria-label', dt.toDateString());
        if (dt < today || dt > maxDate) b.disabled = true;
        if (dt.getTime() === today.getTime()) b.classList.add('is-today');
        b.setAttribute('aria-pressed', st.date && dt.getTime() === st.date.getTime() ? 'true' : 'false');
        (function(dt){ b.onclick = function(){ st.date = dt; st.time = null; render(); }; })(dt);
        g.appendChild(b);
      }
      // slots
      var sl = $('[data-slots]'); sl.innerHTML = '';
      if (st.date){
        $('[data-timehint]').textContent = DOW[(st.date.getDay() + 6) % 7] + ' ' + st.date.getDate() + ' ' + MONTHS[st.date.getMonth()].slice(0,3);
        var now = bkkNow(), isToday = st.date.getTime() === today.getTime();
        var nowMin = now.getHours() * 60 + now.getMinutes();
        for (var t = SHOP.open * 60; t <= (SHOP.close - 1) * 60; t += 30){
          var s = document.createElement('button'); s.type = 'button';
          var lbl = pad(Math.floor(t / 60)) + ':' + pad(t % 60); s.textContent = lbl;
          if (isToday && t < nowMin + 30) s.disabled = true;
          s.setAttribute('aria-pressed', st.time === lbl ? 'true' : 'false');
          (function(lbl){ s.onclick = function(){ st.time = lbl; render(); }; })(lbl);
          sl.appendChild(s);
        }
      } else { $('[data-timehint]').textContent = 'Choose a date first'; }
      update();
    }

    function chosen(){ return SERVICES.filter(function(s){ return st.svc.indexOf(s.id) > -1; }); }
    function update(){
      var list = chosen();
      var total = list.reduce(function(a, s){ return a + s.price; }, 0);
      var anyFrom = list.some(function(s){ return s.from; });
      $('[data-sumtext]').textContent = list.map(function(s){ return s.name; }).join(' + ');
      $('[data-total]').textContent = (anyFrom ? 'from ' : '') + baht(total);
      var name = (root.querySelector('#' + id('name')).value || '').trim();
      var tel = (root.querySelector('#' + id('tel')).value || '').trim();
      var noteEl = root.querySelector('#' + id('note')); var note = noteEl ? noteEl.value.trim() : '';
      var missing = [];
      if (!st.date) missing.push('a date'); if (!st.time) missing.push('a time'); if (!name) missing.push('your name');
      var wa = $('[data-wa]');
      var dateTxt = st.date ? (DOW[(st.date.getDay() + 6) % 7] + ' ' + st.date.getDate() + ' ' + MONTHS[st.date.getMonth()] + ' ' + st.date.getFullYear()) : '';
      var msg = 'Hi CULTURE BARBERSHOP, I would like to book a chair.\n\n' +
        'Service: ' + list.map(function(s){ return s.name; }).join(', ') + '\n' +
        'Barber: ' + st.barber + '\n' +
        'Date: ' + dateTxt + '\n' +
        'Time: ' + (st.time || '') + '\n' +
        'Name: ' + name + (tel ? '\nPhone: ' + tel : '') + (note ? '\nNote: ' + note : '') +
        '\n\nEstimated price: ' + (anyFrom ? 'from ' : '') + baht(total);
      wa.href = 'https://wa.me/' + SHOP.wa + '?text=' + encodeURIComponent(msg);
      wa.dataset.ok = missing.length ? '' : '1';
      wa.dataset.missing = missing.join(', ');
      if (!missing.length) $('[data-err]').textContent = '';
    }
    $('[data-wa]').addEventListener('click', function(e){
      if (!this.dataset.ok){ e.preventDefault(); $('[data-err]').textContent = 'Add ' + this.dataset.missing + ' to send your booking.'; }
    });
    render();
  });

  var y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
