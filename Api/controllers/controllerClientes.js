const { sql, conectarBaseDatos, manejarError } = require("../utilidades");

/**
 * Obtiene clientes aplicando los filtros opcionales de nombre, categoría y entrega.
 * @param {import('express').Request} req Solicitud HTTP con filtros en query.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía la lista de clientes como JSON.
 */
const getClientes = async (req, res) => {
  try {
    const { nombre, categoria, metodoEntrega } = req.query;
    const pool = await conectarBaseDatos();
    const resultado = await pool
      .request()
      .input("NombreBusqueda", sql.NVarChar(100), nombre ? nombre : null)
      .input(
        "CategoriaBusqueda",
        sql.NVarChar(100),
        categoria ? categoria : null,
      )
      .input(
        "MetodoEntregaBusqueda",
        sql.NVarChar(100),
        metodoEntrega ? metodoEntrega : null,
      )
      .execute("ObtenerClientes");

    res.json(resultado.recordset);
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Obtiene el detalle de un cliente por su identificador.
 * @param {import('express').Request} req Solicitud HTTP con el ID en params.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía el detalle del cliente como JSON.
 */
const getClienteById = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    const resultado = await pool
      .request()
      .input("CustomerID", sql.Int, req.params.id)
      .execute("ObtenerDetalleCliente");

    res.json(resultado.recordset[0]);
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Obtiene los catálogos que alimentan los selectores del formulario de clientes.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía categorías, grupos, contactos y demás opciones.
 */
const getOpcionesCliente = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    const resultado = await pool
      .request()
      .execute("ObtenerOpcionesFormularioCliente");

    res.json({
      categorias: resultado.recordsets[0] || [],
      gruposCompra: resultado.recordsets[1] || [],
      contactos: resultado.recordsets[2] || [],
      metodosEntrega: resultado.recordsets[3] || [],
      ciudades: resultado.recordsets[4] || [],
      clientesFacturacion: resultado.recordsets[5] || [],
    });
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Crea un cliente con los datos recibidos en el cuerpo de la solicitud.
 * @param {import('express').Request} req Solicitud HTTP con los datos del cliente.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía el identificador del cliente creado.
 */
const crearCliente = async (req, res) => {
  try {
    const {
      CustomerName,
      BillToCustomerID,
      CustomerCategoryID,
      PrimaryContactPersonID,
      DeliveryMethodID,
      DeliveryCityID,
      BuyingGroupID,
      AlternateContactPersonID,
      PostalCityID,
      PhoneNumber,
      FaxNumber,
      WebsiteURL,
      PaymentDays,
      DeliveryAddressLine1,
      DeliveryAddressLine2,
      DeliveryPostalCode,
      PostalAddressLine1,
      PostalAddressLine2,
      PostalPostalCode,
      Latitud,
      Longitud,
      CreditLimit,
      StandardDiscountPercentage,
    } = req.body;

    const pool = await conectarBaseDatos();
    const resultado = await pool
      .request()
      .input("CustomerName", sql.NVarChar(100), CustomerName)
      .input("BillToCustomerID", sql.Int, BillToCustomerID)
      .input("CustomerCategoryID", sql.Int, CustomerCategoryID)
      .input("PrimaryContactPersonID", sql.Int, PrimaryContactPersonID)
      .input("DeliveryMethodID", sql.Int, DeliveryMethodID)
      .input("DeliveryCityID", sql.Int, DeliveryCityID)
      .input("BuyingGroupID", sql.Int, BuyingGroupID)
      .input("AlternateContactPersonID", sql.Int, AlternateContactPersonID)
      .input("PostalCityID", sql.Int, PostalCityID)
      .input("PhoneNumber", sql.NVarChar(20), PhoneNumber)
      .input("FaxNumber", sql.NVarChar(20), FaxNumber)
      .input("WebsiteURL", sql.NVarChar(256), WebsiteURL)
      .input("PaymentDays", sql.Int, PaymentDays)
      .input("DeliveryAddressLine1", sql.NVarChar(60), DeliveryAddressLine1)
      .input("DeliveryAddressLine2", sql.NVarChar(60), DeliveryAddressLine2)
      .input("DeliveryPostalCode", sql.NVarChar(10), DeliveryPostalCode)
      .input("PostalAddressLine1", sql.NVarChar(60), PostalAddressLine1)
      .input("PostalAddressLine2", sql.NVarChar(60), PostalAddressLine2)
      .input("PostalPostalCode", sql.NVarChar(10), PostalPostalCode)
      .input("Latitud", sql.Float, Latitud)
      .input("Longitud", sql.Float, Longitud)
      .input("CreditLimit", sql.Decimal(18, 2), CreditLimit)
      .input(
        "StandardDiscountPercentage",
        sql.Decimal(18, 3),
        StandardDiscountPercentage,
      )
      .execute("CrearCliente");

    res.status(201).json({
      message: "Cliente creado exitosamente.",
      CustomerID: resultado.recordset[0]?.CustomerID,
    });
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Actualiza los datos de un cliente existente.
 * @param {import('express').Request} req Solicitud con ID en params y datos en body.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía una confirmación de actualización.
 */
const actualizarCliente = async (req, res) => {
  try {
    const {
      CustomerName,
      BillToCustomerID,
      CustomerCategoryID,
      BuyingGroupID,
      PrimaryContactPersonID,
      AlternateContactPersonID,
      DeliveryMethodID,
      DeliveryCityID,
      PostalCityID,
      PhoneNumber,
      FaxNumber,
      WebsiteURL,
      PaymentDays,
      DeliveryAddressLine1,
      DeliveryAddressLine2,
      DeliveryPostalCode,
      PostalAddressLine1,
      PostalAddressLine2,
      PostalPostalCode,
      Latitud,
      Longitud,
      CreditLimit,
      StandardDiscountPercentage,
    } = req.body;

    const pool = await conectarBaseDatos();
    await pool
      .request()
      .input("CustomerID", sql.Int, req.params.id)
      .input("CustomerName", sql.NVarChar(100), CustomerName)
      .input("BillToCustomerID", sql.Int, BillToCustomerID)
      .input("CustomerCategoryID", sql.Int, CustomerCategoryID)
      .input("BuyingGroupID", sql.Int, BuyingGroupID)
      .input("PrimaryContactPersonID", sql.Int, PrimaryContactPersonID)
      .input("AlternateContactPersonID", sql.Int, AlternateContactPersonID)
      .input("DeliveryMethodID", sql.Int, DeliveryMethodID)
      .input("DeliveryCityID", sql.Int, DeliveryCityID)
      .input("PostalCityID", sql.Int, PostalCityID)
      .input("PhoneNumber", sql.NVarChar(20), PhoneNumber)
      .input("FaxNumber", sql.NVarChar(20), FaxNumber)
      .input("WebsiteURL", sql.NVarChar(256), WebsiteURL)
      .input("PaymentDays", sql.Int, PaymentDays)
      .input("DeliveryAddressLine1", sql.NVarChar(60), DeliveryAddressLine1)
      .input("DeliveryAddressLine2", sql.NVarChar(60), DeliveryAddressLine2)
      .input("DeliveryPostalCode", sql.NVarChar(10), DeliveryPostalCode)
      .input("PostalAddressLine1", sql.NVarChar(60), PostalAddressLine1)
      .input("PostalAddressLine2", sql.NVarChar(60), PostalAddressLine2)
      .input("PostalPostalCode", sql.NVarChar(10), PostalPostalCode)
      .input("Latitud", sql.Float, Latitud)
      .input("Longitud", sql.Float, Longitud)
      .input("CreditLimit", sql.Decimal(18, 2), CreditLimit)
      .input(
        "StandardDiscountPercentage",
        sql.Decimal(18, 3),
        StandardDiscountPercentage,
      )
      .input(
        "ActualizarCreditLimit",
        sql.Bit,
        Object.prototype.hasOwnProperty.call(req.body, "CreditLimit"),
      )
      .execute("ActualizarCliente");

    res.json({ message: "Cliente actualizado exitosamente." });
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Elimina el cliente indicado por el identificador de la ruta.
 * @param {import('express').Request} req Solicitud HTTP con el ID en params.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía una confirmación de eliminación.
 */
const eliminarCliente = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    await pool
      .request()
      .input("CustomerID", sql.Int, req.params.id)
      .execute("EliminarCliente");

    res.json({ message: "Cliente eliminado exitosamente." });
  } catch (error) {
    manejarError(res, error);
  }
};

module.exports = {
  getClientes,
  getClienteById,
  getOpcionesCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
