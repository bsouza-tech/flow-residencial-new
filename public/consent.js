(function () {
  'use strict';

  var STORAGE_KEY = 'genesis_consent_v1';
  var VERSION = 1;
  var memoryRecord = null;
  var listeners = [];

  function now() {
    return Date.now();
  }

  function normalizeStatus(value) {
    return value === 'granted' || value === 'denied' ? value : null;
  }

  function isExpired(record) {
    if (!record || typeof record.ts !== 'number') return true;
    var expires = new Date(record.ts);
    expires.setMonth(expires.getMonth() + 12);
    return now() > expires.getTime();
  }

  function readStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      var status = normalizeStatus(parsed.status);
      if (!status) return null;
      var record = {
        status: status,
        ts: typeof parsed.ts === 'number' ? parsed.ts : 0,
        version: typeof parsed.version === 'number' ? parsed.version : VERSION,
      };
      if (isExpired(record)) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          /* ignore */
        }
        return null;
      }
      return record;
    } catch (e) {
      return null;
    }
  }

  function writeStorage(record) {
    memoryRecord = record;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (e) {
      /* modo privado / quota — mantém só em memória */
    }
  }

  function clearStorage() {
    memoryRecord = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function currentRecord() {
    if (memoryRecord) {
      if (isExpired(memoryRecord)) {
        memoryRecord = null;
        return null;
      }
      return memoryRecord;
    }
    var fromStorage = readStorage();
    if (fromStorage) memoryRecord = fromStorage;
    return fromStorage;
  }

  function get() {
    var record = currentRecord();
    return record ? record.status : null;
  }

  function emit(status) {
    for (var i = 0; i < listeners.length; i += 1) {
      try {
        listeners[i](status);
      } catch (e) {
        /* listener com erro não quebra os demais */
      }
    }
    try {
      window.dispatchEvent(
        new CustomEvent('genesis:consent', {
          detail: { status: status },
        })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function setStatus(status) {
    var record = {
      status: status,
      ts: now(),
      version: VERSION,
    };
    writeStorage(record);
    emit(status);
  }

  function grant() {
    setStatus('granted');
  }

  function deny() {
    setStatus('denied');
  }

  function reset() {
    clearStorage();
    emit(null);
  }

  function onChange(callback) {
    if (typeof callback !== 'function') return function () {};
    listeners.push(callback);
    try {
      callback(get());
    } catch (e) {
      /* ignore */
    }
    return function unsubscribe() {
      listeners = listeners.filter(function (fn) {
        return fn !== callback;
      });
    };
  }

  // Hidrata memória a partir do storage no load
  currentRecord();

  window.GenesisConsent = {
    get: get,
    grant: grant,
    deny: deny,
    reset: reset,
    onChange: onChange,
  };
})();
