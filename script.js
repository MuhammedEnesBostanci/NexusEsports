'use strict';

/* ================================================
   NEXUS ESPORTS — script.js
   ================================================ */

// ── YARDIMCI FONKSİYONLAR ─────────────────────
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// ── 1. NAVBAR ─────────────────────────────────
function initNavbar() {
  const navbar  = $('#navbar');
  const toggle  = $('#navToggle');
  const links   = $('#navLinks');
  if (!navbar) return;

  // Scroll'da navbar'ı koyulaştır
  on(window, 'scroll', () => {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger aç/kapat
  on(toggle, 'click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Dışarı tıklayınca kapat
  on(document, 'click', e => {
    if (!navbar.contains(e.target) && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Nav linkine tıklayınca mobil menüyü kapat
  $$('.nav-link').forEach(l => on(l, 'click', () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));
}

// ── 2. SMOOTH SCROLL (sabit navbar ofseti) ────
function initSmoothScroll() {
  const navH = 56; // navbar yüksekliği px
  $$('a[href^="#"]').forEach(link => {
    on(link, 'click', e => {
      const id = link.getAttribute('href').replace(/^.*#/, '');
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 10;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ── 3. SCROLL REVEAL ──────────────────────────
function initScrollReveal() {
  const items = $$('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
}

// ── 4. SAYAÇ ANİMASYONU ───────────────────────
function countUp(el, to, ms = 1800) {
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K' : String(Math.floor(n));
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const start  = performance.now();

  const tick = now => {
    const t = Math.min((now - start) / ms, 1);
    const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
    el.textContent = prefix + fmt(to * ease) + suffix;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + (to >= 1000 ? fmt(to) : to) + suffix;
  };
  requestAnimationFrame(tick);
}

function initCounters() {
  const els = $$('[data-counter]');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countUp(e.target, +e.target.dataset.counter);
      io.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  els.forEach(el => io.observe(el));
}

// ── 5. GERİ SAYIM ZAMANLAYICI ─────────────────
function initCountdown() {
  const el = $('#countdown');
  if (!el) return;

  const deadline = new Date('2026-05-30T18:00:00+03:00').getTime();

  const pad = n => String(n).padStart(2, '0');

  const tick = () => {
    const diff = deadline - Date.now();
    if (diff <= 0) {
      el.innerHTML = '<span class="cd-live">● CANLI YAYINDA</span>';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    const boxes = el.querySelectorAll('[data-unit]');
    if (boxes.length) {
      el.querySelector('[data-unit=days]').textContent  = pad(d);
      el.querySelector('[data-unit=hours]').textContent = pad(h);
      el.querySelector('[data-unit=mins]').textContent  = pad(m);
      el.querySelector('[data-unit=secs]').textContent  = pad(s);
    }
  };
  tick();
  setInterval(tick, 1000);
}

// ── 6. GALERİ LİGHTBOX ────────────────────────
function initLightbox() {
  const items    = $$('.gallery-item');
  const overlay  = $('#lightboxOverlay');
  if (!overlay || !items.length) return;

  const fill    = overlay.querySelector('.lb-fill');
  const caption = overlay.querySelector('.lb-caption');
  const closeB  = overlay.querySelector('.lb-close');
  const prevB   = overlay.querySelector('.lb-prev');
  const nextB   = overlay.querySelector('.lb-next');
  let cur = 0;

  const data = items.map(it => ({
    cls: [...it.querySelector('.gallery-thumb').classList].find(c => c.startsWith('gal-')) || '',
    src: it.dataset.src || '',
    label: it.querySelector('.gallery-overlay-text')?.innerText.trim() || ''
  }));

  function show(idx) {
    cur = (idx + items.length) % items.length;
    const d = data[cur];
    fill.className = 'lb-fill gallery-thumb ' + d.cls;
    fill.textContent = items[cur].querySelector('.gallery-thumb').textContent;
    if (d.src) {
      const img = document.createElement('img');
      img.src = d.src; img.alt = d.label;
      img.onload = () => { fill.textContent = ''; fill.appendChild(img); };
    }
    caption.textContent = d.label;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeB.focus();
  }

  function hide() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach((it, i) => {
    it.setAttribute('tabindex', '0');
    it.setAttribute('role', 'button');
    it.addEventListener('click',   () => show(i));
    it.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); }
    });
  });

  on(closeB, 'click', hide);
  on(prevB,  'click', () => show(cur - 1));
  on(nextB,  'click', () => show(cur + 1));
  on(overlay, 'click', e => { if (e.target === overlay) hide(); });
  on(document, 'keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')     hide();
    if (e.key === 'ArrowLeft')  show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
}

// ── 7. MAÇ SEKMELERİ ──────────────────────────
function initMatchTabs() {
  const tabs   = $$('[data-tab]');
  const panels = $$('[data-panel]');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    on(tab, 'click', () => {
      const key = tab.dataset.tab;
      tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === key);
        t.setAttribute('aria-selected', t.dataset.tab === key);
      });
      panels.forEach(p => {
        const active = p.dataset.panel === key;
        p.hidden = !active;
        if (active) {
          p.style.animation = 'none';
          requestAnimationFrame(() => { p.style.animation = ''; });
        }
      });
    });
  });
}

// ── 8. FORM DOĞRULAMA ─────────────────────────
function initForm() {
  const form = $('#contactForm');
  if (!form) return;

  const rules = {
    firstName: { required: true, min: 2,  label: 'Ad' },
    lastName:  { required: true, min: 2,  label: 'Soyad' },
    email:     { required: true, email: true, label: 'E-Posta' },
    subject:   { required: true, label: 'Konu' },
    message:   { required: true, min: 20, label: 'Mesaj' },
    kvkk:      { required: true, checkbox: true, label: 'KVKK onayı' },
  };

  function check(name) {
    const f = form.elements[name];
    if (!f) return '';
    const r = rules[name];
    const v = r.checkbox ? f.checked : f.value.trim();
    if (r.required && !v)            return `${r.label} zorunludur.`;
    if (r.min && v.length < r.min)   return `${r.label} en az ${r.min} karakter olmalı.`;
    if (r.email && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
                                     return 'Geçerli bir e-posta adresi giriniz.';
    return '';
  }

  function setState(name, msg) {
    const f = form.elements[name];
    const g = f?.closest('.form-group');
    if (!g) return;
    g.querySelector('.field-error')?.remove();
    f.classList.toggle('invalid', !!msg);
    f.classList.toggle('valid',   !msg && f.value !== '');
    if (msg) {
      const span = document.createElement('span');
      span.className = 'field-error';
      span.setAttribute('role', 'alert');
      span.textContent = msg;
      g.appendChild(span);
    }
  }

  // Blur'da validate et
  Object.keys(rules).forEach(name => {
    const f = form.elements[name];
    if (!f) return;
    on(f, 'blur',  () => setState(name, check(name)));
    on(f, 'input', () => { if (f.classList.contains('invalid')) setState(name, check(name)); });
    on(f, 'change', () => setState(name, check(name)));
  });

  on(form, 'submit', e => {
    e.preventDefault();
    let ok = true;
    Object.keys(rules).forEach(n => {
      const msg = check(n);
      setState(n, msg);
      if (msg) ok = false;
    });
    if (!ok) { form.querySelector('.invalid')?.focus(); showToast('Lütfen tüm zorunlu alanları doldurun.', 'error'); return; }

    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Gönderiliyor…';

    setTimeout(() => {
      const fd = new FormData(form);
      const msg = {
        id: Date.now(),
        tarih: new Date().toLocaleString('tr-TR'),
        ad: fd.get('firstName') + ' ' + fd.get('lastName'),
        email: fd.get('email'),
        telefon: fd.get('phone') || '—',
        konu: fd.get('subject'),
        oyun: fd.get('game') || '—',
        mesaj: fd.get('message'),
        okundu: false,
      };
      const mesajlar = JSON.parse(localStorage.getItem('nx_mesajlar') || '[]');
      mesajlar.unshift(msg);
      localStorage.setItem('nx_mesajlar', JSON.stringify(mesajlar));

      showToast('Mesajınız gönderildi! En kısa sürede geri döneceğiz.', 'success');
      form.reset();
      $$('.valid, .invalid, .field-error', form).forEach(el => {
        el.classList?.remove('valid', 'invalid');
        if (el.classList?.contains('field-error')) el.remove();
      });
      btn.disabled = false;
      btn.innerHTML = 'Mesajı Gönder ✉️';
    }, 1500);
  });
}

// ── 9. TOAST BİLDİRİMLERİ ─────────────────────
function showToast(msg, type = 'info') {
  let box = $('#toastBox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toastBox';
    box.setAttribute('aria-live', 'polite');
    document.body.appendChild(box);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || ''}</span>
    <span class="toast-text">${msg}</span>
    <button class="toast-x" aria-label="Kapat">×</button>`;
  box.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  const remove = () => {
    toast.classList.remove('show');
    on(toast, 'transitionend', () => toast.remove(), { once: true });
  };
  on(toast.querySelector('.toast-x'), 'click', remove);
  setTimeout(remove, 5000);
}

// ── 10. CANLI SKOR SİMÜLASYONU ────────────────
function initLiveScores() {
  $$('.match-row.is-live').forEach(row => {
    const a = row.querySelector('.score-a');
    const b = row.querySelector('.score-b');
    if (!a || !b) return;
    const update = () => {
      if (+a.textContent >= 16 || +b.textContent >= 16) return;
      const el = Math.random() > 0.5 ? a : b;
      el.textContent = +el.textContent + 1;
      el.classList.add('score-flash');
      setTimeout(() => el.classList.remove('score-flash'), 700);
    };
    setInterval(update, 9000 + Math.random() * 6000);
  });
}

// ── 11. AKTİF NAV SCROLL ─────────────────────
function initActiveNav() {
  const ids   = ['haberler','maclar','sonuclar','galeri'].map(id => document.getElementById(id)).filter(Boolean);
  const links = $$('.nav-link');
  if (!ids.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}` || l.getAttribute('href')?.endsWith(`#${id}`)));
    });
  }, { threshold: 0.4 });
  ids.forEach(el => io.observe(el));
}

