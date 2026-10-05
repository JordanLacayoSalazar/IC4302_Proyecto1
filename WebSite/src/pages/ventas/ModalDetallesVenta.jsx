import {
  Box,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Link,
} from "@mui/material";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CampoDetalle from "../../components/CampoDetalle";
import ModalInterfazBase from "../../components/ModalInterfazBase";

const formatearDinero = (valor) =>
  `$${Number(valor || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Formatea una fecha de base de datos sin cambiar su día calendario.
 * @param {string|Date|null|undefined} fecha Fecha recibida.
 * @returns {string|null} Fecha legible o null si no se indicó.
 */
const formatearFecha = (fecha) => {
  if (!fecha) return null;
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha));
  const fechaLocal = partes
    ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]))
    : new Date(fecha);
  return fechaLocal.toLocaleDateString();
};

/**
 * Presenta los datos del encabezado y las líneas de una factura.
 * @param {object} props Estado del modal y detalle de la venta.
 * @param {boolean} props.abierto Indica si el modal está visible.
 * @param {Function} props.onClose Cierra el modal.
 * @param {object|null} props.venta Encabezado y líneas de la factura.
 * @returns {JSX.Element|null} Detalle de la venta o null si no hay datos.
 */
export default function ModalDetallesVenta({
  abierto,
  onClose,
  venta,
  onAbrirCliente,
  onAbrirProducto,
}) {
  if (!venta) return null;

  const lineas = venta.Lineas || [];

  return (
    <ModalInterfazBase
      abierto={abierto}
      onClose={onClose}
      titulo={`Factura ${venta.NumeroFactura}`}
      descripcion="Detalle de la venta"
      Icono={PointOfSaleIcon}
      maxWidth="md"
      contenidoSx={{ p: { xs: 2, md: 3 } }}
      acciones={
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
        >
          Cerrar
        </Button>
      }
    >
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          Encabezado
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          <CampoDetalle
            icono={<PointOfSaleIcon fontSize="small" />}
            etiqueta="Número de factura"
            valor={venta.NumeroFactura}
          />
          <CampoDetalle
            icono={<PersonIcon fontSize="small" />}
            etiqueta="Cliente"
            valor={
              <Link
                component="button"
                type="button"
                underline="hover"
                onClick={() => onAbrirCliente(venta.CustomerID)}
              >
                {venta.Cliente}
              </Link>
            }
          />
          <CampoDetalle
            icono={<LocalShippingIcon fontSize="small" />}
            etiqueta="Método de entrega"
            valor={venta.MetodoEntrega}
          />
          <CampoDetalle
            icono={<CalendarMonthIcon fontSize="small" />}
            etiqueta="Fecha de factura"
            valor={formatearFecha(venta.FechaFactura)}
          />
          <CampoDetalle
            icono={<PersonIcon fontSize="small" />}
            etiqueta="Persona de contacto"
            valor={venta.PersonaContacto}
          />
          <CampoDetalle
            icono={<PersonIcon fontSize="small" />}
            etiqueta="Nombre del vendedor"
            valor={venta.Vendedor}
          />
          <CampoDetalle
            icono={<ShoppingBagIcon fontSize="small" />}
            etiqueta="Número de orden de compra"
            valor={venta.NumeroOrdenCompra}
          />
          <CampoDetalle
            icono={<LocalShippingIcon fontSize="small" />}
            etiqueta="Instrucciones"
            valor={venta.InstruccionesEntrega}
          />
        </Box>

        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          Productos
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
              {[
                "Producto",
                "Cantidad",
                "Precio unitario",
                "Impuesto aplicado",
                "Monto del impuesto",
                "Total línea",
              ].map((encabezado) => (
                <TableCell key={encabezado} sx={{ fontWeight: 700 }}>
                  {encabezado}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {lineas.length ? (
              lineas.map((linea) => (
                <TableRow key={linea.InvoiceLineID}>
                  <TableCell>
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      onClick={() => onAbrirProducto(linea.StockItemID)}
                    >
                      {linea.Producto}
                    </Link>
                  </TableCell>
                  <TableCell>{linea.Cantidad}</TableCell>
                  <TableCell>{formatearDinero(linea.PrecioUnitario)}</TableCell>
                  <TableCell>{`${linea.ImpuestoAplicado}%`}</TableCell>
                  <TableCell>{formatearDinero(linea.MontoImpuesto)}</TableCell>
                  <TableCell>{formatearDinero(linea.TotalLinea)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Esta factura no tiene líneas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </ModalInterfazBase>
  );
}
