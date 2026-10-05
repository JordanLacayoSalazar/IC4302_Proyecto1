import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from '@mui/icons-material/Delete';
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ModalInterfazBase from "../../components/ModalInterfazBase";

const LINEA_VACIA = {
  InvoiceLineID: null,
  StockItemID: "",
  PackageTypeID: "",
  Cantidad: 1,
  PrecioUnitario: "",
  ImpuestoAplicado: "",
};

const fechaHoy = () => {
  const hoy = new Date();
  const zonaHoraria = hoy.getTimezoneOffset() * 60000;
  return new Date(hoy.getTime() - zonaHoraria).toISOString().slice(0, 10);
};

/**
 * Construye los valores editables del encabezado desde un detalle de factura.
 * @param {object|null} venta Detalle de venta cargado o null para una nueva.
 * @returns {object} Valores iniciales del formulario de encabezado.
 */
const crearEncabezadoInicial = (venta) => ({
  CustomerID: venta?.CustomerID ?? "",
  BillToCustomerID: venta?.BillToCustomerID ?? "",
  DeliveryMethodID: venta?.DeliveryMethodID ?? "",
  ContactPersonID: venta?.ContactPersonID ?? "",
  AccountsPersonID: venta?.AccountsPersonID ?? "",
  SalespersonPersonID: venta?.SalespersonPersonID ?? "",
  PackedByPersonID: venta?.PackedByPersonID ?? "",
  InvoiceDate: venta?.FechaFactura
    ? String(venta.FechaFactura).slice(0, 10)
    : fechaHoy(),
  CustomerPurchaseOrderNumber: venta?.NumeroOrdenCompra ?? "",
  DeliveryInstructions: venta?.InstruccionesEntrega ?? "",
});

/**
 * Construye líneas editables a partir del detalle de una factura.
 * @param {object|null} venta Detalle de venta cargado o null para una nueva.
 * @returns {Array<object>} Líneas existentes o una línea vacía para empezar.
 */
const crearLineasIniciales = (venta) =>
  venta?.Lineas?.length
    ? venta.Lineas.map((linea) => ({
        InvoiceLineID: linea.InvoiceLineID,
        StockItemID: linea.StockItemID,
        PackageTypeID: linea.PackageTypeID ?? "",
        Cantidad: linea.Cantidad,
        PrecioUnitario: linea.PrecioUnitario,
        ImpuestoAplicado: linea.ImpuestoAplicado,
      }))
    : [{ ...LINEA_VACIA }];

/**
 * Renderiza el formulario de encabezado y líneas de una factura.
 * @param {object} props Venta existente, catálogos y acciones del modal.
 * @param {boolean} props.abierto Indica si el formulario está visible.
 * @param {Function} props.onClose Cierra el modal.
 * @param {object|null} props.venta Detalle de la factura para editar.
 * @param {object} props.opciones Catálogos para campos relacionados.
 * @param {Function} props.onGuardar Guarda encabezado y líneas de la venta.
 * @returns {JSX.Element} Formulario de ventas.
 */
