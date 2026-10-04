const sql = require("mssql");

/**
 * Convierte un parámetro entero opcional en un número seguro.
 *
 * @param {*} valor Valor recibido
 * @param {string} nombre Nombre del parámetro.
 * @param {{min?: number, max?: number}} opciones Límites opcionales.
 * @returns {number|null} Entero validado o null cuando está vacío.
 * @throws {Error} Cuando el valor no es entero o está fuera de rango.
 */
const leerEnteroOpcional = (valor, nombre, opciones = {}) => {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    return null;
  }

  const texto = String(valor).trim();

  if (!/^\d+$/.test(texto)) {
    const error = new Error(`${nombre} debe ser un número entero válido.`);

    error.statusCode = 400;

    throw error;
  }

  const numero = Number(texto);

  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } =
    opciones;

  if (!Number.isSafeInteger(numero) || numero < min || numero > max) {
    const error = new Error(`${nombre} está fuera del rango permitido.`);

    error.statusCode = 400;

    throw error;
  }

  return numero;
};

/**
 * Convierte un parámetro numérico opcional en un número.
 *
 * @param {*} valor Valor recibido.
 * @param {string} nombre Nombre del parámetro.
 * @param {{min?: number, max?: number}} opciones Límites opcionales.
 * @returns {number|null} Número validado o null cuando está vacío.
 * @throws {Error} Cuando el valor no es numérico o está fuera de rango.
 */
const leerNumeroOpcional = (valor, nombre, opciones = {}) => {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    return null;
  }

  const numero = Number(String(valor).trim().replace(",", "."));

  const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } =
    opciones;

  if (!Number.isFinite(numero) || numero < min || numero > max) {
    const error = new Error(
      `${nombre} debe ser un número válido dentro del rango permitido.`,
    );

    error.statusCode = 400;

    throw error;
  }

  return numero;
};

/**
 * Abre una conexión con la base de datos.
 *
 * @returns {Promise<import('mssql').ConnectionPool>}
 */
const conectarBaseDatos = async () => {
  try {
    return await sql.connect(process.env.DB_CONFIG);
  } catch (error) {
    error.envIncorrecto = true;
    throw error;
  }
};

/**
 * Envía una respuesta HTTP de error.
 *
 * @param {import('express').Response} res
 * @param {Error} err
 * @returns {void}
 */
const manejarError = (res, err) => {
  const procedimientoNoEncontrado =
    err.number === 2812 || err.originalError?.info?.number === 2812;

  const tablaNoEncontrada =
    err.number === 208 || err.originalError?.info?.number === 208;

  const baseDeDatosInaccesible =
    err.number === 4060 || err.originalError?.info?.number === 4060;

  const esErrorCriticoBD =
    Boolean(err.envIncorrecto) ||
    procedimientoNoEncontrado ||
    tablaNoEncontrada ||
    baseDeDatosInaccesible;

  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode < 600
      ? err.statusCode
      : 500;

  res.status(statusCode).json({
    errorMsg: err.message || "Ocurrió un error inesperado.",

    esErrorCriticoBD,
  });
};

module.exports = {
  sql,
  conectarBaseDatos,
  manejarError,
  leerEnteroOpcional,
  leerNumeroOpcional,
};
