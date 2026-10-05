const {
  sql,
  conectarBaseDatos,
  manejarError,
  leerEnteroOpcional,
  leerNumeroOpcional,
} = require("../utilidades");

/**
 * Verifica que la API pueda abrir una conexión a SQL Server.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Respuesta JSON con el estado de conexión.
 */
const getVerificarConexionBD = async (req, res) => {
  try {
    await conectarBaseDatos();
    res.json({ conectado: true });
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene proveedores usando filtros acumulativos.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Lista de proveedores.
 */
const getProveedores = async (req, res) => {
  try {
    const nombre = req.query.nombre?.trim() || null;
    const categoriaId = leerEnteroOpcional(
      req.query.categoriaId,
      "categoriaId",
      { min: 1 },
    );
    const metodoEntregaId = leerEnteroOpcional(
      req.query.metodoEntregaId,
      "metodoEntregaId",
      { min: 1 },
    );

    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("NombreBusqueda", sql.NVarChar(100), nombre)
      .input("CategoriaID", sql.Int, categoriaId)
      .input("MetodoEntregaID", sql.Int, metodoEntregaId)
      .execute("ObtenerProveedores");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene sugerencias de proveedores para autocompletado.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Hasta 20 coincidencias.
 */
const getSugerenciasProveedores = async (req, res) => {
  try {
    const busqueda = req.query.buscar?.trim() || null;
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("Busqueda", sql.NVarChar(100), busqueda)
      .execute("ObtenerSugerenciasProveedores");

    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene el detalle de un proveedor por ID.
 * @param {import('express').Request} req Solicitud HTTP con req.params.id.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Detalle del proveedor.
 */
const getProveedorById = async (req, res) => {
  try {
    const supplierId = leerEnteroOpcional(req.params.id, "SupplierID", {
      min: 1,
    });

    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("SupplierID", sql.Int, supplierId)
      .execute("ObtenerDetalleProveedor");

    if (result.recordset.length === 0) {
      return res.status(404).json({ errorMsg: "Proveedor no encontrado." });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene categorías de proveedores para filtros.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Catálogo de categorías.
 */
const getCategoriasProveedor = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    const result = await pool.request().execute("ObtenerCategoriasProveedor");
    res.json(result.recordset);
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Obtiene catálogos necesarios para el formulario de proveedores.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Categorías, contactos, métodos y ciudades.
 */
const getOpcionesProveedor = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .execute("ObtenerOpcionesFormularioProveedor");

    res.json({
      categorias: result.recordsets[0] || [],
      contactos: result.recordsets[1] || [],
      metodosEntrega: result.recordsets[2] || [],
      ciudades: result.recordsets[3] || [],
    });
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Crea un proveedor mediante el procedimiento almacenado.
 * @param {import('express').Request} req Solicitud HTTP con el modelo del proveedor.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Identificador del proveedor creado.
 */
const crearProveedor = async (req, res) => {
  try {
    const {
      SupplierName,
      SupplierCategoryName,
      PrimaryContactPersonName,
      AlternateContactPersonName,
      DeliveryMethodName,
      DeliveryCityName,
      SupplierReference,
      DeliveryAddressLine1,
      DeliveryAddressLine2,
      DeliveryPostalCode,
      PostalAddressLine1,
      PostalAddressLine2,
      PostalPostalCode,
      PhoneNumber,
      FaxNumber,
      WebsiteURL,
      BankAccountName,
      BankAccountNumber,
      PaymentDays,
      Latitud,
      Longitud,
    } = req.body;

    const paymentDays =
      leerEnteroOpcional(PaymentDays, "PaymentDays", {
        min: 0,
      }) ?? 30;
    const latitud = leerNumeroOpcional(Latitud, "Latitud", {
      min: -90,
      max: 90,
    });
    const longitud = leerNumeroOpcional(Longitud, "Longitud", {
      min: -180,
      max: 180,
    });

    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("SupplierName", sql.NVarChar(100), SupplierName)
      .input("SupplierCategoryName", sql.NVarChar(50), SupplierCategoryName)
      .input(
        "PrimaryContactPersonName",
        sql.NVarChar(100),
        PrimaryContactPersonName,
      )
      .input(
        "AlternateContactPersonName",
        sql.NVarChar(100),
        AlternateContactPersonName || null,
      )
      .input("DeliveryMethodName", sql.NVarChar(100), DeliveryMethodName)
      .input("CityName", sql.NVarChar(100), DeliveryCityName)
      .input("SupplierReference", sql.NVarChar(20), SupplierReference)
      .input(
        "DeliveryAddressLine1",
        sql.NVarChar(60),
        DeliveryAddressLine1 || null,
      )
      .input(
        "DeliveryAddressLine2",
        sql.NVarChar(60),
        DeliveryAddressLine2 || null,
      )
      .input("DeliveryPostalCode", sql.NVarChar(10), DeliveryPostalCode || null)
      .input("PostalAddressLine1", sql.NVarChar(60), PostalAddressLine1 || null)
      .input("PostalAddressLine2", sql.NVarChar(60), PostalAddressLine2 || null)
      .input("PostalPostalCode", sql.NVarChar(10), PostalPostalCode || null)
      .input("Latitud", sql.Float, latitud)
      .input("Longitud", sql.Float, longitud)
      .input("PhoneNumber", sql.NVarChar(20), PhoneNumber?.trim() || null)
      .input("FaxNumber", sql.NVarChar(20), FaxNumber?.trim() || null)
      .input("WebsiteURL", sql.NVarChar(256), WebsiteURL?.trim() || null)
      .input(
        "BankAccountName",
        sql.NVarChar(50),
        BankAccountName?.trim() || null,
      )
      .input(
        "BankAccountNumber",
        sql.NVarChar(20),
        BankAccountNumber?.trim() || null,
      )
      .input("PaymentDays", sql.Int, paymentDays)
      .execute("CrearProveedor");

    res.status(201).json({
      message: "Proveedor creado exitosamente.",
      SupplierID: result.recordset[0]?.SupplierID,
    });
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Actualiza un proveedor mediante el procedimiento almacenado.
 * @param {import('express').Request} req Solicitud HTTP con ID y datos.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Confirmación de actualización.
 */
const actualizarProveedor = async (req, res) => {
  try {
    const supplierId = leerEnteroOpcional(req.params.id, "SupplierID", {
      min: 1,
    });
    const {
      SupplierName,
      SupplierCategoryName,
      PrimaryContactPersonName,
      AlternateContactPersonName,
      DeliveryMethodName,
      DeliveryCityName,
      SupplierReference,
      DeliveryAddressLine1,
      DeliveryAddressLine2,
      DeliveryPostalCode,
      PostalAddressLine1,
      PostalAddressLine2,
      PostalPostalCode,
      PhoneNumber,
      FaxNumber,
      WebsiteURL,
      BankAccountName,
      BankAccountNumber,
      PaymentDays,
      Latitud,
      Longitud,
    } = req.body;

    const paymentDays =
      leerEnteroOpcional(PaymentDays, "PaymentDays", {
        min: 0,
      }) ?? 30;
    const latitud = leerNumeroOpcional(Latitud, "Latitud", {
      min: -90,
      max: 90,
    });
    const longitud = leerNumeroOpcional(Longitud, "Longitud", {
      min: -180,
      max: 180,
    });

    const pool = await conectarBaseDatos();
    await pool
      .request()
      .input("SupplierID", sql.Int, supplierId)
      .input("SupplierName", sql.NVarChar(100), SupplierName)
      .input("SupplierCategoryName", sql.NVarChar(50), SupplierCategoryName)
      .input(
        "PrimaryContactPersonName",
        sql.NVarChar(100),
        PrimaryContactPersonName,
      )
      .input(
        "AlternateContactPersonName",
        sql.NVarChar(100),
        AlternateContactPersonName || null,
      )
      .input("DeliveryMethodName", sql.NVarChar(100), DeliveryMethodName)
      .input("CityName", sql.NVarChar(100), DeliveryCityName)
      .input("SupplierReference", sql.NVarChar(20), SupplierReference)
      .input(
        "DeliveryAddressLine1",
        sql.NVarChar(60),
        DeliveryAddressLine1 || null,
      )
      .input(
        "DeliveryAddressLine2",
        sql.NVarChar(60),
        DeliveryAddressLine2 || null,
      )
      .input("DeliveryPostalCode", sql.NVarChar(10), DeliveryPostalCode || null)
      .input("PostalAddressLine1", sql.NVarChar(60), PostalAddressLine1 || null)
      .input("PostalAddressLine2", sql.NVarChar(60), PostalAddressLine2 || null)
      .input("PostalPostalCode", sql.NVarChar(10), PostalPostalCode || null)
      .input("Latitud", sql.Float, latitud)
      .input("Longitud", sql.Float, longitud)
      .input("PhoneNumber", sql.NVarChar(20), PhoneNumber?.trim() || null)
      .input("FaxNumber", sql.NVarChar(20), FaxNumber?.trim() || null)
      .input("WebsiteURL", sql.NVarChar(256), WebsiteURL?.trim() || null)
      .input(
        "BankAccountName",
        sql.NVarChar(50),
        BankAccountName?.trim() || null,
      )
      .input(
        "BankAccountNumber",
        sql.NVarChar(20),
        BankAccountNumber?.trim() || null,
      )
      .input("PaymentDays", sql.Int, paymentDays)
      .execute("ActualizarProveedor");

    res.json({ message: "Proveedor actualizado exitosamente." });
  } catch (err) {
    manejarError(res, err);
  }
};

/**
 * Elimina un proveedor mediante un procedimiento almacenado.
 * @param {import('express').Request} req Solicitud HTTP con req.params.id.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Confirmación de eliminación.
 */
const eliminarProveedor = async (req, res) => {
  try {
    const supplierId = leerEnteroOpcional(req.params.id, "SupplierID", {
      min: 1,
    });

    const pool = await conectarBaseDatos();
    await pool
      .request()
      .input("SupplierID", sql.Int, supplierId)
      .execute("EliminarProveedor");

    res.json({ message: "Proveedor eliminado exitosamente." });
  } catch (err) {
    manejarError(res, err);
  }
};

module.exports = {
  getVerificarConexionBD,
  getProveedores,
  getSugerenciasProveedores,
  getProveedorById,
  getCategoriasProveedor,
  getOpcionesProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};
