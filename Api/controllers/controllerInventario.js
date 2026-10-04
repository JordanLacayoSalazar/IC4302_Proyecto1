const {
  sql,
  conectarBaseDatos,
  manejarError,
  leerEnteroOpcional,
  leerNumeroOpcional,
} = require("../utilidades");

/**
 * Obtiene productos con filtros acumulativos.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Productos ordenados por nombre.
 */
const getProductos = async (req, res) => {
  try {
    const nombre = req.query.nombre?.trim() || null;
    const grupoId = leerEnteroOpcional(req.query.grupoId, "grupoId", {
      min: 1,
    });

    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("NombreBusqueda", sql.NVarChar(100), nombre)
      .input("GrupoID", sql.Int, grupoId)
      .execute("ObtenerProductos");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene sugerencias de productos para autocompletado.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Hasta 20 coincidencias.
 */
const getSugerenciasProductos = async (req, res) => {
  try {
    const busqueda = req.query.buscar?.trim() || null;
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("Busqueda", sql.NVarChar(100), busqueda)
      .execute("ObtenerSugerenciasProductos");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene el detalle de un producto.
 * @param {import('express').Request} req Solicitud HTTP con ID.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Detalle del producto.
 */
const getProductoById = async (req, res) => {
  try {
    const productoId = leerEnteroOpcional(req.params.id, "ProductoID", {
      min: 1,
    });

    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("ProductoID", sql.Int, productoId)
      .execute("ObtenerDetalleProducto");

    if (result.recordset.length === 0) {
      return res.status(404).json({ errorMsg: "Producto no encontrado." });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene grupos de productos para filtros y formularios.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Catálogo de grupos.
 */
const getGruposProducto = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    const result = await pool.request().execute("ObtenerGruposProducto");
    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene opciones de producto para el filtro de subcategoría.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Productos que pueden utilizarse como sugerencias.
 */
const getSubcategoriasProducto = async (req, res) => {
  try {
    const busqueda = req.query.buscar?.trim() || null;
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("Busqueda", sql.NVarChar(100), busqueda)
      .execute("ObtenerSubcategoriasProductos");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Construye y envía la creación de un producto al procedimiento almacenado.
 * @param {import('express').Request} req Solicitud HTTP con datos del producto.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Identificador del producto creado.
 */
const crearProducto = async (req, res) => {
  try {
    const {
      NombreProducto,
      NombreGrupo,
      Proveedor,
      Color,
      UnidadEmpaque,
      EmpaqueExterior,
      CantidadEmpaque,
      Marca,
      Talla,
      Impuesto,
      PrecioUnitario,
      PrecioVenta,
      Peso,
      PalabrasClaves,
    } = req.body;

    const cantidadEmpaque = leerEnteroOpcional(
      CantidadEmpaque,
      "CantidadEmpaque",
      { min: 1 },
    );
    const impuesto = leerNumeroOpcional(Impuesto, "Impuesto", { min: 0 });
    const precioUnitario = leerNumeroOpcional(
      PrecioUnitario,
      "PrecioUnitario",
      { min: 0 },
    );
    const precioVenta = leerNumeroOpcional(PrecioVenta, "PrecioVenta", {
      min: 0,
    });
    const peso = leerNumeroOpcional(Peso, "Peso", { min: 0 });

    if (
      cantidadEmpaque === null ||
      impuesto === null ||
      precioUnitario === null ||
      precioVenta === null ||
      peso === null
    ) {
      const error = new Error(
        "Complete los valores numéricos obligatorios del producto.",
      );
      error.statusCode = 400;
      throw error;
    }

    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("NombreProducto", sql.NVarChar(100), NombreProducto)
      .input("NombreGrupo", sql.NVarChar(50), NombreGrupo)
      .input("NombreProveedor", sql.NVarChar(100), Proveedor)
      .input("Color", sql.NVarChar(20), Color?.trim() || null)
      .input("UnidadEmpaque", sql.NVarChar(50), UnidadEmpaque)
      .input("EmpaqueExterior", sql.NVarChar(50), EmpaqueExterior)
      .input("CantidadEmpaque", sql.Int, cantidadEmpaque)
      .input("Marca", sql.NVarChar(50), Marca?.trim() || null)
      .input("Talla", sql.NVarChar(20), Talla?.trim() || null)
      .input("Impuesto", sql.Decimal(18, 3), impuesto)
      .input("PrecioUnitario", sql.Decimal(18, 2), precioUnitario)
      .input("PrecioVenta", sql.Decimal(18, 2), precioVenta)
      .input("Peso", sql.Decimal(18, 3), peso)
      .input(
        "PalabrasClaves",
        sql.NVarChar(sql.MAX),
        PalabrasClaves?.trim() || null,
      )
      .execute("CrearProducto");

    res.status(201).json({
      message: "Producto creado exitosamente.",
      ProductoID: result.recordset[0]?.ProductoID,
    });
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Actualiza un producto de manera transaccional mediante SQL Server.
 * @param {import('express').Request} req Solicitud HTTP con ID y datos.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Confirmación de actualización.
 */
const actualizarProducto = async (req, res) => {
  try {
    const productoId = leerEnteroOpcional(req.params.id, "ProductoID", {
      min: 1,
    });
    const {
      NombreProducto,
      NombreGrupo,
      Proveedor,
      Color,
      UnidadEmpaque,
      EmpaqueExterior,
      CantidadEmpaque,
      Marca,
      Talla,
      Impuesto,
      PrecioUnitario,
      PrecioVenta,
      Peso,
      PalabrasClaves,
    } = req.body;

    const cantidadEmpaque = leerEnteroOpcional(
      CantidadEmpaque,
      "CantidadEmpaque",
      { min: 1 },
    );
    const impuesto = leerNumeroOpcional(Impuesto, "Impuesto", { min: 0 });
    const precioUnitario = leerNumeroOpcional(
      PrecioUnitario,
      "PrecioUnitario",
      { min: 0 },
    );
    const precioVenta = leerNumeroOpcional(PrecioVenta, "PrecioVenta", {
      min: 0,
    });
    const peso = leerNumeroOpcional(Peso, "Peso", { min: 0 });

    if (
      cantidadEmpaque === null ||
      impuesto === null ||
      precioUnitario === null ||
      precioVenta === null ||
      peso === null
    ) {
      const error = new Error(
        "Complete los valores numéricos obligatorios del producto.",
      );
      error.statusCode = 400;
      throw error;
    }

    const pool = await conectarBaseDatos();
    await pool
      .request()
      .input("ProductoID", sql.Int, productoId)
      .input("NombreProducto", sql.NVarChar(100), NombreProducto)
      .input("NombreGrupo", sql.NVarChar(50), NombreGrupo)
      .input("NombreProveedor", sql.NVarChar(100), Proveedor)
      .input("Color", sql.NVarChar(20), Color?.trim() || null)
      .input("UnidadEmpaque", sql.NVarChar(50), UnidadEmpaque)
      .input("EmpaqueExterior", sql.NVarChar(50), EmpaqueExterior)
      .input("CantidadEmpaque", sql.Int, cantidadEmpaque)
      .input("Marca", sql.NVarChar(50), Marca?.trim() || null)
      .input("Talla", sql.NVarChar(20), Talla?.trim() || null)
      .input("Impuesto", sql.Decimal(18, 3), impuesto)
      .input("PrecioUnitario", sql.Decimal(18, 2), precioUnitario)
      .input("PrecioVenta", sql.Decimal(18, 2), precioVenta)
      .input("Peso", sql.Decimal(18, 3), peso)
      .input(
        "PalabrasClaves",
        sql.NVarChar(sql.MAX),
        PalabrasClaves?.trim() || null,
      )
      .execute("ActualizarProducto");

    res.json({ message: "Producto actualizado exitosamente." });
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Elimina un producto mediante el procedimiento almacenado.
 * @param {import('express').Request} req Solicitud HTTP con ID.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Confirmación de eliminación.
 */
const eliminarProducto = async (req, res) => {
  try {
    const productoId = leerEnteroOpcional(req.params.id, "ProductoID", {
      min: 1,
    });

    const pool = await conectarBaseDatos();
    await pool
      .request()
      .input("ProductoID", sql.Int, productoId)
      .execute("EliminarProducto");

    res.json({ message: "Producto eliminado exitosamente." });
  } catch (err) {
    manejarError(res, err);
  }
};

module.exports = {
  getProductos,
  getSugerenciasProductos,
  getProductoById,
  getGruposProducto,
  getSubcategoriasProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
