// carga.js
let respuestasGlobales = []; // Se guarda para exportar luego

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
    alert('No se pudo extraer el texto. Revisa la consola.');
  }
}

function mostrarRespuestas(respuestas) {
  respuestasGlobales = respuestas;

  const contenedor = document.createElement('div');
  contenedor.style.marginTop = '2em';
  contenedor.style.maxWidth = '800px';

  respuestas.forEach(({ pregunta, respuesta }, i) => {
    const bloque = document.createElement('div');
    bloque.innerHTML = `
      <h3>${i + 1}. ${pregunta}</h3>
      <p>${respuesta || '<em>(No se encontró una respuesta clara)</em>'}</p>
      <hr>
    `;
    contenedor.appendChild(bloque);
  });

  document.body.appendChild(contenedor);
}

document.getElementById('btnCargar').addEventListener('click', onCargarClick);

// PDF descarga
document.getElementById('btnDescargarPDF').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const nombreBrief = document.getElementById('nombre').value.trim();
  const fecha = new Date().toLocaleDateString();

  let y = 20;
  doc.setFontSize(16);
  doc.text(`Brief: ${nombreBrief}`, 10, y);
  y += 10;
  doc.setFontSize(12);
  doc.text(`Fecha: ${fecha}`, 10, y);
  y += 10;

  respuestasGlobales.forEach(({ pregunta, respuesta }, i) => {
    if (y > 270) { doc.addPage(); y = 20; } // Salto de página
    doc.setFont(undefined, 'bold');
    doc.text(`${i + 1}. ${pregunta}`, 10, y);
    y += 8;
    doc.setFont(undefined, 'normal');

    const splitRespuesta = doc.splitTextToSize(respuesta || "(No se encontró una respuesta clara)", 180);
    doc.text(splitRespuesta, 10, y);
    y += splitRespuesta.length * 7 + 5;
  });

  doc.save('brief_validado.pdf');
});

// DOCX descarga
document.getElementById('btnDescargarPDF').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: [216, 279] }); // Letter

  const nombreBrief = document.getElementById('nombre').value.trim();
  const fecha = new Date().toLocaleDateString();

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - 2 * margin;
  let y = margin;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`Brief: ${nombreBrief}`, margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Fecha: ${fecha}`, margin, y);
  y += 10;

  respuestasGlobales.forEach(({ pregunta, respuesta }, i) => {
    if (y > pageHeight - margin - 30) {
      doc.addPage();
      y = margin;
    }

    // Pregunta con salto de línea si es larga
    doc.setFont(undefined, 'bold');
    const preguntaTexto = `${i + 1}. ${pregunta}`;
    const preguntaPartes = doc.splitTextToSize(preguntaTexto, maxWidth);
    doc.text(preguntaPartes, margin, y);
    y += preguntaPartes.length * 7;

    // Respuesta
    doc.setFont(undefined, 'normal');
    const respuestaTexto = respuesta || "(No se encontró una respuesta clara)";
    const respuestaPartes = doc.splitTextToSize(respuestaTexto, maxWidth);
    if (y + respuestaPartes.length * 7 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(respuestaPartes, margin, y);
    y += respuestaPartes.length * 7 + 8;
  });

  doc.save('brief_validado.pdf');
});
