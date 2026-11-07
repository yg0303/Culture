/* CULTURE BARBERSHOP — shared site script */
(function(){
  document.documentElement.classList.add('js');

  var SHOP = {
    wa: '66931833522',               // WhatsApp number (093 183 3522 in international format)
    phone: '093 183 3522',
    line: 'https://lin.ee/y9wMJFP',
    ig: 'https://www.instagram.com/culturebarbershop___/',
    tiktok: '',                      // paste the TikTok profile link here and the TikTok icons appear
    maps: 'https://www.google.com/maps/place/CULTURE+BARBERSHOP+Sukhumvit+89/@13.7007611,100.6036198,17z/data=!3m1!4b1!4m6!3m5!1s0x30e29fedb9d79cb7:0xbc62ccfe419cfe51!8m2!3d13.7007611!4d100.6036198!16s%2Fg%2F11zfk663jd',
    book: 'https://www.fresha.com/a/culture-barbershop-sukhumvit-89-bangkok-2249-sukhumvit-89-alley-f60gp0az/booking?pId=3025168',
    open: 10, close: 22               // every day, 10:00–22:00 (Bangkok time)
  };
  window.CULTURE = SHOP;

  /* ---------- header ---------- */
  var header = document.querySelector('.site-header');
  function onHeader(){ if(header) header.classList.toggle('solid', window.scrollY > 40 || !document.querySelector('.hero')); }
  onHeader(); window.addEventListener('scroll', onHeader, {passive:true});
  var mb = document.querySelector('.menu-btn');
  if (mb) mb.addEventListener('click', function(){
    var o = header.classList.toggle('open'); mb.setAttribute('aria-expanded', o ? 'true' : 'false');
  });

  document.querySelectorAll('[data-tiktok]').forEach(function(a){ if (SHOP.tiktok){ a.href = SHOP.tiktok; a.hidden = false; } });

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
    if (!v.canPlayType('video/mp4; codecs="avc1.640028"')) src = src.replace('.mp4?', '.webm?');
    if (small){ var ps = 'media/hero-poster-sm.jpg?v=3'; v.poster = ps; var pi = hero.querySelector('.poster'); if (pi) pi.src = ps; }
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

  /* ---------- live Google reviews (from /api/reviews, refreshed daily by worker.js) ---------- */
  var strip = document.querySelector('[data-live-reviews]');
  if (strip && window.fetch){
    fetch('/api/reviews').then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
      if (!d || !d.ok) return;                       // not set up yet → the built-in reviews stay
      var esc = function(t){ return String(t || '').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
      var starStr = function(n){ n = Math.round(n || 0); return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); };

      if (d.rating){
        var sc = document.querySelector('[data-live-score]'); if (sc) sc.textContent = Number(d.rating).toFixed(1);
        var st = document.querySelector('[data-live-stars]'); if (st){ st.textContent = starStr(d.rating); st.setAttribute('aria-label', Number(d.rating).toFixed(1) + ' out of 5 stars'); }
      }
      if (d.total){ var ct = document.querySelector('[data-live-count]'); if (ct) ct.textContent = d.total + ' GOOGLE REVIEWS'; }
      if (d.mapsUrl){ var mp = document.querySelector('[data-live-maps]'); if (mp) mp.href = d.mapsUrl; }

      // skip reviews already shown in the photo cards above
      var shown = {};
      document.querySelectorAll('.reviews .who > span').forEach(function(el){ shown[(el.firstChild.textContent || '').trim().split(' ')[0].toLowerCase()] = 1; });
      var list = (d.reviews || []).filter(function(r){ return r.text && !shown[(r.name || '').split(' ')[0].toLowerCase()]; });
      if (!list.length) return;

      strip.innerHTML = list.map(function(r){
        var name = r.profile ? '<a href="' + esc(r.profile) + '" target="_blank" rel="noopener">' + esc(r.name) + '</a>' : esc(r.name);
        var pic = r.photo ? '<img class="avatar" src="' + esc(r.photo) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '';
        return '<article class="review"><div class="body">' +
          '<span class="stars" aria-label="' + r.stars + ' out of 5 stars">' + starStr(r.stars) + '</span>' +
          '<blockquote class="clamp">“' + esc(r.text) + '”</blockquote>' +
          '<div class="who"><span class="who-name">' + pic + '<span>' + name + '<small>' + esc(r.when) + '</small></span></span>' +
          '<a class="g-badge" href="' + esc(r.link || d.mapsUrl) + '" target="_blank" rel="noopener">GOOGLE</a></div>' +
          '</div></article>';
      }).join('');
      strip.classList.add('is-live');
      var note = document.querySelector('[data-live-note]'); if (note) note.textContent = 'Live from Google · updated daily';
    }).catch(function(){});
  }

  var y = document.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
