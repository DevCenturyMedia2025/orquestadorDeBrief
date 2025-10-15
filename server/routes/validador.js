import { Router } from 'express';
import { validarBrief, generarSuperBrief } from '../services/openai.js';

const router = Router();

router.post('/', async (req, res) => {
  const { nombre, texto, extension } = req.body || {};

  if (!nombre || !texto) {
    return res.status(400).json({ error: 'nombre y texto son obligatorios' });
  }

  try {
    const resultado = await validarBrief({ nombre, texto, extension });
    res.json({ ok: true, resultado });
  } catch (error) {
    console.error('Error en /api/validador:', error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
});

router.post('/super-brief', async (req, res) => {
  const { nombre, respuestas } = req.body || {};

  if (!Array.isArray(respuestas) || !respuestas.length) {
    return res.status(400).json({ error: 'Debe enviar al menos una respuesta para generar el Super Brief' });
  }

  try {
    const resultado = await generarSuperBrief({ nombre, respuestas });
    res.json({ ok: true, resultado });
  } catch (error) {
    console.error('Error en /api/validador/super-brief:', error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
});

export default router;
