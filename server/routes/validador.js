import { Router } from 'express';
import { validarBrief } from '../services/openai.js';

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

export default router;