// ── 12. YUKARI GİT BUTONU ─────────────────────
function initScrollToTop() {
  const btn = document.getElementById('scrollToTop');
  if (!btn) return;
  on(window, 'scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── 13. ARAMA OVERLAY ─────────────────────────
function initSearch() {
  const overlay  = document.getElementById('searchOverlay');
  const input    = document.getElementById('searchInput');
  const results  = document.getElementById('searchResults');
  const openBtns = $$('[data-search-open]');
  const closeBtn = document.getElementById('searchClose');
  if (!overlay) return;

  function open() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input && input.focus(), 100);
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (input)   input.value = '';
    if (results) results.innerHTML = '';
  }

  function doSearch(q) {
    if (!results) return;
    const query = q.trim().toLowerCase();
    if (!query) { results.innerHTML = ''; return; }

    const cards = $$('.news-card');
    const hits  = cards.filter(c => c.textContent.toLowerCase().includes(query));

    if (!hits.length) {
      results.innerHTML = '<p class="search-no-results">Sonuç bulunamadı.</p>';
      return;
    }

    results.innerHTML = hits.slice(0, 7).map(card => {
      const titleEl = card.querySelector('.news-title');
      const tagEl   = card.querySelector('.tag:not(.tag-orange)') || card.querySelector('.tag');
      const href    = titleEl ? titleEl.getAttribute('href') || '#' : '#';
      const title   = titleEl ? titleEl.textContent.trim() : '';
      const tag     = tagEl   ? tagEl.textContent.trim()   : '';
      return `<a href="${href}" class="search-result-item">
        <span class="sr-tag">${tag}</span>
        <span class="sr-title">${title}</span>
      </a>`;
    }).join('');

    $$('.search-result-item').forEach(item => on(item, 'click', close));
  }

  openBtns.forEach(btn => on(btn, 'click', open));
  on(closeBtn, 'click', close);
  on(overlay,  'click', e => { if (e.target === overlay) close(); });
  on(input,    'input', e => doSearch(e.target.value));
  on(document, 'keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); }
  });
}

