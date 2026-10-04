const {
  sql,
  conectarBaseDatos,
  manejarError,
  leerEnteroOpcional,
} = require("../utilidades");

/**
 * Ejecuta el reporte 1: compras por proveedor y categoría.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getReporte1 = async (req, res) => {
  try {
    const proveedor = req.query.proveedor?.trim() || null;

    const categoria = req.query.categoria?.trim() || null;

    const pool = await conectarBaseDatos();

    const result = await pool
      .request()
      .input("Proveedor", sql.NVarChar(100), proveedor)
      .input("Categoria", sql.NVarChar(50), categoria)
      .execute("ObtenerReporte1");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Ejecuta el reporte 3: top de productos con mayor ganancia.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getReporte3 = async (req, res) => {
  try {
    const anio = leerEnteroOpcional(req.query.anio, "anio", {
      min: 1900,
      max: 2100,
    });

    const pool = await conectarBaseDatos();

    const result = await pool
      .request()
      .input("Anio", sql.Int, anio)
      .execute("ObtenerReporte3");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Ejecuta el reporte 6: matriz de ventas por categoría y año.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getReporte6 = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();

    const result = await pool.request().execute("ObtenerReporte6");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Ejecuta el reporte 8:
 * seguimiento mensual de compras a proveedores.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getReporte8 = async (req, res) => {
  try {
    const anio = leerEnteroOpcional(req.query.anio, "anio", {
      min: 1900,
      max: 2100,
    });

    const mes = leerEnteroOpcional(req.query.mes, "mes", {
      min: 1,
      max: 12,
    });

    const categoria = req.query.categoria?.trim() || null;

    const subcategoria = req.query.subcategoria?.trim() || null;

    const pool = await conectarBaseDatos();

    const result = await pool
      .request()
      .input("Anio", sql.Int, anio)
      .input("Mes", sql.Int, mes)
      .input("CategoriaProducto", sql.NVarChar(50), categoria)
      .input("SubcategoriaProducto", sql.NVarChar(100), subcategoria)
      .execute("ObtenerReporte8");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Ejecuta el reporte 9:
 * rotación estimada por producto.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getReporte9 = async (req, res) => {
  try {
    const categoria = req.query.categoria?.trim() || null;

    const proveedor = req.query.proveedor?.trim() || null;

    const anio = leerEnteroOpcional(req.query.anio, "anio", {
      min: 1900,
      max: 2100,
    });

    const pool = await conectarBaseDatos();

    const result = await pool
      .request()
      .input("CategoriaProducto", sql.NVarChar(50), categoria)
      .input("Anio", sql.Int, anio)
      .input("Proveedor", sql.NVarChar(100), proveedor)
      .execute("ObtenerReporte9");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene años válidos presentes en la base de datos.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getAniosReportes = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();

    const result = await pool.request().execute("ObtenerAniosReportes");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

module.exports = {
  getReporte1,
  getReporte3,
  getReporte6,
  getReporte8,
  getReporte9,
  getAniosReportes,
};
