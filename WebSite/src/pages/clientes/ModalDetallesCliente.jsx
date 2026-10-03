import { Box, Button, Divider, Link, Typography } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import LanguageIcon from "@mui/icons-material/Language";
import PaymentsIcon from "@mui/icons-material/Payments";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CampoDetalle from "../../components/CampoDetalle";
import MapaUbicacion from "../../components/MapaUbicacion";
import ModalInterfazBase from "../../components/ModalInterfazBase";

const obtenerEnlaceSitioWeb = (sitioWeb) => {
  if (!sitioWeb) {
    return null;
  }

  let enlace;
  try {
    enlace = new URL(
      sitioWeb.startsWith("http://") || sitioWeb.startsWith("https://")
        ? sitioWeb
        : `https://${sitioWeb}`,
    );
  } catch {
    return null;
  }

  if (enlace.protocol !== "http:" && enlace.protocol !== "https:") {
    return null;
  }

  return enlace.href;
};

export default function ModalDetallesCliente({
  abierto,
  onClose,
  cliente,
}) {
  if (!cliente) {
    return null;
  }

  const enlaceSitioWeb = obtenerEnlaceSitioWeb(cliente.SitioWeb);

  let valorSitioWeb;
  if (enlaceSitioWeb) {
    valorSitioWeb = (
      <Link
        href={enlaceSitioWeb}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        {cliente.SitioWeb}
      </Link>
    );
  } else {
    valorSitioWeb = cliente.SitioWeb;
  }

  return (
    <ModalInterfazBase
      abierto={abierto}
      onClose={onClose}
      titulo="Detalles del cliente"
      descripcion="Información completa del cliente"
      Icono={GroupsOutlinedIcon}
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
            icono={<GroupsOutlinedIcon fontSize="small" />}
            etiqueta="Nombre"
            valor={cliente.NombreCliente}
          />
          <CampoDetalle
            icono={<CategoryIcon fontSize="small" />}
            etiqueta="Categoría"
            valor={cliente.Categoria}
          />
          <CampoDetalle
            icono={<GroupsOutlinedIcon fontSize="small" />}
            etiqueta="Grupo de compra"
            valor={cliente.GrupoCompra}
          />
          <CampoDetalle
            icono={<PaymentsIcon fontSize="small" />}
            etiqueta="Días de gracia para pagar"
            valor={cliente.DiasGracia}
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
            valor={cliente.ContactoPrimario}
          />
          <CampoDetalle
            icono={<PersonIcon fontSize="small" />}
            etiqueta="Contacto alternativo"
            valor={cliente.ContactoAlternativo}
          />
          <CampoDetalle
            icono={<PhoneIcon fontSize="small" />}
            etiqueta="Teléfono"
            valor={cliente.Telefono}
          />
          <CampoDetalle
            icono={<PhoneIcon fontSize="small" />}
            etiqueta="Fax"
            valor={cliente.Fax}
          />
          <CampoDetalle
            icono={<LanguageIcon fontSize="small" />}
            etiqueta="Sitio web"
            valor={valorSitioWeb}
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
            icono={<PersonIcon fontSize="small" />}
            etiqueta="Cliente por facturar"
            valor={cliente.ClienteFacturacion}
          />
          <CampoDetalle
            icono={<LocalShippingIcon fontSize="small" />}
            etiqueta="Método de entrega"
            valor={cliente.MetodoEntrega}
          />
          <CampoDetalle
            icono={<LocationCityIcon fontSize="small" />}
            etiqueta="Ciudad de entrega"
            valor={cliente.CiudadEntrega}
          />
          <CampoDetalle
            icono={<LocationCityIcon fontSize="small" />}
            etiqueta="Código postal"
            valor={cliente.CodigoPostal}
          />
          <CampoDetalle
            icono={<LocationCityIcon fontSize="small" />}
            etiqueta="Dirección de entrega"
            valor={cliente.DireccionEntrega}
          />
          <CampoDetalle
            icono={<LocationCityIcon fontSize="small" />}
            etiqueta="Dirección postal"
            valor={cliente.DireccionPostal}
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
          Ubicación
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          <CampoDetalle
            icono={<LocationOnIcon fontSize="small" />}
            etiqueta="Coordenadas"
            valor={cliente.LocalizacionEntrega}
          />
        </Box>
        <MapaUbicacion
          latitud={cliente.Latitud}
          longitud={cliente.Longitud}
          titulo="Mapa de ubicación de entrega del cliente"
          alto={300}
          sx={{ mt: 1.5 }}
        />
      </Box>
    </ModalInterfazBase>
  );
}
