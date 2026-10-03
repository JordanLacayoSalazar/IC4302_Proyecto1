const { sql, conectarBaseDatos, manejarError } = require("../utilidades");

const getClientes = async (req, res) => {
  try {
    const { nombre } = req.query;
    const pool = await conectarBaseDatos();
    const resultado = await pool
      .request()
      .input("NombreBusqueda", sql.NVarChar(100), nombre ? nombre : null)
      .execute("ObtenerClientes");

    res.json(resultado.recordset);
  } catch (error) {
    manejarError(res, error);
  }
};

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

const getOpcionesCliente = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    const resultado = await pool.request().query(`
      SELECT CustomerCategoryID, CustomerCategoryName
      FROM Sales.CustomerCategories
      ORDER BY CustomerCategoryName;

      SELECT BuyingGroupID, BuyingGroupName
      FROM Sales.BuyingGroups
      ORDER BY BuyingGroupName;

      SELECT PersonID, FullName
      FROM Application.People
      ORDER BY FullName;

      SELECT DeliveryMethodID, DeliveryMethodName
      FROM Application.DeliveryMethods
      ORDER BY DeliveryMethodName;

      SELECT CityID, CityName
      FROM Application.Cities
      ORDER BY CityName;

      SELECT CustomerID, CustomerName
      FROM Sales.Customers
      ORDER BY CustomerName;
    `);

    res.json({
      categorias: resultado.recordsets[0],
      gruposCompra: resultado.recordsets[1],
      contactos: resultado.recordsets[2],
      metodosEntrega: resultado.recordsets[3],
      ciudades: resultado.recordsets[4],
      clientesFacturacion: resultado.recordsets[5],
    });
  } catch (error) {
    manejarError(res, error);
  }
};

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
      .execute("CrearCliente");

    res.status(201).json({
      message: "Cliente creado exitosamente.",
      CustomerID: resultado.recordset[0]?.CustomerID,
    });
  } catch (error) {
    manejarError(res, error);
  }
};

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
      .execute("ActualizarCliente");

    res.json({ message: "Cliente actualizado exitosamente." });
  } catch (error) {
    manejarError(res, error);
  }
};

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
