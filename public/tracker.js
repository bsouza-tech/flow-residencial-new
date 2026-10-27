/*!
 * Genesis tracker — modelo acessos_user (mesma origem).
 * Depende de /consent.js (window.GenesisConsent).
 *
 * Endpoints: POST /api/tracking, POST /api/tracking/saida,
 * PATCH /api/tracking/consentimento.
 *
 * Leads / Formulário Global: window.GenesisTracker.getContext()
 * (genesis_uid_v1, genesis_sess_v1, genesis_touch_v1).
 */
(function () {
  'use strict';

  var UID_KEY = 'genesis_uid_v1';
  var TOUCH_KEY = 'genesis_touch_v1';
  var SESS_KEY = 'genesis_sess_v1';
  var ORIGEM_KEY = 'genesis_origem_bruta_v1';
  var SESSION_TIMEOUT_MS = 30 * 60 * 1000;

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
    var h = Array.prototype.map.call(b, function (x) {
      return ('0' + x.toString(16)).slice(-2);
    }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' +
      h.slice(16, 20) + '-' + h.slice(20);
  }

  function nowIso() { return new Date().toISOString(); }

  function mapConsent(status) {
    if (status === 'granted') return 'aceito';
    if (status === 'denied') return 'rejeitado';
    return 'pendente';
  }

  function currentConsentStatus() {
    try {
      return window.GenesisConsent && typeof window.GenesisConsent.get === 'function'
        ? window.GenesisConsent.get()
        : null;
    } catch (e) {
      return null;
    }
  }

  // -------------------------------------------------------------------
  // Identidade / atribuição (leads + Formulário Global)
  // -------------------------------------------------------------------
  function getUserId() {
    var id = lsGet(UID_KEY);
    if (id) return id;
    id = uuid();
    lsSet(UID_KEY, id);
    return id;
  }

  function param(name) {
    var v = new URLSearchParams(window.location.search).get(name);
    return v ? v.trim() : '';
  }

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

  function classifyForTouch(ctx) {
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
    var own = (window.location.hostname || '').toLowerCase().replace(/^www\./, '');
    if (host && host.replace(/^www\./, '') === own) host = '';
    if (ctx.gclid) return { kind: 'paid', source: 'google', medium: 'cpc' };
    if (ctx.fbclid) return { kind: 'social', source: 'meta', medium: 'social' };
    if (host) return { kind: 'referral', source: host, medium: 'referral' };
    return { kind: 'direct', source: 'direct', medium: '(none)' };
  }

  function touchFrom(cls, ctx) {
    return {
      source: cls.source,
      medium: cls.medium,
      campaign: cls.campaign || '',
      term: cls.term || '',
      content: cls.content || '',
      referrer: cleanRef(ctx.referrer),
      landing_page: window.location.pathname || '/',
      at: nowIso(),
    };
  }

  function updateTouches(cls, ctx) {
    var stored = readJSON(TOUCH_KEY);
    var t = touchFrom(cls, ctx);
    if (!stored || !stored.first) {
      stored = { first: t, last: t };
    } else if (cls.kind !== 'direct') {
      stored.last = t;
    }
    lsSet(TOUCH_KEY, JSON.stringify(stored));
    return stored;
  }

  function getSessionId() {
    var now = Date.now();
    var s = readJSON(SESS_KEY);
    var expired = !s || !s.id || now - (s.last || 0) > SESSION_TIMEOUT_MS;
    if (expired) s = { id: uuid(), sig: '' };
    s.last = now;
    lsSet(SESS_KEY, JSON.stringify(s));
    return s.id;
  }

  function clearIdentity() {
    lsDel(UID_KEY);
    lsDel(TOUCH_KEY);
    lsDel(SESS_KEY);
  }

  // -------------------------------------------------------------------
  // origem_bruta (sessionStorage — 1ª visita da aba)
  // -------------------------------------------------------------------
  function parseReferrer(raw) {
    if (!raw || !String(raw).trim()) return { host: null, caminho: null };
    try {
      var u = new URL(raw);
      return {
        host: u.hostname || null,
        caminho: (u.pathname || '/') + (u.search || '') || null,
      };
    } catch (e) {
      return { host: null, caminho: null };
    }
  }

  function captureOrigemBruta() {
    var params = new URLSearchParams(window.location.search);
    function pick(k) {
      var v = params.get(k);
      return v && v.trim() ? v.trim() : null;
    }
    var click_id = null;
    var click_id_tipo = null;
    var tipos = ['gclid', 'gbraid', 'wbraid', 'fbclid'];
    for (var i = 0; i < tipos.length; i++) {
      var v = pick(tipos[i]);
      if (v) {
        click_id = v;
        click_id_tipo = tipos[i];
        break;
      }
    }
    var ref = parseReferrer(document.referrer || '');
    return {
      utm_source: pick('utm_source'),
      utm_medium: pick('utm_medium'),
      utm_campaign: pick('utm_campaign'),
      utm_content: pick('utm_content'),
      utm_term: pick('utm_term'),
      click_id: click_id,
      click_id_tipo: click_id_tipo,
      referrer_host: ref.host,
      referrer_caminho: ref.caminho,
    };
  }

  function getOrCaptureOrigemBruta() {
    try {
      var raw = sessionStorage.getItem(ORIGEM_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    var captured = captureOrigemBruta();
    try { sessionStorage.setItem(ORIGEM_KEY, JSON.stringify(captured)); } catch (e) { /* ignore */ }
    return captured;
  }

  // -------------------------------------------------------------------
  // HTTP
  // -------------------------------------------------------------------
  function postJson(path, body, method) {
    try {
      var req = fetch(path, {
        method: method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      });
      if (req && typeof req.catch === 'function') req.catch(function () {});
    } catch (e) { /* tracking nunca quebra o site */ }
  }

  function sendBeaconOrFetch(path, body) {
    var raw = JSON.stringify(body);
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([raw], { type: 'application/json' });
        if (navigator.sendBeacon(path, blob)) return;
      }
    } catch (e) { /* fallback */ }
    postJson(path, body, 'POST');
  }

  // -------------------------------------------------------------------
  // Pageview
  // -------------------------------------------------------------------
  var pageviewId = uuid();
  var startAt = Date.now();
  var ativoS = 0;
  var scrollMax = 0;
  var secoes = {};
  var clicouWhatsapp = false;
  var touches = null;
  var usuarioId = null;
  var sessaoId = null;

  var urlCtx = {
    utm_source: param('utm_source'),
    utm_medium: param('utm_medium'),
    utm_campaign: param('utm_campaign'),
    utm_term: param('utm_term'),
    utm_content: param('utm_content'),
    gclid: param('gclid'),
    fbclid: param('fbclid'),
    referrer: document.referrer || '',
  };
  var touchCls = classifyForTouch(urlCtx);
  var origem = getOrCaptureOrigemBruta();

  function maxScrollPct() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 100;
    return Math.min(100, Math.round((window.scrollY / max) * 100));
  }

  function activeSectionName() {
    var cx = Math.round(window.innerWidth / 2);
    var cy = Math.round(window.innerHeight / 2);
    var el = document.elementFromPoint(cx, cy);
    if (!el || !(el instanceof Element)) return null;
    var section = el.closest('[data-section]');
    if (!section) return null;
    var name = (section.getAttribute('data-section') || '').trim();
    return name || null;
  }

  function isWhatsAppTarget(target) {
    if (!(target instanceof Element)) return false;
    var a = target.closest('a[href]');
    if (a) {
      var href = String(a.href || '').toLowerCase();
      if (
        href.indexOf('whatsapp') !== -1 ||
        href.indexOf('wa.me') !== -1 ||
        href.indexOf('api.whatsapp.com') !== -1
      ) {
        return true;
      }
    }
    var btn = target.closest('button, [role="button"]');
    if (btn && /whatsapp/i.test(btn.textContent || '')) return true;
    return false;
  }

  function becomeConsented() {
    usuarioId = getUserId();
    touches = updateTouches(touchCls, urlCtx);
    sessaoId = getSessionId();
  }

  function revokeIdentity() {
    usuarioId = null;
    sessaoId = null;
    touches = null;
    clearIdentity();
  }

  function buildEntrada(consentimento) {
    var payload = {
      id: pageviewId,
      caminho: window.location.pathname || '/',
      titulo: document.title || null,
      ocorrido_em: nowIso(),
      consentimento: consentimento,
      utm_source: origem.utm_source,
      utm_medium: origem.utm_medium,
      utm_campaign: origem.utm_campaign,
      utm_content: origem.utm_content,
      utm_term: origem.utm_term,
      click_id: origem.click_id,
      click_id_tipo: origem.click_id_tipo,
      referrer_host: origem.referrer_host,
      referrer_caminho: origem.referrer_caminho,
    };
    if (consentimento === 'aceito' && sessaoId) {
      payload.sessao_id = sessaoId;
    }
    return payload;
  }

  function buildSaida() {
    var permanencia_s = Math.min(86400, Math.max(0, Math.round((Date.now() - startAt) / 1000)));
    var ativo_s = Math.min(86400, Math.max(0, ativoS));
    var scroll_pct = scrollMax;
    return {
      id: pageviewId,
      permanencia_s: permanencia_s,
      ativo_s: ativo_s,
      scroll_pct: scroll_pct,
      leu_conteudo: scroll_pct >= 60 && ativo_s >= 15,
      clicou_whatsapp: clicouWhatsapp,
      secoes: Object.assign({}, secoes),
    };
  }

  function flushSaida() {
    sendBeaconOrFetch('/api/tracking/saida', buildSaida());
  }

  function sendAceite() {
    var sid = getSessionId();
    sessaoId = sid;
    postJson('/api/tracking/consentimento', {
      id: pageviewId,
      sessao_id: sid,
    }, 'PATCH');
  }

  // Entrada inicial
  var initialStatus = currentConsentStatus();
  var consentimento = mapConsent(initialStatus);
  if (consentimento === 'aceito') becomeConsented();
  postJson('/api/tracking', buildEntrada(consentimento), 'POST');

  window.addEventListener('scroll', function () {
    scrollMax = Math.max(scrollMax, maxScrollPct());
  }, { passive: true });
  scrollMax = maxScrollPct();

  document.addEventListener('click', function (e) {
    if (isWhatsAppTarget(e.target)) clicouWhatsapp = true;
  }, true);

  setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    ativoS += 1;
    if (mapConsent(currentConsentStatus()) === 'aceito') {
      getSessionId(); // renova last
    }
    var name = activeSectionName();
    if (!name) return;
    var sum = 0;
    for (var k in secoes) {
      if (Object.prototype.hasOwnProperty.call(secoes, k)) sum += secoes[k];
    }
    if (sum >= ativoS) return;
    secoes[name] = (secoes[name] || 0) + 1;
  }, 1000);

  function onLeave() { flushSaida(); }
  window.addEventListener('pagehide', onLeave);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') onLeave();
  });

  // Consentimento
  function handleStatus(status) {
    var mapped = mapConsent(status);
    if (mapped === 'aceito') {
      becomeConsented();
      sendAceite();
      return;
    }
    if (status === 'denied' || status === null) {
      if (usuarioId || sessaoId || touches) revokeIdentity();
    }
  }

  var consent = window.GenesisConsent;
  if (consent && typeof consent.onChange === 'function') {
    var skipFirstConsent = true;
    consent.onChange(function (status) {
      // onChange dispara no subscribe com o valor atual — evita PATCH duplicado
      if (skipFirstConsent) {
        skipFirstConsent = false;
        return;
      }
      handleStatus(status);
    });
  }

  window.GenesisTracker = {
    getContext: function () {
      var consented = mapConsent(currentConsentStatus()) === 'aceito';
      return {
        pageview_id: pageviewId,
        usuario_id: consented ? (usuarioId || getUserId()) : null,
        sessao_id: consented ? (sessaoId || getSessionId()) : null,
        first: consented && touches ? touches.first : null,
        last: consented && touches ? touches.last : null,
        gclid: consented ? (urlCtx.gclid || null) : null,
        fbclid: consented ? (urlCtx.fbclid || null) : null,
      };
    },
  };
})();
