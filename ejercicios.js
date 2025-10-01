/**
 * JS Básico — Hoja de ejercicios (Node)
 *
 * Cómo usar:
 * 1) Ejecuta este archivo con:  node ejercicios.js
 * 2) Completa cada función marcada con TODO.
 * 3) El "runner" al final te mostrará PASS / FAIL / SKIP.
 *
 * Reglas:
 * - No uses librerías externas.
 * - Puedes usar if/else, operador ternario (cond ? a : b), bucles, y métodos de array (map/filter/reduce...).
 * - Escribe código claro y con comentarios breves.
 */

// -----------------------------------------------------------------------------
// Utilidades del runner (no modificar)
// -----------------------------------------------------------------------------
let PASS = 0, FAIL = 0, SKIP = 0, TOTAL = 0;

function isObject(x) { return x !== null && typeof x === 'object'; }
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (isObject(a) && isObject(b)) {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (!deepEqual(a[k], b[k])) return false;
    return true;
  }
  return false;
}
function test(name, fn, expected) {
  TOTAL++;
  let got;
  try { got = fn(); }
  catch (e) {
    FAIL++;
    console.log(`❌  ${name}: lanzó error →`, e.message);
    return;
  }
  if (typeof got === 'undefined') {
    SKIP++;
    console.log(`⏭️  ${name}: SKIP (devuelve undefined, completa la función)`);
    return;
  }
  const ok = (isObject(expected) || Array.isArray(expected)) ? deepEqual(got, expected) : Object.is(got, expected);
  if (ok) {
    PASS++;
    console.log(`✅  ${name}`);
  } else {
    FAIL++;
    console.log(`❌  ${name}: esperado=${JSON.stringify(expected)} recibido=${JSON.stringify(got)}`);
  }
}
function summary() {
  console.log('\n— Resumen —');
  console.log(`Total: ${TOTAL} | PASS: ${PASS} | FAIL: ${FAIL} | SKIP: ${SKIP}`);
}

// -----------------------------------------------------------------------------
// Nivel 1 — Variables, tipos y operadores
// -----------------------------------------------------------------------------

/** 1) suma(a, b): retorna la suma de a y b */
function suma(a, b) {
  operacion = a + b;
  return operacion;
}

/** 2) resta(a, b): retorna a - b */
function resta(a, b) {
  operacion = a - b;
  return operacion;
  
}

/** 3) areaRect(w, h): área de un rectángulo (w * h) */
function areaRect(w, h) {
  operacion = w * h;
  return operacion;
  
}

/** 4) esPar(n): true si n es par, false si no (usa % y ===) */
function esPar(n) {
  operacion = n % 2 === 0;
  return operacion;
}

/** 5) max(a, b): mayor entre a y b (puedes usar ternario) */
function max(a, b) {
  operacion = a >= b ? a : b;
  return operacion;
}

/** 6) precioConDescuento(precio, pct): aplica descuento pct (0..100) */
function precioConDescuento(precio, pct) {
  operacion = precio * (pct/100);
  result = precio - operacion;

  return result;
}

/** 7) saludo(nombre): "Hola, <nombre>!"; si nombre es null/undefined, usa "Mundo" */
function saludo(nombre) {
  operacion =  nombre  ?? "Mundo";
  return "Hola, " + operacion + "!";

}

/** 8) toNumber(x): convierte x a número; si no es convertible, devuelve NaN */
function toNumber(x) {
  // TODO: Number(x)
  operacion = Number(x) ?? NaN;
  return operacion;
}

/** 9) truthy(x): devuelve 'truthy' o 'falsy' según la coerción booleana de x */
function truthy(x) {
  // Pista: Boolean(x) ? 'truthy' : 'falsy'
  operacion = Boolean(x) ? "truthy" : "falsy";
  return operacion;
}

/** 10) clamp(n, min, max): limita n al rango [min, max] */
function clamp(n, min, max) {
  operacion = n > max ? max : n < min ? min : n; 
  // si n > max, devuelve max si no, si n < min, devuelve min si no, si no, devuelve n
  return operacion;
}

