/*!
 * Genesis tracker v1
 * Registra pageviews, origem (UTM / referrer / gclid / fbclid), engajamento e
 * tempo por seção. Depende de /consent.js (window.GenesisConsent).
 *
 * Uso:
 * <script is:inline src="/consent.js"></script>
 * <script is:inline src="/tracker.js" defer
 *   data-site-key="..." data-endpoint="https://<ref>.supabase.co/functions/v1/track"
 *   data-requires-consent="true" data-sections="hero,plantas,galeria"></script>
 */
(function () {
  'use strict';

  var script = document.currentScript;
  function attr(name) {
    return script ? script.getAttribute(name) : null;
  }

  var cfg = {
    siteKey: attr('data-site-key'),
    endpoint: attr('data-endpoint'),
    requiresConsent: attr('data-requires-consent') !== 'false',
    sections: (attr('data-sections') || '')
      .split(',')
      .map(function (s) { return s.trim().toLowerCase(); })
      .filter(Boolean),
    graceMs: Number(attr('data-grace-ms')) || 6000,
  };
  if (!cfg.siteKey || !cfg.endpoint) return;

  var UID_KEY = 'genesis_uid_v1';
  var TOUCH_KEY = 'genesis_touch_v1';
  var SESS_KEY = 'genesis_sess_v1';
  var SESSION_TIMEOUT_MS = 30 * 60 * 1000;
  var UPDATE_EVERY_MS = 30 * 1000;
  var ACTIVE_WINDOW_MS = 5 * 1000; // atividade recente para contar tempo_ativo
  var SECTION_IDLE_MS = 60 * 1000; // sem atividade por 60s: para de contar tempo de seção
  var MAX_SENDS = 40; // teto de envios por pageview

  // -------------------------------------------------------------------
  // Utilidades
  // -------------------------------------------------------------------
  var mem = {};
  function lsGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return mem[k] || null; }
  }
  function lsSet(k, v) {
    mem[k] = v;
    try { localStorage.setItem(k, v); } catch (e) { /* modo privado */ }
  }
  function lsDel(k) {
    delete mem[k];
    try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
  }
  function readJSON(k) {
    try { return JSON.parse(lsGet(k) || 'null'); } catch (e) { return null; }
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    var b = new Uint8Array(16);
    (window.crypto || {}).getRandomValues
      ? window.crypto.getRandomValues(b)
      : b.forEach(function (_, i) { b[i] = Math.floor(Math.random() * 256); });
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    var h = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  function nowIso() { return new Date().toISOString(); }

  // -------------------------------------------------------------------
  // Contexto desta carga de página (capturado uma vez, em memória)
  // -------------------------------------------------------------------
  var loc = window.location;
  var params = new URLSearchParams(loc.search);
  function param(name) {
    var v = params.get(name);
    return v ? v.trim() : '';
  }
  var ctx = {
    utm_source: param('utm_source'),
    utm_medium: param('utm_medium'),
    utm_campaign: param('utm_campaign'),
    utm_term: param('utm_term'),
    utm_content: param('utm_content'),
    gclid: param('gclid'),
    fbclid: param('fbclid'),
    referrer: document.referrer || '',
    path: loc.pathname || '/',
  };

  function hostOf(url) {
    try { return new URL(url).hostname.toLowerCase(); } catch (e) { return ''; }
  }
  function cleanRef(url) {
    try {
      var u = new URL(url);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
      return u.hostname.toLowerCase() + (u.pathname === '/' ? '' : u.pathname);
    } catch (e) { return ''; }
  }

  // -------------------------------------------------------------------
  // Classificação de origem
  // -------------------------------------------------------------------
  var SEARCH = [
    [/^(www\.)?google\.[a-z.]+$/, 'google'],
    [/^(www\.)?bing\.com$/, 'bing'],
    [/(^|\.)search\.yahoo\.[a-z.]+$|^(www\.)?yahoo\.[a-z.]+$/, 'yahoo'],
    [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
    [/(^|\.)baidu\.com$/, 'baidu'],
    [/(^|\.)yandex\.[a-z.]+$/, 'yandex'],
  ];
  var SOCIAL = [
    ['facebook.com', 'facebook'], ['fb.com', 'facebook'],
    ['instagram.com', 'instagram'],
    ['whatsapp.com', 'whatsapp'], ['wa.me', 'whatsapp'],
    ['tiktok.com', 'tiktok'],
    ['twitter.com', 'twitter'], ['t.co', 'twitter'], ['x.com', 'twitter'],
    ['linkedin.com', 'linkedin'], ['lnkd.in', 'linkedin'],
    ['youtube.com', 'youtube'], ['youtu.be', 'youtube'],
    ['pinterest.com', 'pinterest'],
  ];

  function socialName(host) {
    for (var i = 0; i < SOCIAL.length; i++) {
      var d = SOCIAL[i][0];
      if (host === d || host.slice(-(d.length + 1)) === '.' + d) return SOCIAL[i][1];
    }
    return '';
  }

  function isInternal(host) {
    var a = host.replace(/^www\./, '');
    var b = (loc.hostname || '').toLowerCase().replace(/^www\./, '');
    return a === b;
  }

  // Ordem: referrer interno (ignorado) > UTM > gclid > fbclid > busca > social > outro > direto
  function classify() {
    if (ctx.utm_source || ctx.utm_medium || ctx.utm_campaign) {
      return {
        kind: 'utm',
        source: ctx.utm_source || '(not set)',
        medium: ctx.utm_medium || '(not set)',
        campaign: ctx.utm_campaign,
        term: ctx.utm_term,
        content: ctx.utm_content,
      };
    }
    var host = hostOf(ctx.referrer);
    if (host && isInternal(host)) host = '';

    if (ctx.gclid) return { kind: 'paid', source: 'google', medium: 'cpc' };
    if (ctx.fbclid) return { kind: 'social', source: (host && socialName(host)) || 'meta', medium: 'social' };

    if (host) {
      for (var i = 0; i < SEARCH.length; i++) {
        if (SEARCH[i][0].test(host)) return { kind: 'search', source: SEARCH[i][1], medium: 'organic' };
      }
      var s = socialName(host);
      if (s) return { kind: 'social', source: s, medium: 'social' };
      return { kind: 'referral', source: host, medium: 'referral' };
    }
    return { kind: 'direct', source: 'direct', medium: '(none)' };
  }

  var cls = classify();

  function touchFrom(c) {
    return {
      source: c.source,
      medium: c.medium,
      campaign: c.campaign || '',
      term: c.term || '',
      content: c.content || '',
      referrer: cleanRef(ctx.referrer),
      landing_page: ctx.path,
      at: nowIso(),
    };
  }

  // -------------------------------------------------------------------
  // Identidade (só existe com consentimento)
  // -------------------------------------------------------------------
  function getUserId() {
    var id = lsGet(UID_KEY);
    if (id) return id;
    id = uuid();
    lsSet(UID_KEY, id);
    return id;
  }

  // first: nunca sobrescrito. last: só muda com origem identificada (visita direta não sobrescreve).
  function updateTouches() {
    var stored = readJSON(TOUCH_KEY);
    var t = touchFrom(cls);
    if (!stored || !stored.first) {
      stored = { first: t, last: t };
    } else if (cls.kind !== 'direct') {
      stored.last = t;
    }
    lsSet(TOUCH_KEY, JSON.stringify(stored));
    return stored;
  }

  // Nova sessão: 30 min de inatividade, ou chegada com campanha diferente da sessão atual.
  function getSessionId() {
    var now = Date.now();
    var s = readJSON(SESS_KEY);
    var sig = cls.kind === 'utm' || cls.kind === 'paid'
      ? [cls.source, cls.medium, cls.campaign || ''].join('|')
      : '';
    var expired = !s || !s.id || now - (s.last || 0) > SESSION_TIMEOUT_MS;
    var changed = !!(s && sig && sig !== (s.sig || ''));
    if (expired || changed) s = { id: uuid(), sig: sig };
    s.last = now;
    lsSet(SESS_KEY, JSON.stringify(s));
    return s.id;
  }

  // -------------------------------------------------------------------
  // Engajamento da página e tempo por seção
  // -------------------------------------------------------------------
  var eng = {
    active: 0,
    scrollMax: 0,
    lastActivity: Date.now(),
    readingSecs: 0,
    sectionTime: {},
    sectionVisible: {},
  };

  function scrollPctNow() {
    var de = document.documentElement;
    var max = de.scrollHeight - window.innerHeight;
    if (max <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100)));
  }
  function onActivity(isScroll) {
    eng.lastActivity = Date.now();
    if (isScroll) eng.scrollMax = Math.max(eng.scrollMax, scrollPctNow());
  }
  window.addEventListener('scroll', function () { onActivity(true); }, { passive: true });
  ['keydown', 'mousemove', 'touchstart', 'click'].forEach(function (ev) {
    window.addEventListener(ev, function () { onActivity(false); }, { passive: true });
  });

  // Um único relógio de 1s: nunca conta tempo com a aba oculta.
  setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    var idle = Date.now() - eng.lastActivity;
    if (idle < ACTIVE_WINDOW_MS) eng.active += 1;
    if (idle < SECTION_IDLE_MS) {
      for (var k in eng.sectionVisible) {
        if (eng.sectionVisible[k]) eng.sectionTime[k] = (eng.sectionTime[k] || 0) + 1;
      }
    }
  }, 1000);

  function readingSeconds() {
    if (eng.readingSecs > 0) return eng.readingSecs;
    try {
      var words = (document.body.innerText || '').trim().split(/\s+/).filter(Boolean).length;
      eng.readingSecs = Math.round((words / 200) * 60); // 200 palavras/min, como no Nature
    } catch (e) { /* ignore */ }
    return eng.readingSecs;
  }

  function engagementNow() {
    eng.scrollMax = Math.max(eng.scrollMax, scrollPctNow());
    var out = { tempo_ativo: eng.active, scroll: eng.scrollMax };
    var reading = readingSeconds();
    if (reading > 0) {
      var score = Math.round(
        100 * (0.5 * Math.min(eng.scrollMax / 100, 1) + 0.5 * Math.min(eng.active / reading, 1))
      );
      out.tempo_leitura_estimado = reading;
      out.score_engajamento = score;
      out.leitura = score >= 50; // mesma fórmula do Nature
    }
    return out;
  }

  function sectionsNow() {
    var out = [];
    for (var k in eng.sectionTime) {
      if (eng.sectionTime[k] > 0) out.push({ secao: k, tempo_tela: eng.sectionTime[k] });
    }
    return out;
  }

  // Seção conta como visível quando ocupa 30% dela OU 30% da tela
  // (seções muito altas nunca chegariam a 30% da própria área).
  function observeSections() {
    if (!cfg.sections.length || typeof IntersectionObserver === 'undefined') return;
    var pending = cfg.sections.slice();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id = e.target.id.toLowerCase();
        var vh = (e.rootBounds && e.rootBounds.height) || window.innerHeight;
        eng.sectionVisible[id] =
          e.isIntersecting && (e.intersectionRatio >= 0.3 || e.intersectionRect.height >= 0.3 * vh);
      });
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.75, 1] });

    var tries = 0;
    (function look() {
      pending = pending.filter(function (id) {
        var el = document.getElementById(id);
        if (!el) return true;
        io.observe(el);
        return false;
      });
      tries += 1;
      if (pending.length && tries < 40) setTimeout(look, 500); // islands React hidratam depois
    })();
  }

  // -------------------------------------------------------------------
  // Envio
  // -------------------------------------------------------------------
  var state = {
    id: uuid(),
    consented: false,
    created: false,
    sends: 0,
    last: '',
    graceTimer: null,
    usuarioId: null,
    sessaoId: null,
    touches: null,
  };

  function buildPayload() {
    var p = {
      v: 1,
      site_key: cfg.siteKey,
      id: state.id,
      pagina: ctx.path,
      referrer: cleanRef(ctx.referrer),
      consentimento: state.consented,
      session: touchFrom(cls),
      secoes: sectionsNow(),
    };
    var e = engagementNow();
    for (var k in e) p[k] = e[k];
    if (state.consented) {
      p.usuario_id = state.usuarioId;
      p.sessao_id = state.sessaoId;
      p.first = state.touches && state.touches.first;
      p.last = state.touches && state.touches.last;
      p.gclid = ctx.gclid || null;
      p.fbclid = ctx.fbclid || null;
    }
    return p;
  }

  function post(body, beacon) {
    if (beacon && navigator.sendBeacon) {
      try { if (navigator.sendBeacon(cfg.endpoint, body)) return; } catch (e) { /* cai no fetch */ }
    }
    try {
      // string sem header = text/plain: não gera preflight de CORS
      var req = fetch(cfg.endpoint, { method: 'POST', body: body, keepalive: true, mode: 'no-cors', credentials: 'omit' });
      // fetch falha com promessa rejeitada (URL inválida, rede fora): o try/catch sozinho não pega
      if (req && typeof req.catch === 'function') req.catch(function () {});
    } catch (e) { /* tracking nunca quebra o site */ }
  }

  function flush(beacon, force) {
    if (!state.created) return;
    if (state.sends >= MAX_SENDS) return;
    var p = buildPayload();
    // "at" muda a cada chamada; compara sem ele para não reenviar sem mudança
    var sig = JSON.stringify(p, function (k, v) { return k === 'at' ? undefined : v; });
    if (!force && sig === state.last) return;
    state.last = sig;
    state.sends += 1;
    post(JSON.stringify(p), beacon);
  }

  // -------------------------------------------------------------------
  // Consentimento
  // -------------------------------------------------------------------
  function sendInitial(beacon) {
    if (state.created) return;
    state.created = true;
    clearTimeout(state.graceTimer);
    flush(beacon, true);
  }

  function becomeConsented() {
    clearTimeout(state.graceTimer);
    state.consented = true;
    state.usuarioId = getUserId();
    state.touches = updateTouches();
    state.sessaoId = getSessionId();
    if (!state.created) {
      sendInitial(false);
    } else {
      flush(false, true); // visita anônima que aceitou: atualiza a mesma linha
    }
  }

  function revoke() {
    state.consented = false;
    state.usuarioId = state.sessaoId = state.touches = null;
    lsDel(UID_KEY);
    lsDel(TOUCH_KEY);
    lsDel(SESS_KEY);
  }

  function handleStatus(status) {
    if (status === 'granted') {
      becomeConsented();
      return;
    }
    if (state.consented) revoke();
    if (status === 'denied') {
      sendInitial(false);
    } else if (!state.created && !state.graceTimer) {
      // ainda sem decisão: espera um pouco para a maioria que aceita ficar vinculada à visita
      state.graceTimer = setTimeout(function () { sendInitial(false); }, cfg.graceMs);
    }
  }

  var consent = window.GenesisConsent;
  if (!cfg.requiresConsent) {
    becomeConsented();
  } else if (consent && typeof consent.onChange === 'function') {
    consent.onChange(handleStatus);
  } else {
    handleStatus('denied');
  }

  observeSections();

  setInterval(function () {
    if (document.visibilityState === 'visible') flush(false, false);
  }, UPDATE_EVERY_MS);

  function onLeave() {
    if (!state.created) sendInitial(true);
    else flush(true, false);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') onLeave();
  });
  window.addEventListener('pagehide', onLeave);

  // API para o formulário de lead (ligar o lead à visita e à origem)
  window.GenesisTracker = {
    getContext: function () {
      return {
        pageview_id: state.id,
        usuario_id: state.consented ? state.usuarioId : null,
        sessao_id: state.consented ? state.sessaoId : null,
        first: state.consented && state.touches ? state.touches.first : null,
        last: state.consented && state.touches ? state.touches.last : null,
        gclid: state.consented ? ctx.gclid || null : null,
        fbclid: state.consented ? ctx.fbclid || null : null,
      };
    },
  };
})();
