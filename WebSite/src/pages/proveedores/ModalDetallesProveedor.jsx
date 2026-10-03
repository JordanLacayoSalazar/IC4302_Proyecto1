import {
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import LanguageIcon from "@mui/icons-material/Language";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentsIcon from "@mui/icons-material/Payments";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CampoDetalle from "../../components/CampoDetalle";
import ModalInterfazBase from "../../components/ModalInterfazBase";

export default function ModalDetallesProveedor({
  abierto,
  onClose,
  proveedor,
}) {
  if (!proveedor) return null;

  return (
    <ModalInterfazBase
      abierto={abierto}
      onClose={onClose}
      titulo="Detalles del Proveedor"
      descripcion="Información completa del proveedor"
      Icono={BusinessIcon}
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
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              mb: 1.5,
              textAlign: "left",
            }}
          >
            Información general
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
              icono={<BusinessIcon fontSize="small" />}
              etiqueta="Código"
              valor={proveedor.CodigoProveedor}
            />
            <CampoDetalle
              icono={<BusinessIcon fontSize="small" />}
              etiqueta="Nombre"
              valor={proveedor.NombreProveedor}
            />
            <CampoDetalle
              icono={<CategoryIcon fontSize="small" />}
              etiqueta="Categoría"
              valor={proveedor.Categoria}
            />
            <CampoDetalle
              icono={<PaymentsIcon fontSize="small" />}
              etiqueta="Días de gracia"
              valor={proveedor.DiasGracia}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              mb: 1.5,
              textAlign: "left",
            }}
          >
            Información de contacto
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
              icono={<PersonIcon fontSize="small" />}
              etiqueta="Contacto primario"
              valor={proveedor.ContactoPrimario}
            />
            <CampoDetalle
              icono={<PersonIcon fontSize="small" />}
              etiqueta="Contacto alternativo"
              valor={proveedor.ContactoAlternativo}
            />
            <CampoDetalle
              icono={<PhoneIcon fontSize="small" />}
              etiqueta="Teléfono"
              valor={proveedor.Telefono}
            />
            <CampoDetalle
              icono={<LanguageIcon fontSize="small" />}
              etiqueta="Sitio web"
              valor={proveedor.SitioWeb}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              mb: 1.5,
              textAlign: "left",
            }}
          >
            Información de entrega
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
              icono={<LocalShippingIcon fontSize="small" />}
              etiqueta="Método de entrega"
              valor={proveedor.MetodoEntrega}
            />
            <CampoDetalle
              icono={<LocationCityIcon fontSize="small" />}
              etiqueta="Ciudad de entrega"
              valor={proveedor.CiudadEntrega}
            />
            <CampoDetalle
              icono={<LocationCityIcon fontSize="small" />}
              etiqueta="Código postal"
              valor={proveedor.CodigoPostal}
            />
            <CampoDetalle
              icono={<LocationCityIcon fontSize="small" />}
              etiqueta="Dirección"
              valor={proveedor.Direccion}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              mb: 1.5,
              textAlign: "left",
            }}
          >
            Información bancaria
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <CampoDetalle
              icono={<AccountBalanceIcon fontSize="small" />}
              etiqueta="Banco"
              valor={proveedor.NombreBanco}
            />
            <CampoDetalle
              icono={<AccountBalanceIcon fontSize="small" />}
              etiqueta="Cuenta corriente"
              valor={proveedor.CuentaCorriente}
            />
          </Box>
        </Box>
    </ModalInterfazBase>
  );
}