// -----------------------------------------------------------------------------
// Nivel 2 — Condicionales y operador ternario
// -----------------------------------------------------------------------------

/** 11) mayorDeEdad(edad): 'Permitido' si edad >= 18, si no 'Denegado' */
function mayorDeEdad(edad) {
  operacion = edad >= 18 ? "Permitido" : "Denegado";
  return operacion;
  
}

/** 12) signo(n): 'positivo' | 'negativo' | 'cero' (puedes usar if/else o ternarios con paréntesis) */
function signo(n) {
  operacion = n > 0 ? "positivo" : n < 0 ? "negativo" : "cero";
  return operacion;
  
}

/** 13) mensajeStock(stock): 'Disponible' si stock > 0, si no 'Agotado' */
function mensajeStock(stock) {
  // TODO: ternario simple
  operacion = stock <= 0 ? "Agotado" : "Disponible";
  return operacion;

  
}

/** 14) pluralizar(palabra, cantidad): '1 gato' o '2 gatos' */
function pluralizar(palabra, cantidad) {
  operacion = cantidad === 1 ? palabra : palabra + "s";
  return cantidad + " " + operacion;
}

/** 15) safeDivide(a, b): a/b; si b===0 devuelve null (evita división por cero) */
function safeDivide(a, b) {
  operacion = b !== 0 ? a / b : null;

  return operacion;
}

/** 16) calificar(nota 0..100): 'A'(>=90) 'B'(>=80) 'C'(>=70) 'D'(>=60) 'F' */
function calificar(nota) {
  operacion = nota < 60 ? "F" : nota < 70 ? "D" : nota < 80 ? "C" : nota < 90 ? "B" : "A";
  return operacion;
}

// -----------------------------------------------------------------------------
// Nivel 3 — Arrays y bucles
// -----------------------------------------------------------------------------

/** 17) sumaArray(arr): suma todos los números del array */
function sumaArray(arr) {
  // TODO: reduce o bucle for
  return undefined;
}

/** 18) maxArray(arr): máximo del array (asume al menos un elemento) */
function maxArray(arr) {
  // TODO
  return undefined;
}

/** 19) filtrarPares(arr): devuelve solo los pares */
function filtrarPares(arr) {
  // TODO: filter con esPar
  return undefined;
}

/** 20) mapDobles(arr): devuelve un array con cada elemento * 2 */
function mapDobles(arr) {
  // TODO: map
  return undefined;
}

/** 21) existe(arr, valor): true si valor existe (===) en arr */
function existe(arr, valor) {
  // TODO: some o includes
  return undefined;
}

/** 22) contarApariciones(arr, valor): cuántas veces aparece valor */
function contarApariciones(arr, valor) {
  // TODO: reduce o bucle
  return undefined;
}

/** 23) invertir(arr): devuelve un nuevo array invertido (sin mutar el original) */
function invertir(arr) {
  // TODO: copia + reverse, o bucle
  return undefined;
}

/** 24) sinDuplicados(arr): elimina duplicados, preserva orden de primera aparición */
function sinDuplicados(arr) {
  // TODO: usa Set o un acumulador con includes
  return undefined;
}

// -----------------------------------------------------------------------------
// Nivel 4 — Strings y objetos
// -----------------------------------------------------------------------------

/** 25) capitalizar(palabra): 'gato' -> 'Gato' */
function capitalizar(palabra) {
  // Pista: palabra[0].toUpperCase() + palabra.slice(1)
  return undefined;
}

/** 26) contarVocales(str): número de vocales (a,e,i,o,u) minúsculas o mayúsculas */
function contarVocales(str) {
  // TODO
  return undefined;
}

/** 27) esPalindromo(str): true si se lee igual al revés (ignora espacios y mayúsculas) */
function esPalindromo(str) {
  // TODO: normaliza con toLowerCase y elimina espacios
  return undefined;
}