// ── 14. CANLI KART SKORLARI ───────────────────
function initLiveCards() {
  function flash(el) {
    if (!el) return;
    el.classList.add('score-flash');
    setTimeout(() => el.classList.remove('score-flash'), 700);
  }

  // CS2 – raund skoru (16'ya kadar)
  setInterval(() => {
    const a = document.getElementById('live-cs2-a');
    const b = document.getElementById('live-cs2-b');
    if (!a || !b || +a.textContent >= 16 || +b.textContent >= 16) return;
    const el = Math.random() > 0.45 ? a : b;
    el.textContent = +el.textContent + 1;
    flash(el);
  }, 9000 + Math.random() * 8000);

  // VALORANT – raund skoru (13'e kadar)
  setInterval(() => {
    const a = document.getElementById('live-val-a');
    const b = document.getElementById('live-val-b');
    if (!a || !b || +a.textContent >= 13 || +b.textContent >= 13) return;
    const el = Math.random() > 0.5 ? a : b;
    el.textContent = +el.textContent + 1;
    flash(el);
    const rnd = document.getElementById('live-val-round');
    if (rnd) rnd.textContent = `Raund ${+a.textContent + +b.textContent + 1} · Bind`;
  }, 11000 + Math.random() * 9000);

  // LoL – kill sayısı + süre
  setInterval(() => {
    const a = document.getElementById('live-lol-a');
    const b = document.getElementById('live-lol-b');
    const t = document.getElementById('live-lol-time');
    if (!a) return;
    const el = Math.random() < 0.55 ? a : b;
    el.textContent = +el.textContent + 1;
    flash(el);
    if (t) {
      const [mm, ss] = t.textContent.split(':').map(Number);
      let ns = ss + 12; let nm = mm;
      if (ns >= 60) { nm++; ns -= 60; }
      t.textContent = nm + ':' + String(ns).padStart(2, '0');
    }
  }, 8000 + Math.random() * 7000);

  // Dota 2 – kill sayısı + süre
  setInterval(() => {
    const a = document.getElementById('live-dota-a');
    const b = document.getElementById('live-dota-b');
    const t = document.getElementById('live-dota-time');
    if (!a) return;
    const el = Math.random() < 0.52 ? a : b;
    el.textContent = +el.textContent + 1;
    flash(el);
    if (t) {
      const [mm, ss] = t.textContent.split(':').map(Number);
      let ns = ss + 15; let nm = mm;
      if (ns >= 60) { nm++; ns -= 60; }
      t.textContent = nm + ':' + String(ns).padStart(2, '0');
    }
  }, 10000 + Math.random() * 8000);

  // PUBG – Desert Vipers kill sayısı
  setInterval(() => {
    const el = document.getElementById('live-pubg-kills');
    if (!el) return;
    el.textContent = +el.textContent + 1;
    flash(el);
  }, 7000 + Math.random() * 9000);
}

