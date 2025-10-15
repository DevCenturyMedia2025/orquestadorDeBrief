// carga.js
let respuestasGlobales = []; // Se guarda para exportar luego

const loaderEl = document.getElementById('loader');
const btnCargar = document.getElementById('btnCargar');
const btnDescargarPDF = document.getElementById('btnDescargarPDF');
const btnGenerarSuperBrief = document.getElementById('btnGenerarSuperBrief');
const archivoInput = document.getElementById('archivo');
const nombreInput = document.getElementById('nombre');
const apiBaseInput = document.getElementById('apiBase');
const btnGuardarApi = document.getElementById('btnGuardarApi');
const btnResetApi = document.getElementById('btnResetApi');
const apiStatus = document.getElementById('apiStatus');

let superBriefGenerado = '';
let estaCargando = false;

function setApiStatus(message, type = 'info') {
  if (!apiStatus) return;
  const palette = {
    info: '#005d80',
    success: '#2d7a36',
    warning: '#b05d00',
    error: '#b31818',
  };
  apiStatus.textContent = message || '';
  apiStatus.style.color = palette[type] || palette.info;
}

function initApiConfig() {
  if (!window.validadorClient) return;
  const baseActual = window.validadorClient.getBaseUrl();
  if (apiBaseInput) apiBaseInput.value = baseActual;
  setApiStatus(`Usando: ${baseActual}`, 'info');

  if (apiBaseInput) {
    apiBaseInput.addEventListener('input', () => {
      setApiStatus('');
    });
  }

  if (btnGuardarApi) {
    btnGuardarApi.addEventListener('click', () => {
      const valor = apiBaseInput?.value || '';
      try {
        const nuevo = window.validadorClient.setBaseUrl(valor);
        setApiStatus(`URL actualizada: ${nuevo}`, 'success');
      } catch (error) {
        setApiStatus(error?.message || 'No se pudo actualizar la URL.', 'error');
      }
    });
  }

  if (btnResetApi) {
    btnResetApi.addEventListener('click', () => {
      try {
        const nuevo = window.validadorClient.resetBaseUrl();
        if (apiBaseInput) apiBaseInput.value = nuevo;
        setApiStatus(`Usando URL por defecto: ${nuevo}`, 'info');
      } catch (error) {
        setApiStatus(error?.message || 'No se pudo restablecer la URL.', 'error');
      }
    });
  }
}

initApiConfig();

function actualizarEstadoBotones() {
  if (btnDescargarPDF) {
    btnDescargarPDF.disabled = estaCargando || !superBriefGenerado;
  }
}

function setLoading(isLoading) {
  estaCargando = isLoading;
  if (loaderEl) {
    loaderEl.classList.toggle('active', isLoading);
    loaderEl.setAttribute('aria-hidden', isLoading ? 'false' : 'true');
  }

  const elementos = [
    btnCargar,
    btnDescargarPDF,
    btnGenerarSuperBrief,
    archivoInput,
    nombreInput,
    btnGuardarApi,
    btnResetApi,
  ];

  elementos.forEach((el) => {
    if (!el) return;
    if (el === btnDescargarPDF) return;
    el.disabled = isLoading;
  });

  actualizarEstadoBotones();
}

setLoading(false);
actualizarEstadoBotones();

window.cargarBrief = function () {
  const nombreEl = document.getElementById('nombre');
  const archivoEl = document.getElementById('archivo');

  const tieneNombre = nombreEl?.value.trim() !== '';
  const tieneArchivo = !!(archivoEl?.files && archivoEl.files.length > 0);

  if (tieneNombre && tieneArchivo) return true;

  alert('Debe ingresar el nombre y seleccionar un archivo');
  return false;
};

async function onCargarClick() {
  if (!cargarBrief()) return;

  const ext = detectarExtension();
  if (!ext) {
    alert('Formato no soportado. Usa PDF, DOCX o TXT.');
    return;
  }

  setLoading(true);

  try {
    const texto = await extraerTextoArchivo();
    console.log('Preview (400 chars):', texto.slice(0, 400));

    const nombre = document.getElementById('nombre').value.trim();
    const payload = { nombre, texto, extension: ext };
    const respuesta = await window.validadorClient.validarBrief(payload);

    console.log('Respuesta del validador:', respuesta);
    mostrarRespuestas(respuesta.resultado.respuestas);
  } catch (e) {
    console.error(e);
    alert(e?.message || 'No se pudo procesar el brief. Revisa la consola para más detalles.');
  } finally {
    setLoading(false);
  }
}

