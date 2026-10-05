const {
  sql,
  conectarBaseDatos,
  manejarError,
  leerEnteroOpcional,
} = require("../utilidades");

/**
 * Ejecuta el reporte 2: estadísticas de ventas por cliente y categoría.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getReporte2 = async (req, res) => {
  try {
    const nombreCliente = req.query.nombreCliente?.trim() || null;
    const categoria = req.query.categoria?.trim() || null;
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("NombreCliente", sql.NVarChar(100), nombreCliente)
      .input("Categoria", sql.NVarChar(100), categoria)
      .execute("ObtenerReporte2");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

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
 * Ejecuta el reporte 4: top de clientes por cantidad de facturas y año.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getReporte4 = async (req, res) => {
  try {
    const anioInicio = leerEnteroOpcional(req.query.anioInicio, "anioInicio", {
      min: 1900,
    });
    const anioFin = leerEnteroOpcional(req.query.anioFin, "anioFin", {
      min: 1900,
    });
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("AnioInicio", sql.Int, anioInicio)
      .input("AnioFin", sql.Int, anioFin)
      .execute("ObtenerReporte4");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Ejecuta el reporte 5: top de proveedores por órdenes de compra y año.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getReporte5 = async (req, res) => {
  try {
    const anioInicio = leerEnteroOpcional(req.query.anioInicio, "anioInicio", {
      min: 1900,
    });
    const anioFin = leerEnteroOpcional(req.query.anioFin, "anioFin", {
      min: 1900,
    });
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("AnioInicio", sql.Int, anioInicio)
      .input("AnioFin", sql.Int, anioFin)
      .execute("ObtenerReporte5");

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
 * Ejecuta el reporte 7: seguimiento mensual de compras por cliente.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getReporte7 = async (req, res) => {
  try {
    const anio = leerEnteroOpcional(req.query.anio, "anio", {
      min: 1900,
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
      .execute("ObtenerReporte7");

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
 * Ejecuta el reporte 10: método de envío favorito por destino.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getReporte10 = async (req, res) => {
  try {
    const anio = leerEnteroOpcional(req.query.anio, "anio", {
      min: 1900,
    });
    const mes = leerEnteroOpcional(req.query.mes, "mes", {
      min: 1,
      max: 12,
    });
    const categoriaClienteId = leerEnteroOpcional(
      req.query.categoriaClienteId,
      "categoriaClienteId",
      { min: 1 },
    );
    const categoriaProductoId = leerEnteroOpcional(
      req.query.categoriaProductoId,
      "categoriaProductoId",
      { min: 1 },
    );
    const productoId = leerEnteroOpcional(req.query.productoId, "productoId", {
      min: 1,
    });
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("Anio", sql.Int, anio)
      .input("Mes", sql.Int, mes)
      .input("CategoriaClienteID", sql.Int, categoriaClienteId)
      .input("CategoriaProductoID", sql.Int, categoriaProductoId)
      .input("ProductoID", sql.Int, productoId)
      .execute("ObtenerReporte10");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene los catálogos específicos de filtros para reportes.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getOpcionesReportes = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .execute("ObtenerOpcionesFiltrosReportes");

    res.json({
      aniosFacturas: result.recordsets[0] || [],
      aniosOrdenesCompra: result.recordsets[1] || [],
      categoriasClientes: result.recordsets[2] || [],
      categoriasProductos: result.recordsets[3] || [],
      productos: result.recordsets[4] || [],
    });
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
  getReporte2,
  getReporte1,
  getReporte4,
  getReporte5,
  getReporte3,
  getReporte6,
  getReporte7,
  getReporte8,
  getReporte9,
  getReporte10,
  getOpcionesReportes,
  getAniosReportes,
};