export default function ModalFormularioVentas({
  abierto,
  onClose,
  venta,
  opciones,
  onGuardar,
}) {
  const [invoiceId, setInvoiceId] = useState(() => venta?.NumeroFactura || null);
  const [encabezado, setEncabezado] = useState(() =>
    crearEncabezadoInicial(venta),
  );
  const [lineas, setLineas] = useState(() => crearLineasIniciales(venta));
  const [errorValidacion, setErrorValidacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  /**
   * Actualiza un campo del encabezado de la factura.
   * @param {import('react').ChangeEvent<HTMLInputElement>} evento Cambio del campo.
   */
  const manejarCambioEncabezado = (evento) => {
    const { name, value } = evento.target;
    const camposId = [
      "CustomerID",
      "BillToCustomerID",
      "DeliveryMethodID",
      "ContactPersonID",
      "AccountsPersonID",
      "SalespersonPersonID",
      "PackedByPersonID",
    ];
    setEncabezado((anterior) => ({
      ...anterior,
      [name]: camposId.includes(name) && value ? Number(value) : value,
    }));
    setErrorValidacion("");
  };

  /**
   * Actualiza un dato de una línea de producto.
   * Al elegir un producto, completa precio e impuesto con sus valores actuales.
   * @param {number} indice Posición de la línea.
   * @param {string} campo Propiedad modificada.
   * @param {string|number} valor Nuevo valor.
   */
  const manejarCambioLinea = (indice, campo, valor) => {
    setLineas((anteriores) =>
      anteriores.map((linea, posicion) => {
        if (posicion !== indice) return linea;
        if (campo === "StockItemID") {
          const producto = opciones.productos.find(
            (item) => item.StockItemID === Number(valor),
          );
          return {
            ...linea,
            StockItemID: valor ? Number(valor) : "",
            PrecioUnitario: producto?.UnitPrice ?? "",
            ImpuestoAplicado: producto?.TaxRate ?? "",
          };
        }
        const esId = campo === "PackageTypeID";
        return {
          ...linea,
          [campo]: esId && valor ? Number(valor) : valor,
        };
      }),
    );
    setErrorValidacion("");
  };

  /**
   * Valida y envía encabezado y líneas al módulo padre.
   * Conserva IDs devueltos si una línea falla para permitir reintentar.
   */
  const guardarFormulario = async () => {
    const camposObligatorios = [
      "CustomerID",
      "BillToCustomerID",
      "DeliveryMethodID",
      "ContactPersonID",
      "AccountsPersonID",
      "SalespersonPersonID",
      "PackedByPersonID",
      "InvoiceDate",
    ];
    if (
      camposObligatorios.some(
        (campo) => String(encabezado[campo] ?? "").trim() === "",
      )
    ) {
      setErrorValidacion("Complete todos los campos obligatorios del encabezado.");
      return;
    }

    const lineaInvalida = lineas.some((linea) => {
      const cantidad = Number(linea.Cantidad);
      const precio = Number(linea.PrecioUnitario);
      const impuesto = Number(linea.ImpuestoAplicado);
      return (
        !linea.StockItemID ||
        !linea.PackageTypeID ||
        !Number.isInteger(cantidad) ||
        cantidad < 1 ||
        linea.PrecioUnitario === "" ||
        !Number.isFinite(precio) ||
        precio < 0 ||
        linea.ImpuestoAplicado === "" ||
        !Number.isFinite(impuesto) ||
        impuesto < 0
      );
    });
    if (!lineas.length || lineaInvalida) {
      setErrorValidacion(
        "Complete producto, empaque, cantidad, precio e impuesto de cada línea.",
      );
      return;
    }

    setGuardando(true);
    setErrorValidacion("");
    try {
      const resultado = await onGuardar({
        invoiceId,
        encabezado,
        lineas,
      });
      if (resultado?.invoiceId) setInvoiceId(resultado.invoiceId);
      if (resultado?.lineas) setLineas(resultado.lineas);
      if (resultado?.completo) onClose();
      else {
        setErrorValidacion(
          "No se pudo completar el guardado. Si ya se creó el encabezado, su número se conserva para reintentar.",
        );
      }
    } finally {
      setGuardando(false);
    }
  };

  const opcionesPersonas = opciones.personas || [];
  const opcionesClientes = opciones.clientes || [];
  const titulo = invoiceId ? "Editar venta" : "Registrar venta";

  return (
    <ModalInterfazBase
      abierto={abierto}
      onClose={guardando ? () => {} : onClose}
      titulo={titulo}
      descripcion="Complete la factura y sus productos"
      Icono={PointOfSaleIcon}
      maxWidth="lg"
      contenidoSx={{ p: { xs: 2, md: 3 } }}
      acciones={
        <>
          <Button
            onClick={onClose}
            disabled={guardando}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={guardarFormulario}
            disabled={guardando}
            variant="contained"
            startIcon={<PointOfSaleIcon />}
            sx={{ textTransform: "none", boxShadow: "none" }}
          >
            {guardando ? "Guardando..." : "Guardar venta"}
          </Button>
        </>
      }
    >
      <Stack spacing={3}>
        {errorValidacion && <Alert severity="error">{errorValidacion}</Alert>}
        {invoiceId && (
          <TextField
            label="Número de factura"
            value={invoiceId}
            size="small"
            disabled
            sx={{ maxWidth: 260, backgroundColor: "white" }}
          />
        )}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            Encabezado de factura
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            {[
              ["CustomerID", "Cliente"],
              ["BillToCustomerID", "Cliente por facturar"],
            ].map(([name, label]) => (
              <TextField
                key={name}
                select
                required
                name={name}
                label={label}
                value={encabezado[name] ?? ""}
                onChange={manejarCambioEncabezado}
                sx={{ backgroundColor: "white" }}
              >
                <MenuItem value="">Seleccione un cliente</MenuItem>
                {opcionesClientes.map((cliente) => (
                  <MenuItem key={cliente.CustomerID} value={cliente.CustomerID}>
                    {cliente.CustomerName}
                  </MenuItem>
                ))}
              </TextField>
            ))}
            <TextField
              select
              required
              name="DeliveryMethodID"
              label="Método de entrega"
              value={encabezado.DeliveryMethodID ?? ""}
              onChange={manejarCambioEncabezado}
              sx={{ backgroundColor: "white" }}
            >
              <MenuItem value="">Seleccione un método</MenuItem>
              {(opciones.metodosEntrega || []).map((metodo) => (
                <MenuItem
                  key={metodo.DeliveryMethodID}
                  value={metodo.DeliveryMethodID}
                >
                  {metodo.DeliveryMethodName}
                </MenuItem>
              ))}
            </TextField>
            {[
              ["ContactPersonID", "Persona de contacto"],
              ["AccountsPersonID", "Persona de cuentas"],
              ["SalespersonPersonID", "Vendedor"],
              ["PackedByPersonID", "Preparado por"],
            ].map(([name, label]) => (
              <TextField
                key={name}
                select
                required
                name={name}
                label={label}
                value={encabezado[name] ?? ""}
                onChange={manejarCambioEncabezado}
                sx={{ backgroundColor: "white" }}
              >
                <MenuItem value="">Seleccione una persona</MenuItem>
                {opcionesPersonas.map((persona) => (
                  <MenuItem key={persona.PersonID} value={persona.PersonID}>
                    {persona.FullName}
                  </MenuItem>
                ))}
              </TextField>
            ))}
            <TextField
              required
              type="date"
              name="InvoiceDate"
              label="Fecha de factura"
              value={encabezado.InvoiceDate ?? ""}
              onChange={manejarCambioEncabezado}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ backgroundColor: "white" }}
            />
            <TextField
              name="CustomerPurchaseOrderNumber"
              label="Número de orden de compra"
              value={encabezado.CustomerPurchaseOrderNumber ?? ""}
              onChange={manejarCambioEncabezado}
              slotProps={{ htmlInput: { maxLength: 20 } }}
              sx={{ backgroundColor: "white" }}
            />
            <TextField
              name="DeliveryInstructions"
              label="Instrucciones de entrega"
              value={encabezado.DeliveryInstructions ?? ""}
              onChange={manejarCambioEncabezado}
              multiline
              minRows={2}
              sx={{ gridColumn: { sm: "span 2" }, backgroundColor: "white" }}
            />
          </Box>
        </Box>

        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Líneas de venta
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() => setLineas((anteriores) => [...anteriores, { ...LINEA_VACIA }])}
              sx={{ textTransform: "none", alignSelf: { xs: "flex-start", sm: "auto" } }}
            >
              Agregar producto
            </Button>
          </Stack>
          <Stack spacing={1.5}>
            {lineas.map((linea, indice) => (
              <Box
                key={linea.InvoiceLineID || `nueva-${indice}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    lg: "2fr 1.5fr 0.8fr 1fr 0.8fr auto",
                  },
                  gap: 1,
                  p: 1.5,
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  backgroundColor: "white",
                }}
              >
                <TextField
                  select
                  label="Producto"
                  size="small"
                  value={linea.StockItemID ?? ""}
                  onChange={(event) =>
                    manejarCambioLinea(indice, "StockItemID", event.target.value)
                  }
                  sx={{ gridColumn: { xs: "span 2", lg: "auto" } }}
                >
                  <MenuItem value="">Seleccione un producto</MenuItem>
                  {(opciones.productos || []).map((producto) => (
                    <MenuItem
                      key={producto.StockItemID}
                      value={producto.StockItemID}
                    >
                      {producto.StockItemName}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Empaque"
                  size="small"
                  value={linea.PackageTypeID ?? ""}
                  onChange={(event) =>
                    manejarCambioLinea(indice, "PackageTypeID", event.target.value)
                  }
                >
                  <MenuItem value="">Seleccione empaque</MenuItem>
                  {(opciones.empaques || []).map((empaque) => (
                    <MenuItem
                      key={empaque.PackageTypeID}
                      value={empaque.PackageTypeID}
                    >
                      {empaque.PackageTypeName}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Cantidad"
                  type="number"
                  size="small"
                  value={linea.Cantidad ?? ""}
                  onChange={(event) =>
                    manejarCambioLinea(indice, "Cantidad", event.target.value)
                  }
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                />
                <TextField
                  label="Precio unitario"
                  type="number"
                  size="small"
                  value={linea.PrecioUnitario ?? ""}
                  onChange={(event) =>
                    manejarCambioLinea(indice, "PrecioUnitario", event.target.value)
                  }
                  slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                />
                <TextField
                  label="Impuesto (%)"
                  type="number"
                  size="small"
                  value={linea.ImpuestoAplicado ?? ""}
                  onChange={(event) =>
                    manejarCambioLinea(indice, "ImpuestoAplicado", event.target.value)
                  }
                  slotProps={{ htmlInput: { min: 0, step: "0.001" } }}
                />
                {!linea.InvoiceLineID && (
                  <IconButton
                    aria-label="Quitar línea nueva"
                    title="Quitar línea nueva"
                    onClick={() =>
                      setLineas((anteriores) =>
                        anteriores.filter((_, posicion) => posicion !== indice),
                      )
                    }
                    disabled={lineas.length === 1}
                    color="error"
                    sx={{ gridColumn: { xs: "span 2", lg: "auto" } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
          </Stack>
          {lineas.some((linea) => linea.InvoiceLineID) && (
            <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#64748b" }}>
              Las líneas existentes se pueden editar, pero no eliminar.
            </Typography>
          )}
        </Box>
      </Stack>
    </ModalInterfazBase>
  );
}