// ── 14b. DETAYLI CANLI PANEL ──────────────────
function initLiveDetail() {
  // Kart tıklama → panel değiştir
  const cards = document.querySelectorAll('.live-card[data-detail]');
  cards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('lc-selected'));
      card.classList.add('lc-selected');
      document.querySelectorAll('.ldp-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('ldp-' + card.dataset.detail);
      if (panel) { panel.classList.add('active'); panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });
  });
  // İlk kartı ve paneli otomatik aç
  if (cards.length) {
    cards[0].classList.add('lc-selected');
    const firstPanel = document.getElementById('ldp-' + cards[0].dataset.detail);
    if (firstPanel) firstPanel.classList.add('active');
  }

  // Kapat butonları
  document.querySelectorAll('.ldp-close-btn[data-close]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const panel = document.getElementById('ldp-' + btn.dataset.close);
      if (panel) panel.classList.remove('active');
      cards.forEach(c => c.classList.remove('lc-selected'));
    });
  });

  const pad = n => String(n).padStart(2, '0');
  const g = id => document.getElementById(id);

  function scoreFlash(el) {
    if (!el) return;
    el.classList.add('score-flash');
    setTimeout(() => el.classList.remove('score-flash'), 700);
  }

  function addFeed(feedId, type, data) {
    const feed = g(feedId);
    if (!feed) return;
    const item = document.createElement('div');
    item.className = 'ldp-feed-item ' + type;
    if (type === 'kill') {
      item.innerHTML = `<span class="ldp-killer">${data.killer}</span> <span class="ldp-weapon">[${data.weapon}]</span> <span class="ldp-victim">${data.victim}</span>${data.hs ? ' <span class="ldp-hs">HS</span>' : ''}`;
    } else {
      item.textContent = data.text;
    }
    feed.prepend(item);
    while (feed.children.length > 14) feed.removeChild(feed.lastChild);
  }

  /* ═══════════════ CS2 ═══════════════ */
  const WEAPONS_CS2 = ['AK-47','M4A4','AWP','Desert Eagle','MP9','SG 553','M4A1-S','USP-S','FAMAS','Galil AR'];
  const cs2 = {
    ct: { name:'Team Aurora', score:14, eco:18400, players:[
      {name:'s0ma',     eq:'AK-47',   k:18,d:12,a:5, adr:94, hp:100,alive:true},
      {name:'lynx',     eq:'M4A1-S',  k:14,d:14,a:8, adr:71, hp:82, alive:true},
      {name:'reactor',  eq:'AWP',     k:11,d:10,a:9, adr:68, hp:100,alive:true},
      {name:'kryptix',  eq:'AK-47',   k:9, d:11,a:12,adr:55, hp:65, alive:true},
      {name:'veil',     eq:'USP-S',   k:7, d:13,a:6, adr:48, hp:43, alive:true},
    ]},
    t:  { name:'Dark Matter', score:11, eco:11800, players:[
      {name:'zer0',     eq:'AK-47',   k:20,d:9, a:3, adr:105,hp:100,alive:true},
      {name:'craze',    eq:'M4A4',    k:16,d:11,a:7, adr:88, hp:75, alive:true},
      {name:'static',   eq:'SG 553',  k:13,d:12,a:9, adr:72, hp:100,alive:true},
      {name:'phantom_k',eq:'FAMAS',   k:10,d:13,a:11,adr:62, hp:58, alive:true},
      {name:'inferno',  eq:'USP-S',   k:8, d:15,a:5, adr:44, hp:30, alive:true},
    ]},
    round:26, timer:115, bombPlanted:false, bombTimer:40,
    history:['ct','ct','t','ct','t','ct','ct','t','ct','t','ct','t','ct','ct','t','t','ct','t','ct','t','ct','ct','t','ct','t'],
    over:false
  };

  function cs2RenderPlayers() {
    ['ct','t'].forEach(side => {
      const el = g('ldp-cs2-' + side); if (!el) return;
      el.innerHTML = cs2[side].players.map(p => {
        const hc = p.hp>60?'high':p.hp>30?'mid':'low';
        return `<div class="ldp-player-row${p.alive?'':' dead'}">
          <div class="ldp-pname">${p.name}<small>${p.eq}</small>
            <div class="ldp-hp-bar"><div class="ldp-hp-fill ${hc}" style="width:${p.hp}%"></div></div>
          </div>
          <div class="ldp-pstat kills">${p.k}</div><div class="ldp-pstat">${p.d}</div>
          <div class="ldp-pstat">${p.a}</div><div class="ldp-pstat">${p.adr}</div>
        </div>`;
      }).join('');
    });
  }

  function cs2RenderDots() {
    ['ct','t'].forEach(side => {
      const el = g('ldp-cs2-alive-' + side); if (!el) return;
      el.innerHTML = cs2[side].players.map(p =>
        `<span class="ldp-dot ${p.alive?'alive-'+side:'dead'}" title="${p.name}"></span>`
      ).join('');
    });
  }

  function cs2RenderHist() {
    const el = g('ldp-cs2-hist'); if (!el) return;
    el.innerHTML = '';
    for (let i=0;i<30;i++) {
      if (i===15) {
        ['ldp-rnd-sep','ldp-rnd-label','ldp-rnd-sep'].forEach((cls,j)=>{
          const e=document.createElement(j===1?'span':'div');
          e.className=cls; if(j===1)e.textContent='YH'; el.appendChild(e);
        });
      }
      const pill=document.createElement('div');
      const w=cs2.history[i];
      pill.className='ldp-rnd-pill '+(w||'cur');
      pill.title=`R${i+1}: ${w?w==='ct'?cs2.ct.name:cs2.t.name:'devam'}`;
      pill.textContent=i+1; el.appendChild(pill);
    }
  }

  function cs2Render() {
    const ga=g('ldp-cs2-a'),gb=g('ldp-cs2-b');
    if(ga){ga.textContent=cs2.ct.score; scoreFlash(ga);}
    if(gb){gb.textContent=cs2.t.score;  scoreFlash(gb);}
    const rnd=g('ldp-cs2-round'); if(rnd) rnd.textContent='Raund '+cs2.round;
    const ect=g('ldp-cs2-eco-ct'); if(ect) ect.textContent='$'+cs2.ct.eco.toLocaleString('tr-TR');
    const et =g('ldp-cs2-eco-t');  if(et)  et.textContent ='$'+cs2.t.eco.toLocaleString('tr-TR');
    const tmr=g('ldp-cs2-timer');
    if(tmr){
      tmr.textContent=cs2.bombPlanted?'💣 '+pad(cs2.bombTimer):pad(Math.floor(cs2.timer/60))+':'+pad(cs2.timer%60);
      tmr.className='ldp-timer'+(cs2.bombPlanted?' bomb':cs2.timer<=15?' low':'');
    }
    const bomb=g('ldp-cs2-bomb'),fill=g('ldp-cs2-bomb-fill');
    if(bomb) bomb.style.display=cs2.bombPlanted?'block':'none';
    if(fill) fill.style.width=(cs2.bombTimer/40*100)+'%';
    const ca=g('live-cs2-a'),cb=g('live-cs2-b');
    if(ca) ca.textContent=cs2.ct.score; if(cb) cb.textContent=cs2.t.score;
    const cr2=g('live-cs2-round'); if(cr2) cr2.textContent=cs2.round;
    const ct2=g('live-cs2-timer');
    if(ct2) ct2.textContent=cs2.bombPlanted?'💣'+pad(cs2.bombTimer):pad(Math.floor(cs2.timer/60))+':'+pad(cs2.timer%60);
    cs2RenderPlayers(); cs2RenderDots(); cs2RenderHist();
  }

  function cs2EndRound(winner) {
    if(cs2.over) return;
    const w=winner==='ct'?cs2.ct:cs2.t, l=winner==='ct'?cs2.t:cs2.ct;
    w.score++; w.eco=Math.min(16000,w.eco+3250); l.eco=Math.min(16000,l.eco+1900);
    cs2.history.push(winner);
    addFeed('ldp-cs2-feed','win',{text:'🏆 '+w.name+' raund kazandı! ('+cs2.ct.score+'–'+cs2.t.score+')'});
    cs2Render();
    if(cs2.ct.score>=16||cs2.t.score>=16){ cs2.over=true; addFeed('ldp-cs2-feed','win',{text:'🎉 Maç bitti! '+w.name+' galip!'}); return; }
    setTimeout(cs2StartRound,4000);
  }

  function cs2StartRound() {
    if(cs2.over) return;
    cs2.round++; cs2.timer=115; cs2.bombPlanted=false; cs2.bombTimer=40;
    ['ct','t'].forEach(s=>cs2[s].players.forEach(p=>{p.alive=true;p.hp=100;p.d++;}));
    addFeed('ldp-cs2-feed','event',{text:'⚔️ Raund '+cs2.round+' başladı'});
    cs2Render(); scheduleCS2Kill();
  }

  let cs2KillTimer=null;
  function scheduleCS2Kill(){clearTimeout(cs2KillTimer);if(!cs2.over)cs2KillTimer=setTimeout(doCS2Kill,3000+Math.random()*8000);}

  function doCS2Kill() {
    if(cs2.over) return;
    const ctA=cs2.ct.players.filter(p=>p.alive), tA=cs2.t.players.filter(p=>p.alive);
    if(!ctA.length||!tA.length) return;
    const isCT=Math.random()<(cs2.bombPlanted?0.38:0.55);
    const wpn=WEAPONS_CS2[Math.floor(Math.random()*WEAPONS_CS2.length)];
    const killer=isCT?ctA[Math.floor(Math.random()*ctA.length)]:tA[Math.floor(Math.random()*tA.length)];
    const victim=isCT?tA[Math.floor(Math.random()*tA.length)]:ctA[Math.floor(Math.random()*ctA.length)];
    victim.alive=false; victim.hp=0; killer.k++;
    killer.adr=Math.min(999,killer.adr+Math.floor(Math.random()*40+60));
    addFeed('ldp-cs2-feed','kill',{killer:killer.name,victim:victim.name,weapon:wpn,hs:Math.random()<0.22});
    cs2Render();
    if(!cs2.ct.players.filter(p=>p.alive).length){setTimeout(()=>cs2EndRound('t'),800);return;}
    if(!cs2.t.players.filter(p=>p.alive).length) {setTimeout(()=>cs2EndRound('ct'),800);return;}
    scheduleCS2Kill();
  }

  setInterval(()=>{
    if(cs2.over) return;
    if(cs2.bombPlanted){cs2.bombTimer--;if(cs2.bombTimer<=0){cs2EndRound('t');return;}}
    else{
      const tA=cs2.t.players.filter(p=>p.alive);
      if(cs2.timer<=90&&cs2.timer>=25&&tA.length&&Math.random()<0.02){cs2.bombPlanted=true;cs2.bombTimer=40;addFeed('ldp-cs2-feed','event',{text:'💣 Bomba yüklendi!'});}
      cs2.timer--; if(cs2.timer<=0){cs2EndRound('ct');return;}
    }
    cs2Render();
  },1000);
  addFeed('ldp-cs2-feed','event',{text:'⚔️ Raund '+cs2.round+' devam ediyor · Inferno'});
  scheduleCS2Kill(); cs2Render();

  /* ═══════════════ VALORANT ═══════════════ */
  const VAL_WPNS=['Vandal','Phantom','Operator','Sheriff','Shorty'];
  const VAL_ABIL=['Jett Dash','Omen Paranoia','Sage Duvar','Sova Drone','Chamber Tuzak','Reyna Devour','Breach Sarsıntı','Viper Dumanı'];
  const val={
    atk:{name:'Nova Esports',score:9,players:[
      {name:'Phantom_X', agent:'Jett',   k:22,d:14,a:6, alive:true},
      {name:'NightShift',agent:'Omen',   k:18,d:11,a:8, alive:true},
      {name:'SilentBlade',agent:'Sage',  k:15,d:16,a:5, alive:true},
      {name:'Quartz',    agent:'Sova',   k:11,d:13,a:9, alive:true},
      {name:'Echo',      agent:'Cypher', k:8, d:15,a:12,alive:true},
    ]},
    def:{name:'Storm GG',score:8,players:[
      {name:'Tempest',   agent:'Chamber', k:20,d:12,a:4, alive:true},
      {name:'LightningK',agent:'Killjoy', k:17,d:14,a:7, alive:true},
      {name:'VoltX',     agent:'Reyna',   k:14,d:17,a:9, alive:true},
      {name:'Flash',     agent:'Breach',  k:10,d:15,a:6, alive:true},
      {name:'Gale',      agent:'Viper',   k:7, d:18,a:11,alive:true},
    ]},
    round:18, timer:82, spikePlanted:false, spikeTimer:45, over:false
  };

  function valRenderPlayers(){
    ['atk','def'].forEach(side=>{
      const el=g('ldp-val-'+side);if(!el)return;
      el.innerHTML=val[side].players.map(p=>
        `<div class="ldp-player-row${p.alive?'':' dead'}">
          <div class="ldp-pname">${p.name}<small>${p.agent}</small></div>
          <div class="ldp-pstat kills">${p.k}</div><div class="ldp-pstat">${p.d}</div>
          <div class="ldp-pstat">${p.a}</div><div class="ldp-pstat">—</div>
        </div>`).join('');
    });
  }

  function valRender(){
    const va=g('ldp-val-a'),vb=g('ldp-val-b');
    if(va)va.textContent=val.atk.score; if(vb)vb.textContent=val.def.score;
    const rnd=g('ldp-val-round-disp');if(rnd)rnd.textContent='Raund '+val.round;
    const tmr=g('ldp-val-timer');
    if(tmr){
      tmr.textContent=val.spikePlanted?'🔴 '+pad(val.spikeTimer):pad(Math.floor(val.timer/60))+':'+pad(val.timer%60);
      tmr.className='ldp-timer'+(val.spikePlanted?' bomb':val.timer<=10?' low':'');
    }
    ['atk','def'].forEach(side=>{
      const el=g('ldp-val-alive-'+side);if(!el)return;
      el.innerHTML=val[side].players.map(p=>`<span class="ldp-dot ${p.alive?'alive-'+side:'dead'}"></span>`).join('');
    });
    const ca=g('live-val-a'),cb=g('live-val-b');
    if(ca)ca.textContent=val.atk.score; if(cb)cb.textContent=val.def.score;
    const cr=g('live-val-round');if(cr)cr.textContent=val.round;
    const vt2=g('live-val-timer');
    if(vt2) vt2.textContent=val.spikePlanted?'🔴'+pad(val.spikeTimer):pad(Math.floor(val.timer/60))+':'+pad(val.timer%60);
    valRenderPlayers();
  }

  function valEndRound(winner){
    if(val.over)return;
    const w=winner==='atk'?val.atk:val.def;
    w.score++;
    addFeed('ldp-val-feed','win',{text:'🏆 '+w.name+' raund kazandı! ('+val.atk.score+'–'+val.def.score+')'});
    valRender();
    if(val.atk.score>=13||val.def.score>=13){val.over=true;addFeed('ldp-val-feed','win',{text:'🎉 Maç bitti! '+w.name+' galip!'});return;}
    setTimeout(valStartRound,4000);
  }

  function valStartRound(){
    if(val.over)return;
    val.round++;val.timer=100;val.spikePlanted=false;val.spikeTimer=45;
    ['atk','def'].forEach(s=>val[s].players.forEach(p=>{p.alive=true;p.d++;}));
    addFeed('ldp-val-feed','event',{text:'⚔️ Raund '+val.round+' başladı'});
    valRender();scheduleValKill();
  }

  let valKillTimer=null;
  function scheduleValKill(){clearTimeout(valKillTimer);if(!val.over)valKillTimer=setTimeout(doValKill,3000+Math.random()*9000);}

  function doValKill(){
    if(val.over)return;
    const aA=val.atk.players.filter(p=>p.alive),dA=val.def.players.filter(p=>p.alive);
    if(!aA.length||!dA.length)return;
    const isAtk=Math.random()<0.5;
    const useAbil=Math.random()<0.3;
    const wpn=useAbil?VAL_ABIL[Math.floor(Math.random()*VAL_ABIL.length)]:VAL_WPNS[Math.floor(Math.random()*VAL_WPNS.length)];
    const killer=isAtk?aA[Math.floor(Math.random()*aA.length)]:dA[Math.floor(Math.random()*dA.length)];
    const victim=isAtk?dA[Math.floor(Math.random()*dA.length)]:aA[Math.floor(Math.random()*aA.length)];
    victim.alive=false;killer.k++;
    addFeed('ldp-val-feed','kill',{killer:killer.name+' ('+killer.agent+')',victim:victim.name+' ('+victim.agent+')',weapon:wpn,hs:Math.random()<0.18});
    valRender();
    if(!val.atk.players.filter(p=>p.alive).length){setTimeout(()=>valEndRound('def'),800);return;}
    if(!val.def.players.filter(p=>p.alive).length){setTimeout(()=>valEndRound('atk'),800);return;}
    scheduleValKill();
  }

  setInterval(()=>{
    if(val.over)return;
    if(val.spikePlanted){val.spikeTimer--;if(val.spikeTimer<=0){valEndRound('atk');return;}}
    else{
      const aA=val.atk.players.filter(p=>p.alive);
      if(val.timer<=70&&val.timer>=20&&aA.length&&Math.random()<0.015){val.spikePlanted=true;addFeed('ldp-val-feed','event',{text:'🔴 Spike yerleştirildi!'});}
      val.timer--;if(val.timer<=0){valEndRound('def');return;}
    }
    valRender();
  },1000);
  addFeed('ldp-val-feed','event',{text:'⚔️ Raund '+val.round+' devam ediyor · Bind'});
  scheduleValKill();valRender();

  /* ═══════════════ LOL ═══════════════ */
  const LOL_SPELLS=['Q','W','E','R','Ignite','Smite','Flash'];
  const lol={
    blue:{name:'Apex Wolves',players:[
      {name:'TopStrike', champ:'Darius',  role:'Top',k:5, d:5,a:9},
      {name:'ForestRun', champ:'Vi',      role:'JG', k:6, d:4,a:12},
      {name:'MidMonster',champ:'Azir',    role:'Mid',k:9, d:3,a:7},
      {name:'WolfKing',  champ:'Jhin',    role:'ADC',k:8, d:2,a:14},
      {name:'ShieldHero',champ:'Thresh',  role:'Sup',k:3, d:8,a:18},
    ],towers:7,dragons:2,baron:0},
    red:{name:'Iron Forge',players:[
      {name:'ForgeTop',  champ:'Garen',   role:'Top',k:2, d:8,a:6},
      {name:'SteelJG',   champ:'Graves',  role:'JG', k:5, d:7,a:9},
      {name:'IronMid',   champ:'LeBlanc', role:'Mid',k:6, d:5,a:8},
      {name:'HammerADC', champ:'Jinx',    role:'ADC',k:7, d:6,a:11},
      {name:'AnvilSup',  champ:'Leona',   role:'Sup',k:2, d:5,a:14},
    ],towers:4,dragons:1,baron:0},
    killsBlue:31,killsRed:22,seconds:28*60+44
  };

  function lolRenderPlayers(){
    ['blue','red'].forEach(side=>{
      const el=g('ldp-lol-'+side);if(!el)return;
      el.innerHTML=lol[side].players.map(p=>
        `<div class="ldp-player-row">
          <div class="ldp-pname">${p.name}<small>${p.champ} (${p.role})</small></div>
          <div class="ldp-pstat kills">${p.k}</div><div class="ldp-pstat">${p.d}</div>
          <div class="ldp-pstat">${p.a}</div><div class="ldp-pstat">—</div>
        </div>`).join('');
    });
  }

  function lolRender(){
    const mm=Math.floor(lol.seconds/60),ss=lol.seconds%60,ts=mm+':'+pad(ss);
    const la=g('ldp-lol-a'),lb=g('ldp-lol-b');
    if(la)la.textContent=lol.killsBlue; if(lb)lb.textContent=lol.killsRed;
    const tmr=g('ldp-lol-timer');if(tmr)tmr.textContent=ts;
    const obj=g('ldp-lol-obj');
    if(obj)obj.innerHTML=`<span class="ldp-obj-item"><span class="ldp-obj-a">🏰 ${lol.blue.towers}</span><span class="ldp-obj-sep"> vs </span><span class="ldp-obj-b">${lol.red.towers} 🏰</span></span>
      <span class="ldp-obj-item"><span class="ldp-obj-a">🐉 ${lol.blue.dragons}</span><span class="ldp-obj-sep"> vs </span><span class="ldp-obj-b">${lol.red.dragons} 🐉</span></span>
      <span class="ldp-obj-item"><span class="ldp-obj-a">👑 Baron ${lol.blue.baron}</span><span class="ldp-obj-sep"> vs </span><span class="ldp-obj-b">${lol.red.baron} 👑</span></span>`;
    const ca=g('live-lol-a'),cb=g('live-lol-b'),ct=g('live-lol-time');
    if(ca)ca.textContent=lol.killsBlue; if(cb)cb.textContent=lol.killsRed; if(ct)ct.textContent=ts;
    lolRenderPlayers();
  }

  let lolKillTimer=null;
  function scheduleLolKill(){clearTimeout(lolKillTimer);lolKillTimer=setTimeout(doLolKill,5000+Math.random()*12000);}

  function doLolKill(){
    const isBl=Math.random()<0.58;
    const ks=isBl?lol.blue:lol.red,vs=isBl?lol.red:lol.blue;
    const killer=ks.players[Math.floor(Math.random()*ks.players.length)];
    const victim=vs.players[Math.floor(Math.random()*vs.players.length)];
    killer.k++;victim.d++;if(isBl)lol.killsBlue++;else lol.killsRed++;
    const sp=LOL_SPELLS[Math.floor(Math.random()*LOL_SPELLS.length)];
    addFeed('ldp-lol-feed','kill',{killer:killer.name+' ('+killer.champ+')',victim:victim.name+' ('+victim.champ+')',weapon:sp});
    if(Math.random()<0.15){if(isBl)lol.blue.dragons++;else lol.red.dragons++;addFeed('ldp-lol-feed','obj',{text:'🐉 '+ks.name+' ejder öldürdü!'});}
    if(Math.random()<0.08){if(isBl)lol.blue.towers++;else lol.red.towers++;addFeed('ldp-lol-feed','obj',{text:'🏰 '+ks.name+' kule yıktı!'});}
    if(Math.random()<0.04){if(isBl)lol.blue.baron++;else lol.red.baron++;addFeed('ldp-lol-feed','obj',{text:'👑 Baron Nashor öldürüldü!'});}
    lolRender();scheduleLolKill();
  }

  setInterval(()=>{lol.seconds++;lolRender();},1000);
  addFeed('ldp-lol-feed','event',{text:'🎮 Summoner\'s Rift · Süper Lig Hafta 8'});
  scheduleLolKill();lolRender();

  /* ═══════════════ DOTA 2 ═══════════════ */
  const DOTA_SPELLS=['Finger of Death','Sunstrike','Dismember','Black Hole','Chain Frost','Shadowraze','Blink Strike','Mana Void'];
  const dota={
    radiant:{name:'Phantom 5',players:[
      {name:'ShadowBlade',hero:'Phantom Lancer',k:8, d:3,a:5},
      {name:'ArcaneMage', hero:'Invoker',        k:7, d:4,a:8},
      {name:'IronClaw',   hero:'Pudge',           k:6, d:5,a:6},
      {name:'SpecterX',   hero:'Anti-Mage',       k:5, d:3,a:3},
      {name:'FrostBite',  hero:'Crystal Maiden',  k:2, d:6,a:11},
    ],towers:5,barracks:2},
    dire:{name:'CyberNova',players:[
      {name:'DataRush',  hero:'Phantom Assassin',k:7, d:5,a:4},
      {name:'NetRunr',   hero:'Lion',            k:4, d:6,a:9},
      {name:'ByteWulf',  hero:'Bristleback',     k:4, d:5,a:5},
      {name:'CodeBreak', hero:'Slark',           k:3, d:4,a:7},
      {name:'SignalX',   hero:'Enigma',          k:1, d:7,a:10},
    ],towers:3,barracks:0},
    killsRad:28,killsDire:19,seconds:35*60+20
  };

  function dotaRenderPlayers(){
    ['radiant','dire'].forEach(side=>{
      const el=g('ldp-dota-'+side);if(!el)return;
      el.innerHTML=dota[side].players.map(p=>
        `<div class="ldp-player-row">
          <div class="ldp-pname">${p.name}<small>${p.hero}</small></div>
          <div class="ldp-pstat kills">${p.k}</div><div class="ldp-pstat">${p.d}</div>
          <div class="ldp-pstat">${p.a}</div><div class="ldp-pstat">—</div>
        </div>`).join('');
    });
  }

  function dotaRender(){
    const mm=Math.floor(dota.seconds/60),ss=dota.seconds%60,ts=mm+':'+pad(ss);
    const da=g('ldp-dota-a'),db=g('ldp-dota-b');
    if(da)da.textContent=dota.killsRad; if(db)db.textContent=dota.killsDire;
    const tmr=g('ldp-dota-timer');if(tmr)tmr.textContent=ts;
    const obj=g('ldp-dota-obj');
    if(obj)obj.innerHTML=`<span class="ldp-obj-item"><span class="ldp-obj-a">🏰 ${dota.radiant.towers} kule</span><span class="ldp-obj-sep"> vs </span><span class="ldp-obj-b">${dota.dire.towers} kule 🏰</span></span>
      <span class="ldp-obj-item"><span class="ldp-obj-a">⚔️ ${dota.radiant.barracks} baraka</span><span class="ldp-obj-sep"> vs </span><span class="ldp-obj-b">${dota.dire.barracks} baraka ⚔️</span></span>`;
    const ca=g('live-dota-a'),cb=g('live-dota-b'),ct=g('live-dota-time');
    if(ca)ca.textContent=dota.killsRad; if(cb)cb.textContent=dota.killsDire; if(ct)ct.textContent=ts;
    dotaRenderPlayers();
  }

  let dotaKillTimer=null;
  function scheduleDotaKill(){clearTimeout(dotaKillTimer);dotaKillTimer=setTimeout(doDotaKill,6000+Math.random()*14000);}

  function doDotaKill(){
    const isRad=Math.random()<0.55;
    const ks=isRad?dota.radiant:dota.dire,vs=isRad?dota.dire:dota.radiant;
    const killer=ks.players[Math.floor(Math.random()*ks.players.length)];
    const victim=vs.players[Math.floor(Math.random()*vs.players.length)];
    killer.k++;victim.d++;if(isRad)dota.killsRad++;else dota.killsDire++;
    const sp=Math.random()<0.45?DOTA_SPELLS[Math.floor(Math.random()*DOTA_SPELLS.length)]:'Normal Saldırı';
    addFeed('ldp-dota-feed','kill',{killer:killer.name+' ('+killer.hero+')',victim:victim.name+' ('+victim.hero+')',weapon:sp});
    if(Math.random()<0.1){if(isRad)dota.radiant.towers++;else dota.dire.towers++;addFeed('ldp-dota-feed','obj',{text:'🏰 '+ks.name+' kule yıktı!'});}
    if(Math.random()<0.05){addFeed('ldp-dota-feed','obj',{text:'🐲 Roshan öldürüldü! '+ks.name+' Aegis aldı!'});}
    dotaRender();scheduleDotaKill();
  }

  setInterval(()=>{dota.seconds++;dotaRender();},1000);
  addFeed('ldp-dota-feed','event',{text:'🎮 Dota 2 Invitational · Oyun 1/3 devam ediyor'});
  scheduleDotaKill();dotaRender();

  /* ═══════════════ PUBG ═══════════════ */
  const PUBG_WPNS=['M416','Kar98k','Groza','UMP45','SCAR-L','AWM','M762','Beryl M762'];
  const pubg={
    squads:[
      {name:'Desert Vipers',alive:4,total:4,kills:15,elim:false},
      {name:'Horizon Rush', alive:3,total:4,kills:12,elim:false},
      {name:'CyberNova',    alive:2,total:4,kills:9, elim:false},
      {name:'Phantom 5',    alive:4,total:4,kills:6, elim:false},
      {name:'Storm GG',     alive:3,total:4,kills:4, elim:false},
      {name:'Dark Matter',  alive:2,total:4,kills:3, elim:false},
      {name:'Apex Wolves',  alive:1,total:4,kills:2, elim:false},
      {name:'Iron Forge',   alive:4,total:4,kills:1, elim:false},
    ],
    zone:4
  };

  function pubgRenderTable(){
    const el=g('ldp-pubg-table-body');if(!el)return;
    const alive=pubg.squads.filter(s=>!s.elim);
    el.innerHTML=alive.map((s,i)=>{
      const pc=i===0?'p1':i===1?'p2':i===2?'p3':'';
      return `<div class="ldp-pubg-row">
        <div class="ldp-pubg-pos ${pc}">#${i+1}</div>
        <div class="ldp-pubg-team">${s.name}</div>
        <div class="ldp-pubg-stat">${s.alive}/${s.total}</div>
        <div class="ldp-pubg-stat kills">${s.kills}</div>
        <div class="ldp-pubg-stat">${s.elim?'❌':'✅'}</div>
      </div>`;
    }).join('');
    const ac=g('ldp-pubg-alive-count');if(ac)ac.textContent=alive.length+' takım kaldı';
    const ck=g('live-pubg-kills');if(ck)ck.textContent=pubg.squads[0].kills;
  }

  let pubgKillTimer=null;
  function schedulePubgKill(){clearTimeout(pubgKillTimer);pubgKillTimer=setTimeout(doPubgKill,5000+Math.random()*12000);}

  function doPubgKill(){
    const alive=pubg.squads.filter(s=>!s.elim&&s.alive>0);
    if(alive.length<2)return;
    const ks=alive[Math.floor(Math.random()*alive.length)];
    const victims=alive.filter(s=>s!==ks);
    const vs=victims[Math.floor(Math.random()*victims.length)];
    ks.kills++;vs.alive=Math.max(0,vs.alive-1);
    const wpn=PUBG_WPNS[Math.floor(Math.random()*PUBG_WPNS.length)];
    addFeed('ldp-pubg-feed','kill',{killer:ks.name,victim:vs.name,weapon:wpn});
    if(vs.alive===0){vs.elim=true;addFeed('ldp-pubg-feed','obj',{text:'💀 '+vs.name+' elendi!'});}
    pubg.squads.sort((a,b)=>a.elim!==b.elim?a.elim?1:-1:b.kills-a.kills);
    pubgRenderTable();schedulePubgKill();
  }

  setInterval(()=>{if(Math.random()<0.04){pubg.zone++;addFeed('ldp-pubg-feed','event',{text:'🔵 Zone '+pubg.zone+' kapanıyor!'});}},5000);
  addFeed('ldp-pubg-feed','event',{text:'🔵 Erangel · Zone 4 · Oyun 3/6'});
  schedulePubgKill();pubgRenderTable();
}


// ── 15. HABERLERİ FİLTRELE ────────────────────
function initFilterTabs() {
  const tabs = $$('.filter-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    on(tab, 'click', () => {
      const group = tab.closest('.news-filter-tabs, .match-filter-tabs');
      if (group) group.querySelectorAll('.filter-tab').forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      const filter = tab.dataset.filter;
      if (!filter) return;
      $$('.news-card[data-game]').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.game === filter) ? '' : 'none';
      });
    });
  });
}

// ── BAŞLAT ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initCountdown();
  initLightbox();
  initMatchTabs();
  initForm();
  initLiveScores();
  initActiveNav();
  initScrollToTop();
  initSearch();
  initLiveDetail();
  initFilterTabs();
});
