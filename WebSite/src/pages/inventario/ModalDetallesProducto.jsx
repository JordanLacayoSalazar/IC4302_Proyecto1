import { Typography, Box, Divider, Button } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import ScaleIcon from "@mui/icons-material/Scale";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import WarehouseIcon from "@mui/icons-material/Warehouse";

import CampoDetalle from "../../components/CampoDetalle";
import ModalInterfazBase from "../../components/ModalInterfazBase";

export default function ModalDetallesProducto({ abierto, onClose, producto }) {
  if (!producto) return null;

  return (
    <ModalInterfazBase
      abierto={abierto}
      onClose={onClose}
      titulo="Detalles del Producto"
      descripcion="Información completa del artículo en inventario"
      Icono={InventoryIcon}
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
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#1e293b", mb: 1.5, textAlign: "left" }}
        >
          Información Principal
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
            mb: 3,
          }}
        >
          <CampoDetalle
            icono={<InventoryIcon fontSize="small" />}
            etiqueta="Nombre del producto"
            valor={producto.NombreProducto}
          />
          <CampoDetalle
            icono={<BusinessIcon fontSize="small" />}
            etiqueta="Proveedor"
            valor={producto.Proveedor}
          />
          <CampoDetalle
            icono={<LocalOfferIcon fontSize="small" />}
            etiqueta="Marca"
            valor={producto.Marca}
          />
          <CampoDetalle
            icono={<CategoryIcon fontSize="small" />}
            etiqueta="Talla / Tamaño"
            valor={producto.Talla}
          />
          <CampoDetalle
            icono={<ColorLensIcon fontSize="small" />}
            etiqueta="Color"
            valor={producto.Color}
          />
          <CampoDetalle
            icono={<ScaleIcon fontSize="small" />}
            etiqueta="Peso (Kg)"
            valor={producto.Peso}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#1e293b", mb: 1.5, textAlign: "left" }}
        >
          Empaquetamiento y Logística
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
            mb: 3,
          }}
        >
          <CampoDetalle
            icono={<AllInboxIcon fontSize="small" />}
            etiqueta="Unidad de empaquetamiento"
            valor={producto.UnidadEmpaque}
          />
          <CampoDetalle
            icono={<AllInboxIcon fontSize="small" />}
            etiqueta="Empaquetamiento (Exterior)"
            valor={producto.EmpaqueExterior}
          />
          <CampoDetalle
            icono={<AllInboxIcon fontSize="small" />}
            etiqueta="Cantidad por empaque"
            valor={producto.CantidadEmpaque}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#1e293b", mb: 1.5, textAlign: "left" }}
        >
          Precios y Disponibilidad
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
            mb: 3,
          }}
        >
          <CampoDetalle
            icono={<AttachMoneyIcon fontSize="small" />}
            etiqueta="Precio Unitario"
            valor={`$${producto.PrecioUnitario}`}
          />
          <CampoDetalle
            icono={<AttachMoneyIcon fontSize="small" />}
            etiqueta="Precio de Venta (RRP)"
            valor={`$${producto.PrecioVenta}`}
          />
          <CampoDetalle
            icono={<AttachMoneyIcon fontSize="small" />}
            etiqueta="Impuesto"
            valor={`${producto.Impuesto}%`}
          />
          <CampoDetalle
            icono={<WarehouseIcon fontSize="small" />}
            etiqueta="Cantidad Disponible"
            valor={producto.CantidadDisponible}
          />
          <CampoDetalle
            icono={<WarehouseIcon fontSize="small" />}
            etiqueta="Ubicación (Bin)"
            valor={producto.Ubicacion}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5 }}>
          <CampoDetalle
            icono={<InventoryIcon fontSize="small" />}
            etiqueta="Palabras Claves de Búsqueda"
            valor={producto.PalabrasClaves}
          />
        </Box>
      </Box>
    </ModalInterfazBase>
  );
}
