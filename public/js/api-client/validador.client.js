(() => {
  const STORAGE_KEY = 'briefValidadorBaseUrl';
  const DEFAULT_BASE_URL = '/api/validador';
  const LOCAL_SERVER_BASE = 'http://localhost:3000/api/validador';
  const CUSTOM_BASE = window.API_BASE_URL;

  function sanitizeBaseUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed.replace(/\/$/, '');
    }

    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`.replace(/\/$/, '');
    }

    if (trimmed.startsWith('/')) {
      return trimmed.replace(/\/$/, '');
    }

    try {
      const fromRelative = new URL(trimmed, window.location.origin || 'http://localhost');
      return fromRelative.href.replace(/\/$/, '');
    } catch {
      return null;
    }
  }

  function resolveBaseUrl({ ignoreStored = false } = {}) {
    const params = new URLSearchParams(window.location.search || '');
    const apiQuery = params.get('api');
    const normalizedQuery = sanitizeBaseUrl(apiQuery);
    if (normalizedQuery) {
      try {
        window.localStorage?.setItem(STORAGE_KEY, normalizedQuery);
      } catch {
        // Ignorar si storage no disponible
      }
      return normalizedQuery;
    }

    if (CUSTOM_BASE) {
      const normalized = sanitizeBaseUrl(CUSTOM_BASE);
      if (normalized) return normalized;
    }

    if (!ignoreStored) {
      try {
        const stored = window.localStorage?.getItem(STORAGE_KEY);
        const normalizedStored = sanitizeBaseUrl(stored);
        if (normalizedStored) return normalizedStored;
      } catch {
        // No storage
      }
    }

    const origin = window.location.origin || '';

    if (origin.startsWith('file://')) return LOCAL_SERVER_BASE;

    if (/localhost:3000|127\.0\.0\.1:3000/.test(origin)) {
      return `${origin.replace(/\/$/, '')}/api/validador`;
    }

    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return LOCAL_SERVER_BASE;
    }

    if (origin) {
      return `${origin.replace(/\/$/, '')}/api/validador`;
    }

    return DEFAULT_BASE_URL;
  }

  let BASE_URL = resolveBaseUrl();

  function setBaseUrl(url) {
    const normalized = sanitizeBaseUrl(url);
    if (!normalized) {
      throw new Error('URL inválida. Debe incluir http(s):// o iniciar con /.');
    }
    BASE_URL = normalized;
    try {
      window.localStorage?.setItem(STORAGE_KEY, BASE_URL);
    } catch {
      // Storage no disponible
    }
    return BASE_URL;
  }

  function resetBaseUrl() {
    try {
      window.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      // ignorar
    }

    BASE_URL = resolveBaseUrl({ ignoreStored: true });
    return BASE_URL;
  }

  function getBaseUrl() {
    return BASE_URL;
  }

  async function postJson(url, payload) {
    let res;

    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      });
    } catch (error) {
      const detalle = error?.message ? ` Detalle: ${error.message}` : '';
      throw new Error(`No se pudo conectar con el validador. Verifica que el servidor esté en ejecución (puerto 3000) y vuelve a intentar.${detalle}`);
    }

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const message = isJson && data?.error ? data.error : res.statusText;
      throw new Error(message || 'Error en la solicitud');
    }

    return data;
  }

  async function validarBrief({ nombre, texto, extension }) {
    if (!nombre || !texto) {
      throw new Error('nombre y texto son obligatorios');
    }

    return postJson(BASE_URL, { nombre, texto, extension });
  }

  async function generarSuperBrief({ nombre, respuestas }) {
    if (!Array.isArray(respuestas) || !respuestas.length) {
      throw new Error('respuestas es obligatorio y debe tener elementos');
    }

    return postJson(`${BASE_URL}/super-brief`, { nombre, respuestas });
  }

  window.validadorClient = {
    validarBrief,
    generarSuperBrief,
    setBaseUrl,
    getBaseUrl,
    resetBaseUrl,
  };
})();
