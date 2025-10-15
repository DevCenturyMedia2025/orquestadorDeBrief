import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const MAX_FRAGMENTOS = Number(process.env.BRIEF_MAX_FRAGMENTOS || 12);
const OPENAI_CONCURRENCY = Math.max(
  1,
  Number.isFinite(Number(process.env.OPENAI_CONCURRENCY))
    ? Number(process.env.OPENAI_CONCURRENCY)
    : 4,
);

let client = null;

if (apiKey) {
  client = new OpenAI({ apiKey });
}

// Lista de preguntas del brief maestro
const PREGUNTAS_BRIEF = [
  '¿Qué problema tiene? ¿Qué necesidad tiene? ¿Qué le está pasando? ¿Por qué cree que le pasa?',
  '¿Qué espera que yo haga por usted? ¿Por qué considera que le puedo ayudar?',
  '¿Cuál es su objetivo? ¿Qué resultado espera? ¿Qué quiere lograr con este caso?',
  'DESCRIPCIÓN DE LA MARCA/PRODUCTO/ SERVICIO. ¿Dónde lo venden, cuánto cuesta, hace cuánto lo está vendiendo, cuénteme toda la historia, cómo funciona y por qué es diferente?',
  'Describa su marca, por qué la gente se la compra, por qué la prefieren, qué puntos fuertes tiene, qué valores tiene su marca, por favor compártame el manual de la marca si lo tiene.',
  '¿Cómo va a medir que nosotros hacemos un buen trabajo? Puntualizar objetivos: ventas, posicionamiento, rentabilidad. Hacer pacto de ROI, conciliar KPI, meta, objetivo, tiempo, TOM, TOP, cuota de mercado, etc.',
  '¿Qué han hecho en el pasado, cómo lo han hecho, con quién lo han hecho, cuánto han invertido, cómo han sido los resultados numéricos? Por favor sea lo más numérico y puntual posible.',
  '¿Con qué dificultades se ha encontrado para cumplir el objetivo?',
  '¿Dónde quiere que trabajemos? ¿Cuál es el alcance? ¿Qué territorio quiere abarcar?',
  '¿Quién es su cliente habitual y cuál es el cliente que quiere tener? ¿Qué le dicen los comerciales del cliente? ¿Cómo es su cliente, cómo piensa, cómo siente, qué características demográficas tiene?',
  'Por favor compártame todos los estudios de mercadeo, datos, informes, reportes y demás que nos pueda dar sobre su comunicación sobre su mercadeo, sobre su comercialización, sobre su cliente y sobre su mercado. Todo es valioso porque lo analizamos en detalle.',
  '¿Cuáles son sus tres principales competidores? ¿Contra quién se compara? ¿Cómo quién le gustaría ser? ¿Por qué eso es así?',
  '¿Qué prácticas de mercadeo admira?',
  '¿Cuáles son los tiempos que debo tener en cuenta? ¿Cuándo necesita mi respuesta? ¿Cuándo tomará una decisión? ¿Cuándo iniciaría el trabajo? ¿Por cuánto tiempo quiere trabajar?',
  '¿Cómo es el proceso de análisis y selección de nuestra propuesta? ¿Quién interviene? ¿Cómo son los tomadores de decisión? ¿En qué se enfocan, qué prefieren, qué desprecian, etc?',
  '¿Tiene agencia? ¿Tiene in house? ¿Cómo es su área de mercadeo y comunicaciones? ¿Nosotros vamos a trabajar todo o vamos a trabajar con agencias que ya tiene? ¿Van a entregarnos una estrategia, un plan de mercadeo, un concepto, unas piezas? ¿Cuéntenos en detalle con qué cuenta actualmente, formatos, piezas, bases de datos, duraciones, extensiones, etc.?',
  'Teniendo en cuenta su experiencia, ¿qué nos recomienda, qué le gustaría ver en nuestra propuesta?',
  '¿Con cuánto presupuesto cuenta para esta propuesta? Si no lo han definido por favor denos un margen para no tardar más de lo necesario en planeación, aprobaciones y ajustes. ¿El presupuesto tiene IVA, debemos tener en cuenta otro impuesto? ¿Qué acuerdos o negociaciones tiene con qué medios o aliados o proveedores que tengamos que tener en cuenta para su beneficio?',
  'Cuéntenos si hay información adicional que le parezca que debamos conocer. Legal, consejos, recomendaciones, sugerencias, prohibiciones, etc.',
  'LECTURA PERSONAL DE QUIEN DILIGENCIA EL REQUERIMIENTO. Entregue toda la información que considere que la agencia deba saber para abordar este caso: características personales sobre quien entregó la información, sobre la empresa, sobre su poder, sobre su complejidad, sobre su apertura mental y emocional sobre nosotros, etc.',
];

const PATRONES_SIN_INFO = [
  /no se menciona/i,
  /no se proporciona/i,
  /no se especifica/i,
  /no contiene información/i,
  /no hay información/i,
  /no se cuenta con información/i,
  /no encontr[eó] datos?/i,
  /información insuficiente/i,
  /no dispongo de información/i,
  /no existe información disponible/i,
  /no se detalla/i,
];