function mostrarRespuestas(respuestas) {
  const contenedor = document.getElementById('resultado');
  const superBriefOutput = document.getElementById('superBriefOutput');

  contenedor.innerHTML = '';
  superBriefOutput.innerHTML = '';
  superBriefGenerado = '';
  actualizarEstadoBotones();
  contenedor.style.marginTop = '2em';
  contenedor.style.maxWidth = '900px';
  contenedor.style.marginInline = 'auto';
  superBriefOutput.style.maxWidth = '900px';
  superBriefOutput.style.marginInline = 'auto';

  respuestasGlobales = respuestas.map((item) => {
    const respuestaOriginal = item.respuesta || '';
    return {
      ...item,
      respuestaOriginal,
      respuestaManual: item.requiereInput ? '' : respuestaOriginal,
    };
  });

  const fragment = document.createDocumentFragment();

  respuestasGlobales.forEach((item, i) => {
    const bloque = document.createElement('div');
    bloque.style.border = '1px solid #ddd';
    bloque.style.borderRadius = '6px';
    bloque.style.padding = '1em';
    bloque.style.marginBottom = '1.2em';
    bloque.style.background = item.requiereInput ? '#fff2d6' : '#f7f7f7';

    const titulo = document.createElement('h3');
    titulo.textContent = `${i + 1}. ${item.pregunta}`;
    titulo.style.marginTop = '0';

    const estado = document.createElement('p');
    estado.style.fontSize = '0.9em';
    estado.style.fontWeight = '600';
    estado.style.marginBottom = '0.5em';
    estado.style.color = item.requiereInput ? '#b05d00' : '#005d80';
    estado.textContent = item.requiereInput
      ? 'Falta información: completa o ajusta la respuesta.'
      : 'Revisa y edita si consideras necesario.';

    const autoLabel = document.createElement('p');
    autoLabel.style.fontSize = '0.85em';
    autoLabel.style.margin = '0 0 0.4em 0';
    autoLabel.style.color = '#555';
    autoLabel.textContent = 'Respuesta detectada automáticamente:';

    const autoTexto = document.createElement('pre');
    autoTexto.textContent = respuestasGlobales[i].respuestaOriginal || '(Sin información automática)';
    autoTexto.style.background = '#fafafa';
    autoTexto.style.padding = '0.75em';
    autoTexto.style.borderRadius = '4px';
    autoTexto.style.whiteSpace = 'pre-wrap';
    autoTexto.style.margin = '0 0 0.8em 0';

    const textarea = document.createElement('textarea');
    textarea.rows = 4;
    textarea.style.width = '100%';
    textarea.style.resize = 'vertical';
    textarea.placeholder = 'Escribe o ajusta la respuesta final que quedará en el brief.';
    textarea.value = respuestasGlobales[i].respuestaManual;

    const actualizarEstado = () => {
      const value = textarea.value;
      respuestasGlobales[i].respuestaManual = value;
      const tieneContenido = value.trim().length > 0;
      const esDiferente = value !== respuestasGlobales[i].respuestaOriginal;

      if (item.requiereInput) {
        estado.textContent = tieneContenido
          ? 'Revisión completada manualmente.'
          : 'Falta información: completa o ajusta la respuesta.';
        estado.style.color = tieneContenido ? '#2d7a36' : '#b05d00';
        bloque.style.background = tieneContenido ? '#f1fff0' : '#fff2d6';
      } else {
        estado.textContent = esDiferente
          ? 'Revisión humana aplicada.'
          : 'Respuesta sin cambios. Ajusta si es necesario.';
        estado.style.color = esDiferente ? '#2d7a36' : '#005d80';
        bloque.style.background = esDiferente ? '#f1fff0' : '#f7f7f7';
      }
    };

    textarea.addEventListener('input', actualizarEstado);

    actualizarEstado();

    bloque.appendChild(titulo);
    bloque.appendChild(estado);
    bloque.appendChild(autoLabel);
    bloque.appendChild(autoTexto);
    bloque.appendChild(textarea);

    fragment.appendChild(bloque);
  });

  contenedor.appendChild(fragment);
}

document.getElementById('btnCargar').addEventListener('click', onCargarClick);

function obtenerRespuestaFinal(item) {
  const manual = item.respuestaManual && item.respuestaManual.trim();
  const automatica = item.respuesta && item.respuesta.trim();
  return manual || automatica || '(No se registró respuesta)';
}

