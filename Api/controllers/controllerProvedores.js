const sql = require("mssql");

const conectarBaseDatos = async () => {
  if (!process.env.DB_CONFIG) {
    const error = new Error(
      "No se encontró DB_CONFIG. Verifique que Api/.env exista y contenga esa variable.",
    );
    error.connectionError = true;
    throw error;
  }

  try {
    return await sql.connect(process.env.DB_CONFIG);
  } catch (error) {
    error.connectionError = true;
    throw error;
  }
};

const responderError = (res, err) => {
  res.status(500).json({
    error: err.message,
    connectionError: err.connectionError === true,
  });
};

const getProveedores = async (req, res) => {
  try {
    const { nombre, categoriaId } = req.query;
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("NombreBusqueda", sql.NVarChar(100), nombre ? nombre : null)
      .input("CategoriaID", sql.Int, categoriaId ? parseInt(categoriaId) : null)
      .execute("ObtenerProveedores");
    res.json(result.recordset);
  } catch (err) {
    responderError(res, err);
  }
};

const getProveedorById = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    const result = await pool
      .request()
      .input("SupplierID", sql.Int, req.params.id)
      .execute("ObtenerDetalleProveedor");
    res.json(result.recordset[0]);
  } catch (err) {
    responderError(res, err);
  }
};

const crearProveedor = async (req, res) => {
  try {
    const {
      SupplierName,
      SupplierCategoryID,
      PrimaryContactPersonID,
      DeliveryMethodID,
      DeliveryCityID,
      SupplierReference,
    } = req.body;
    const pool = await conectarBaseDatos();
    await pool
      .request()
      .input("SupplierName", sql.NVarChar(100), SupplierName)
      .input("SupplierCategoryID", sql.Int, SupplierCategoryID)
      .input("PrimaryContactPersonID", sql.Int, PrimaryContactPersonID)
      .input("DeliveryMethodID", sql.Int, DeliveryMethodID)
      .input("DeliveryCityID", sql.Int, DeliveryCityID)
      .input("SupplierReference", sql.NVarChar(20), SupplierReference)
      .execute("CrearProveedor");
    res.status(201).json({ message: "Proveedor creado exitosamente" });
  } catch (err) {
    responderError(res, err);
  }
};

const getCategoriasProveedor = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    const result = await pool.request().execute("ObtenerCategoriasProveedor");
    res.json(result.recordset);
  } catch (err) {
    responderError(res, err);
  }
};

const actualizarProveedor = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    await pool
      .request()
      .input("SupplierID", sql.Int, req.params.id)
      .input("SupplierName", sql.NVarChar(100), req.body.SupplierName)
      .execute("ActualizarProveedor");
    res.json({ message: "Proveedor actualizado" });
  } catch (err) {
    responderError(res, err);
  }
};

const eliminarProveedor = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    await pool
      .request()
      .input("SupplierID", sql.Int, req.params.id)
      .execute("EliminarProveedor");
    res.json({ message: "Proveedor eliminado" });
  } catch (err) {
    responderError(res, err);
  }
};

module.exports = {
  getProveedores,
  getProveedorById,
  getCategoriasProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};
