// carga.js (arriba del archivo)
window.cargarBrief = function () {
  const nombreEl  = document.getElementById('nombre');
  const archivoEl = document.getElementById('archivo');

  const tieneNombre  = nombreEl?.value.trim() !== '';
  const tieneArchivo = !!(archivoEl?.files && archivoEl.files.length > 0);

  if (tieneNombre && tieneArchivo) return true;
  alert('Debe ingresar el nombre y seleccionar un archivo');
  return false;
};

async function onCargarClick() {
  if (!cargarBrief()) return;

  const ext = detectarExtension();
  if (!ext) { alert('Formato no soportado. Usa PDF, DOCX o TXT.'); return; }

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