function dividirTexto(texto, maxLen = 1500) {
  const partes = [];
  for (let i = 0; i < texto.length; i += maxLen) {
    partes.push(texto.slice(i, i + maxLen));
  }
  return partes;
}

async function responderPregunta(pregunta, fragmentos) {
  let mejorRespuesta = null;
  let mejorScore = -1;

  for (const fragmento of fragmentos) {
    const chatPrompt = [
      {
        role: 'system',
        content: `Eres un analista experto en briefs publicitarios. 
Analizarás el texto que se te da como referencia para responder preguntas clave. 
Si no encuentras información suficiente para alguna, indícalo claramente con una sugerencia específica.`,
      },
      {
        role: 'user',
        content: `Pregunta: ${pregunta}\n\nTexto de referencia:\n${fragmento}`,
      },
    ];

    try {
      const res = await client.chat.completions.create({
        model,
        messages: chatPrompt,
        temperature: 0.2,
        max_tokens: 300,
      });

      const content = res.choices?.[0]?.message?.content?.trim();
      if (content && content.length > mejorScore) {
        mejorRespuesta = content;
        mejorScore = content.length;
      }
    } catch (error) {
      console.error('Error al consultar OpenAI:', error);
      continue;
    }
  }

  const sinRespuesta = !mejorRespuesta ||
    PATRONES_SIN_INFO.some((regex) => regex.test(mejorRespuesta));

  return {
    pregunta,
    respuesta: mejorRespuesta || 'No se encontró información en el brief para esta pregunta.',
    sinRespuesta,
    requiereInput: sinRespuesta,
  };
}

async function procesarPreguntas(fragmentos) {
  const totalPreguntas = PREGUNTAS_BRIEF.length;
  const respuestas = new Array(totalPreguntas);
  let indice = 0;

  const trabajadores = Array.from(
    { length: Math.min(OPENAI_CONCURRENCY, totalPreguntas) },
    () => (async () => {
      while (true) {
        let posicionActual;
        if (indice >= totalPreguntas) break;
        posicionActual = indice;
        indice += 1;

        const pregunta = PREGUNTAS_BRIEF[posicionActual];
        respuestas[posicionActual] = await responderPregunta(pregunta, fragmentos);
      }
    })(),
  );

  await Promise.all(trabajadores);
  return respuestas;
}

export async function validarBrief({ nombre, texto, extension }) {
  if (!client) {
    return {
      origen: 'mock',
      mensaje: 'Configura OPENAI_API_KEY para respuestas reales.',
      nombre,
      extension,
      resumen: texto.slice(0, 500),
    };
  }

  const fragmentos = dividirTexto(texto).slice(0, MAX_FRAGMENTOS);
  const respuestas = await procesarPreguntas(fragmentos);

  return {
    nombre,
    extension,
    respuestas,
  };
}

function construirTextoResumen(nombre, respuestas) {
  const encabezado = nombre ? `Brief: ${nombre}\n\n` : '';
  const cuerpo = respuestas.map((item, index) => {
    const pregunta = item.pregunta || `Pregunta ${index + 1}`;
    const respuesta = item.respuesta || 'No se proporcionó respuesta.';
    return `${index + 1}. ${pregunta}\n${respuesta}`;
  }).join('\n\n');

  return `${encabezado}${cuerpo}`.trim();
}

export async function generarSuperBrief({ nombre, respuestas }) {
  if (!Array.isArray(respuestas) || !respuestas.length) {
    throw new Error('Se requieren respuestas para generar el Super Brief');
  }

  const textoBase = construirTextoResumen(nombre, respuestas);

  if (!client) {
    return {
      origen: 'mock',
      mensaje: 'Configura OPENAI_API_KEY para generar un Super Brief enriquecido.',
      superBrief: textoBase,
    };
  }

  const prompt = [
    {
      role: 'system',
      content: `Eres un estratega senior de marketing. 
Sintetiza la información del brief en un documento claro y accionable. 
Organiza en secciones: Resumen Ejecutivo, Objetivos, Público Objetivo, Propuesta de Valor, Competidores, Presupuesto / KPIs, Recomendaciones. 
Si falta información en alguna sección, menciona explícitamente lo que falta y qué debes preguntar.`,
    },
    {
      role: 'user',
      content: `Nombre del brief: ${nombre || 'Sin nombre'}\n\nRespuestas clave:\n${textoBase}`,
    },
  ];

  try {
    const res = await client.chat.completions.create({
      model,
      messages: prompt,
      temperature: 0.3,
      max_tokens: 600,
    });

    const superBrief = res.choices?.[0]?.message?.content?.trim();

    if (!superBrief) {
      throw new Error('No se pudo generar el Super Brief');
    }

    return {
      origen: 'openai',
      superBrief,
    };
  } catch (error) {
    console.error('Error al generar Super Brief con OpenAI:', error);
    throw new Error('No se pudo generar el Super Brief. Intenta nuevamente.');
  }
}