function generarDocumentoPDF(auto = false) {
  if (!window.jspdf?.jsPDF) {
    if (!auto) {
      alert('No se encontró jsPDF en la página. Verifica la conexión.');
    }
    return;
  }

  if (!respuestasGlobales.length) {
    if (!auto) {
      alert('Primero debes cargar un brief y analizarlo.');
    }
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const nombreBrief = document.getElementById('nombre').value.trim();
  const fecha = new Date().toLocaleDateString();

  const marginX = 18;
  const marginY = 20;
  const lineHeight = 6;
  const maxLineWidth = doc.internal.pageSize.getWidth() - marginX * 2;

  let y = marginY;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(nombreBrief ? `Brief: ${nombreBrief}` : 'Brief validado', marginX, y);

  y += lineHeight + 2;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Fecha: ${fecha}`, marginX, y);
  y += lineHeight;

  respuestasGlobales.forEach((item, i) => {
    if (y > doc.internal.pageSize.getHeight() - marginY - 30) {
      doc.addPage();
      y = marginY;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);

    const preguntaTexto = `${i + 1}. ${item.pregunta}`;
    const preguntaLineas = doc.splitTextToSize(preguntaTexto, maxLineWidth);
    doc.text(preguntaLineas, marginX, y);
    y += preguntaLineas.length * lineHeight;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);

    const finalRespuesta = obtenerRespuestaFinal(item);
    const splitRespuesta = doc.splitTextToSize(finalRespuesta, maxLineWidth);

    splitRespuesta.forEach((linea) => {
      if (y > doc.internal.pageSize.getHeight() - marginY - 10) {
        doc.addPage();
        y = marginY;
      }
      doc.text(linea, marginX, y);
      y += lineHeight;
    });

    y += lineHeight * 0.75;
  });

  if (superBriefGenerado) {
    if (y > doc.internal.pageSize.getHeight() - marginY - 30) {
      doc.addPage();
      y = marginY;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Super Brief', marginX, y);
    y += lineHeight + 2;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);

    const superBriefLineas = doc.splitTextToSize(superBriefGenerado, maxLineWidth);
    superBriefLineas.forEach((linea) => {
      if (y > doc.internal.pageSize.getHeight() - marginY - 10) {
        doc.addPage();
        y = marginY;
      }
      doc.text(linea, marginX, y);
      y += lineHeight;
    });
  }

  doc.save('brief_validado.pdf');
}

// PDF descarga
document.getElementById('btnDescargarPDF').addEventListener('click', () => {
  if (!superBriefGenerado) {
    alert('Genera primero el Super Brief para descargar el PDF final.');
    return;
  }
  generarDocumentoPDF(false);
});

async function generarSuperBrief() {
  if (!respuestasGlobales.length) {
    alert('Primero debes cargar un brief y analizarlo.');
    return;
  }

  const seccion = document.getElementById('superBriefOutput');
  seccion.innerHTML = '';

  const pendientes = respuestasGlobales.filter(
    (item) => item.requiereInput && !item.respuestaManual,
  );

  if (pendientes.length) {
    const alerta = document.createElement('p');
    alerta.style.color = '#b05d00';
    alerta.style.fontWeight = '600';
    alerta.textContent = `Faltan ${pendientes.length} respuestas manuales. Puedes generar el Super Brief, pero revisa estos campos.`;
    seccion.appendChild(alerta);
  }

  const finalRespuestas = respuestasGlobales.map((item) => ({
    pregunta: item.pregunta,
    respuesta: obtenerRespuestaFinal(item),
  }));

  const fallbackTexto = finalRespuestas.map((item, index) => (
    `${index + 1}. ${item.pregunta}\n${item.respuesta}\n`
  )).join('\n');

  setLoading(true);

  try {
    const nombreBrief = nombreInput?.value.trim() || '';
    const payload = { nombre: nombreBrief, respuestas: finalRespuestas };
    const respuesta = await window.validadorClient.generarSuperBrief(payload);
    const { resultado } = respuesta || {};

    const titulo = document.createElement('h2');
    titulo.textContent = 'Super Brief';
    titulo.style.marginBottom = '0.5em';

    const textarea = document.createElement('textarea');
    textarea.style.width = '100%';
    textarea.style.minHeight = '220px';
    textarea.style.resize = 'vertical';
    textarea.readOnly = true;
    textarea.value = (resultado?.superBrief || fallbackTexto || '').trim();

    seccion.appendChild(titulo);
    seccion.appendChild(textarea);

    if (resultado?.mensaje) {
      const aviso = document.createElement('p');
      aviso.style.marginTop = '0.5em';
      aviso.style.fontSize = '0.9em';
      aviso.style.color = '#555';
      aviso.textContent = resultado.mensaje;
      seccion.appendChild(aviso);
    }

    if (!(textarea.value)) {
      const vacio = document.createElement('p');
      vacio.textContent = 'Aún no hay contenido para el Super Brief.';
      seccion.appendChild(vacio);
    }

    superBriefGenerado = textarea.value.trim();
    actualizarEstadoBotones();

    if (superBriefGenerado) {
      generarDocumentoPDF(true);
    }
  } catch (error) {
    console.error('Error generando Super Brief:', error);
    alert(error?.message || 'No se pudo generar el Super Brief. Intenta nuevamente.');

    const titulo = document.createElement('h2');
    titulo.textContent = 'Super Brief (generado localmente)';
    titulo.style.marginBottom = '0.5em';

    const textarea = document.createElement('textarea');
    textarea.style.width = '100%';
    textarea.style.minHeight = '220px';
    textarea.style.resize = 'vertical';
    textarea.readOnly = true;
    textarea.value = fallbackTexto.trim();

    seccion.appendChild(titulo);
    seccion.appendChild(textarea);

    if (!textarea.value) {
      const vacio = document.createElement('p');
      vacio.textContent = 'Aún no hay contenido para el Super Brief.';
      seccion.appendChild(vacio);
    }

    superBriefGenerado = textarea.value.trim();
    actualizarEstadoBotones();

    if (superBriefGenerado) {
      generarDocumentoPDF(true);
    }
  } finally {
    setLoading(false);
  }
}

document.getElementById('btnGenerarSuperBrief').addEventListener('click', generarSuperBrief);
