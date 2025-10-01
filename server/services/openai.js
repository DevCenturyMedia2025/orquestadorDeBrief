import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
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

function dividirTexto(texto, maxLen = 1500) {
  const partes = [];
  for (let i = 0; i < texto.length; i += maxLen) {
    partes.push(texto.slice(i, i + maxLen));
  }
  return partes;
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

  const fragmentos = dividirTexto(texto);
  const respuestas = [];

  for (const pregunta of PREGUNTAS_BRIEF) {
    let mejorRespuesta = null;
    let mejorScore = -1;

    for (const fragmento of fragmentos) {
      const chatPrompt = [
        { role: 'system', content: 'Eres un analista que responde preguntas de brief solo usando el texto proporcionado. Responde de forma clara y breve.' },
        { role: 'user', content: `Pregunta: ${pregunta}\n\nTexto de referencia:\n${fragmento}` },
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

    respuestas.push({ pregunta, respuesta: mejorRespuesta });
  }

  return {
    nombre,
    extension,
    respuestas,
  };
}
