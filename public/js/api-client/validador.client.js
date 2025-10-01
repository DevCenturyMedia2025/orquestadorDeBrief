(() => {
  const BASE_URL = '/api/validador';

  async function postJson(url, payload) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

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

  window.validadorClient = { validarBrief };
})();
