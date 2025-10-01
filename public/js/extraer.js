// /js/extraer.js
(() => {
  const clean = s => (s || '')
    .replace(/\u00A0/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const readAsArrayBuffer = f => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsArrayBuffer(f);
  });
  const readAsText = f => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsText(f, 'utf-8');
  });

  // Detecta extensión válida
  window.detectarExtension = function () {
    const input = document.getElementById('archivo');
    if (!input?.files?.length) return false;
    const name = input.files[0].name;
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
    return ['.pdf', '.docx', '.txt'].includes(ext) ? ext : false; // .doc NO en browser
  };

  async function extraerPDF(file) {
    if (!window.pdfjsLib) throw new Error('pdfjsLib no cargado');
    const ab = await readAsArrayBuffer(file);
    const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
    let out = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      out += tc.items.map(it => it.str).join(' ') + '\n\n';
    }
    return clean(out);
  }

  async function extraerDOCX(file) {
    if (!window.mammoth) throw new Error('mammoth no cargado');
    const ab = await readAsArrayBuffer(file);
    const { value } = await window.mammoth.extractRawText({ arrayBuffer: ab });
    return clean(value);
  }

  async function extraerTXT(file) { return clean(await readAsText(file)); }

  // API pública para tu carga.js
  window.extraerTextoArchivo = async function () {
    const input = document.getElementById('archivo');
    const file = input.files[0];
    const ext = window.detectarExtension();
    if (!ext) throw new Error('Formato no soportado. Usa PDF, DOCX o TXT.');
    if (ext === '.pdf')  return await extraerPDF(file);
    if (ext === '.docx') return await extraerDOCX(file);
    if (ext === '.txt')  return await extraerTXT(file);
  };
})();