/** 28) pick(obj, keys[]): devuelve nuevo objeto con solo esas keys si existen */
function pick(obj, keys) {
  // TODO
  return undefined;
}

/** 29) mergePreferencias(defaults, user): combina objetos; user sobrescribe defaults */
function mergePreferencias(defaults, user) {
  // TODO: operador spread {...defaults, ...user}
  return undefined;
}

/** 30) formatearPrecio(n): devuelve string con 2 decimales, ej. 3.5 -> '3.50' */
function formatearPrecio(n) {
  // TODO: toFixed(2)
  return undefined;
}

// -----------------------------------------------------------------------------
// PRUEBAS — No edites debajo de esta línea
// -----------------------------------------------------------------------------

// Nivel 1
test('suma', () => suma(2, 3), 5);
test('resta', () => resta(10, 7), 3);
test('areaRect', () => areaRect(4, 5), 20);
test('esPar true', () => esPar(8), true);
test('esPar false', () => esPar(9), false);
test('max (a>b)', () => max(10, 7), 10);
test('max (b>a)', () => max(3, 9), 9);
test('precioConDescuento', () => precioConDescuento(100, 20), 80);
test('saludo con nombre', () => saludo('Ana'), 'Hola, Ana!');
test('saludo default', () => saludo(undefined), 'Hola, Mundo!');
test('toNumber ok', () => Number.isNaN(toNumber('abc')), true);
test('toNumber num', () => toNumber('42'), 42);
test('truthy de string', () => truthy('hola'), 'truthy');
test('truthy de 0', () => truthy(0), 'falsy');
test('clamp dentro', () => clamp(7, 0, 10), 7);
test('clamp bajo', () => clamp(-5, 0, 10), 0);
test('clamp alto', () => clamp(50, 0, 10), 10);

// Nivel 2
test('mayorDeEdad 18', () => mayorDeEdad(18), 'Permitido');
test('mayorDeEdad 15', () => mayorDeEdad(15), 'Denegado');
test('signo positivo', () => signo(3), 'positivo');
test('signo cero', () => signo(0), 'cero');
test('signo negativo', () => signo(-1), 'negativo');
test('mensajeStock', () => mensajeStock(0), 'Agotado');
test('pluralizar 1', () => pluralizar('gato', 1), '1 gato');
test('pluralizar 3', () => pluralizar('gato', 3), '3 gatos');
test('safeDivide ok', () => safeDivide(10, 2), 5);
test('safeDivide zero', () => safeDivide(5, 0), null);
test('calificar A', () => calificar(95), 'A');
test('calificar C', () => calificar(72), 'C');
test('calificar F', () => calificar(10), 'F');

// Nivel 3
const arr = [1, 2, 2, 3, 4];
test('sumaArray', () => sumaArray(arr), 12);
test('maxArray', () => maxArray(arr), 4);
test('filtrarPares', () => filtrarPares(arr), [2, 2, 4]);
test('mapDobles', () => mapDobles([1, 3]), [2, 6]);
test('existe true', () => existe(arr, 3), true);
test('existe false', () => existe(arr, 99), false);
test('contarApariciones', () => contarApariciones(arr, 2), 2);
test('invertir', () => invertir([1, 2, 3]), [3, 2, 1]);
test('sinDuplicados', () => sinDuplicados([1, 2, 2, 3, 1, 4]), [1, 2, 3, 4]);

// Nivel 4
test('capitalizar', () => capitalizar('gato'), 'Gato');
test('contarVocales', () => contarVocales('Desarrollador'), 6);
test('esPalindromo true', () => esPalindromo('Anita lava la tina'), true);
test('esPalindromo false', () => esPalindromo('Hola mundo'), false);
test('pick', () => pick({ a: 1, b: 2, c: 3 }, ['a', 'c']), { a: 1, c: 3 });
test('mergePreferencias', () => mergePreferencias({ theme: 'light', lang: 'es' }, { lang: 'en' }), { theme: 'light', lang: 'en' });
test('formatearPrecio', () => formatearPrecio(3.5), '3.50');

summary();
