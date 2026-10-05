const {
  sql,
  conectarBaseDatos,
  manejarError,
  leerEnteroOpcional,
  leerNumeroOpcional,
} = require("../utilidades");

/**
 * Convierte un ID obligatorio en un entero positivo.
 * @param {*} valor Valor recibido desde la solicitud.
 * @param {string} nombre Nombre del campo.
 * @returns {number} ID validado.
 * @throws {Error} Cuando el valor no es un ID válido.
 */
const leerIdRequerido = (valor, nombre) => {
  const id = leerEnteroOpcional(valor, nombre, { min: 1 });
  if (id === null) {
    const error = new Error(`${nombre} es obligatorio.`);
    error.statusCode = 400;
    throw error;
  }
  return id;
};

/**
 * Valida una fecha ISO opcional de formato YYYY-MM-DD.
 * @param {*} valor Fecha recibida.
 * @param {string} nombre Nombre del campo.
 * @returns {string|null} Fecha validada o null si está vacía.
 * @throws {Error} Cuando la fecha no es una fecha ISO válida.
 */
const leerFechaOpcional = (valor, nombre) => {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    return null;
  }

  const fecha = String(valor).trim();
  const fechaParseada = new Date(`${fecha}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
    Number.isNaN(fechaParseada.getTime()) ||
    fechaParseada.toISOString().slice(0, 10) !== fecha
  ) {
    const error = new Error(`${nombre} debe ser una fecha válida.`);
    error.statusCode = 400;
    throw error;
  }

  return fecha;
};

/**
 * Valida una fecha obligatoria de factura.
 * @param {*} valor Fecha recibida.
 * @param {string} nombre Nombre del campo.
 * @returns {string} Fecha ISO validada.
 * @throws {Error} Cuando el campo está vacío o no tiene formato válido.
 */
const leerFechaRequerida = (valor, nombre) => {
  const fecha = leerFechaOpcional(valor, nombre);
  if (fecha === null) {
    const error = new Error(`${nombre} es obligatorio.`);
    error.statusCode = 400;
    throw error;
  }
  return fecha;
};

/**
 * Obtiene ventas aplicando los filtros opcionales del listado.
 * @param {import('express').Request} req Solicitud HTTP con filtros en query.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía el listado de ventas como JSON.
 */
const getVentas = async (req, res) => {
  try {
    const numeroFactura = leerEnteroOpcional(
      req.query.numeroFactura,
      "numeroFactura",
      { min: 1 },
    );
    const metodoEntregaId = leerEnteroOpcional(
      req.query.metodoEntregaId,
      "metodoEntregaId",
      { min: 1 },
    );
    const fechaInicio = leerFechaOpcional(req.query.fechaInicio, "fechaInicio");
    const fechaFin = leerFechaOpcional(req.query.fechaFin, "fechaFin");
    const montoMinimo = leerNumeroOpcional(
      req.query.montoMinimo,
      "montoMinimo",
      { min: 0 },
    );
    const montoMaximo = leerNumeroOpcional(
      req.query.montoMaximo,
      "montoMaximo",
      { min: 0 },
    );
    const nombreCliente = req.query.nombreCliente?.trim() || null;

    const pool = await conectarBaseDatos();
    const resultado = await pool
      .request()
      .input("NumeroFactura", sql.Int, numeroFactura)
      .input("NombreCliente", sql.NVarChar(100), nombreCliente)
      .input("MetodoEntregaID", sql.Int, metodoEntregaId)
      .input("FechaInicio", sql.Date, fechaInicio)
      .input("FechaFin", sql.Date, fechaFin)
      .input("MontoMinimo", sql.Decimal(18, 2), montoMinimo)
      .input("MontoMaximo", sql.Decimal(18, 2), montoMaximo)
      .execute("ObtenerVentas");

    res.json(resultado.recordset);
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Obtiene el encabezado y las líneas de una factura.
 * @param {import('express').Request} req Solicitud con el ID de factura.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía el detalle o un error 404.
 */
const getVentaById = async (req, res) => {
  try {
    const invoiceId = leerIdRequerido(req.params.id, "InvoiceID");
    const pool = await conectarBaseDatos();
    const resultado = await pool
      .request()
      .input("InvoiceID", sql.Int, invoiceId)
      .execute("ObtenerDetalleVenta");

    if (!resultado.recordsets[0]?.length) {
      return res.status(404).json({ errorMsg: "Venta no encontrada." });
    }

    res.json({
      ...resultado.recordsets[0][0],
      Lineas: resultado.recordsets[1] || [],
    });
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Obtiene los catálogos necesarios para el formulario de ventas.
 * @param {import('express').Request} req Solicitud HTTP.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía clientes, métodos, personas, productos y empaques.
 */
const getOpcionesVenta = async (req, res) => {
  try {
    const pool = await conectarBaseDatos();
    const resultado = await pool
      .request()
      .execute("ObtenerOpcionesFormularioVenta");

    res.json({
      clientes: resultado.recordsets[0] || [],
      metodosEntrega: resultado.recordsets[1] || [],
      personas: resultado.recordsets[2] || [],
      productos: resultado.recordsets[3] || [],
      empaques: resultado.recordsets[4] || [],
    });
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Crea el encabezado de una venta.
 * @param {import('express').Request} req Solicitud HTTP con los datos del encabezado.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía el número de factura generado.
 */
const crearVenta = async (req, res) => {
  try {
    const {
      CustomerID,
      BillToCustomerID,
      DeliveryMethodID,
      ContactPersonID,
      AccountsPersonID,
      SalespersonPersonID,
      PackedByPersonID,
      InvoiceDate,
      CustomerPurchaseOrderNumber,
      DeliveryInstructions,
    } = req.body;

    const pool = await conectarBaseDatos();
    const resultado = await pool
      .request()
      .input("CustomerID", sql.Int, leerIdRequerido(CustomerID, "CustomerID"))
      .input(
        "BillToCustomerID",
        sql.Int,
        leerIdRequerido(BillToCustomerID, "BillToCustomerID"),
      )
      .input(
        "DeliveryMethodID",
        sql.Int,
        leerIdRequerido(DeliveryMethodID, "DeliveryMethodID"),
      )
      .input(
        "ContactPersonID",
        sql.Int,
        leerIdRequerido(ContactPersonID, "ContactPersonID"),
      )
      .input(
        "AccountsPersonID",
        sql.Int,
        leerIdRequerido(AccountsPersonID, "AccountsPersonID"),
      )
      .input(
        "SalespersonPersonID",
        sql.Int,
        leerIdRequerido(SalespersonPersonID, "SalespersonPersonID"),
      )
      .input(
        "PackedByPersonID",
        sql.Int,
        leerIdRequerido(PackedByPersonID, "PackedByPersonID"),
      )
      .input(
        "InvoiceDate",
        sql.Date,
        leerFechaRequerida(InvoiceDate, "InvoiceDate"),
      )
      .input(
        "CustomerPurchaseOrderNumber",
        sql.NVarChar(20),
        CustomerPurchaseOrderNumber || null,
      )
      .input(
        "DeliveryInstructions",
        sql.NVarChar(sql.MAX),
        DeliveryInstructions || null,
      )
      .execute("InsertarEncabezadoVenta");

    res.status(201).json({
      message: "Encabezado de venta creado exitosamente.",
      NumeroFactura: resultado.recordset[0]?.NumeroFactura,
    });
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Agrega una línea de producto a una factura existente.
 * @param {import('express').Request} req IDs de factura y datos de la línea.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía el ID de línea generado.
 */
const crearLineaVenta = async (req, res) => {
  try {
    const { StockItemID, PackageTypeID, Cantidad, PrecioUnitario, ImpuestoAplicado } =
      req.body;
    const cantidad = leerEnteroOpcional(Cantidad, "Cantidad", { min: 1 });
    const precioUnitario = leerNumeroOpcional(
      PrecioUnitario,
      "PrecioUnitario",
      { min: 0 },
    );
    const impuestoAplicado = leerNumeroOpcional(
      ImpuestoAplicado,
      "ImpuestoAplicado",
      { min: 0 },
    );
    if (cantidad === null || precioUnitario === null || impuestoAplicado === null) {
      const error = new Error("Complete cantidad, precio e impuesto de la línea.");
      error.statusCode = 400;
      throw error;
    }

    const pool = await conectarBaseDatos();
    const resultado = await pool
      .request()
      .input("InvoiceID", sql.Int, leerIdRequerido(req.params.id, "InvoiceID"))
      .input("StockItemID", sql.Int, leerIdRequerido(StockItemID, "StockItemID"))
      .input(
        "PackageTypeID",
        sql.Int,
        leerIdRequerido(PackageTypeID, "PackageTypeID"),
      )
      .input("Cantidad", sql.Int, cantidad)
      .input("PrecioUnitario", sql.Decimal(18, 2), precioUnitario)
      .input("ImpuestoAplicado", sql.Decimal(18, 3), impuestoAplicado)
      .execute("InsertarLineaVenta");

    res.status(201).json({
      message: "Línea de venta agregada exitosamente.",
      ...resultado.recordset[0],
    });
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Actualiza el encabezado de una venta existente.
 * @param {import('express').Request} req ID de factura y datos del encabezado.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía una confirmación de actualización.
 */
const actualizarVenta = async (req, res) => {
  try {
    const {
      CustomerID,
      BillToCustomerID,
      DeliveryMethodID,
      ContactPersonID,
      AccountsPersonID,
      SalespersonPersonID,
      PackedByPersonID,
      InvoiceDate,
      CustomerPurchaseOrderNumber,
      DeliveryInstructions,
    } = req.body;

    const pool = await conectarBaseDatos();
    await pool
      .request()
      .input("InvoiceID", sql.Int, leerIdRequerido(req.params.id, "InvoiceID"))
      .input(
        "CustomerID",
        sql.Int,
        leerEnteroOpcional(CustomerID, "CustomerID", { min: 1 }),
      )
      .input(
        "BillToCustomerID",
        sql.Int,
        leerEnteroOpcional(BillToCustomerID, "BillToCustomerID", { min: 1 }),
      )
      .input(
        "DeliveryMethodID",
        sql.Int,
        leerEnteroOpcional(DeliveryMethodID, "DeliveryMethodID", { min: 1 }),
      )
      .input(
        "ContactPersonID",
        sql.Int,
        leerEnteroOpcional(ContactPersonID, "ContactPersonID", { min: 1 }),
      )
      .input(
        "AccountsPersonID",
        sql.Int,
        leerEnteroOpcional(AccountsPersonID, "AccountsPersonID", { min: 1 }),
      )
      .input(
        "SalespersonPersonID",
        sql.Int,
        leerEnteroOpcional(SalespersonPersonID, "SalespersonPersonID", {
          min: 1,
        }),
      )
      .input(
        "PackedByPersonID",
        sql.Int,
        leerEnteroOpcional(PackedByPersonID, "PackedByPersonID", { min: 1 }),
      )
      .input(
        "InvoiceDate",
        sql.Date,
        leerFechaOpcional(InvoiceDate, "InvoiceDate"),
      )
      .input(
        "CustomerPurchaseOrderNumber",
        sql.NVarChar(20),
        CustomerPurchaseOrderNumber || null,
      )
      .input(
        "DeliveryInstructions",
        sql.NVarChar(sql.MAX),
        DeliveryInstructions || null,
      )
      .execute("ModificarEncabezadoVenta");

    res.json({ message: "Encabezado de venta actualizado exitosamente." });
  } catch (error) {
    manejarError(res, error);
  }
};

/**
 * Actualiza una línea existente de una venta.
 * @param {import('express').Request} req ID de línea y datos actualizados.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {Promise<void>} Envía los IDs de factura y de línea.
 */
const actualizarLineaVenta = async (req, res) => {
  try {
    const { StockItemID, PackageTypeID, Cantidad, PrecioUnitario, ImpuestoAplicado } =
      req.body;
    const cantidad = leerEnteroOpcional(Cantidad, "Cantidad", { min: 1 });
    const precioUnitario = leerNumeroOpcional(
      PrecioUnitario,
      "PrecioUnitario",
      { min: 0 },
    );
    const impuestoAplicado = leerNumeroOpcional(
      ImpuestoAplicado,
      "ImpuestoAplicado",
      { min: 0 },
    );
    if (cantidad === null || precioUnitario === null || impuestoAplicado === null) {
      const error = new Error("Complete cantidad, precio e impuesto de la línea.");
      error.statusCode = 400;
      throw error;
    }

    const invoiceId = leerIdRequerido(req.params.id, "InvoiceID");
    const invoiceLineId = leerIdRequerido(req.params.lineId, "InvoiceLineID");
    const pool = await conectarBaseDatos();
    const lineaExistente = await pool
      .request()
      .input("InvoiceLineID", sql.Int, invoiceLineId)
      .query(
        "SELECT InvoiceID FROM syn_LineasFactura WHERE InvoiceLineID = @InvoiceLineID",
      );

    if (!lineaExistente.recordset.length) {
      return res.status(404).json({ errorMsg: "Línea de venta no encontrada." });
    }
    if (lineaExistente.recordset[0].InvoiceID !== invoiceId) {
      const error = new Error("La línea no pertenece a la factura indicada.");
      error.statusCode = 400;
      throw error;
    }

    const resultado = await pool
      .request()
      .input(
        "InvoiceLineID",
        sql.Int,
        invoiceLineId,
      )
      .input("StockItemID", sql.Int, leerIdRequerido(StockItemID, "StockItemID"))
      .input(
        "PackageTypeID",
        sql.Int,
        leerIdRequerido(PackageTypeID, "PackageTypeID"),
      )
      .input("Cantidad", sql.Int, cantidad)
      .input("PrecioUnitario", sql.Decimal(18, 2), precioUnitario)
      .input("ImpuestoAplicado", sql.Decimal(18, 3), impuestoAplicado)
      .execute("ModificarLineaVenta");

    res.json(resultado.recordset[0]);
  } catch (error) {
    manejarError(res, error);
  }
};

module.exports = {
  getVentas,
  getVentaById,
  getOpcionesVenta,
  crearVenta,
  crearLineaVenta,
  actualizarVenta,
  actualizarLineaVenta,
};
