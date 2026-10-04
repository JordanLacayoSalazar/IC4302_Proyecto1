import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CapturadorUbicacion from "../../components/CapturadorUbicacion";
import MapaUbicacion from "../../components/MapaUbicacion";
import ModalInterfazBase from "../../components/ModalInterfazBase";

const camposRelacionados = [
  {
    nombre: "CustomerCategoryID",
    etiqueta: "Categoría",
    opciones: "categorias",
    id: "CustomerCategoryID",
    texto: "CustomerCategoryName",
    requerido: true,
  },
  {
    nombre: "BuyingGroupID",
    etiqueta: "Grupo de compra",
    opciones: "gruposCompra",
    id: "BuyingGroupID",
    texto: "BuyingGroupName",
  },
  {
    nombre: "PrimaryContactPersonID",
    etiqueta: "Contacto primario",
    opciones: "contactos",
    id: "PersonID",
    texto: "FullName",
    requerido: true,
  },
  {
    nombre: "AlternateContactPersonID",
    etiqueta: "Contacto alternativo",
    opciones: "contactos",
    id: "PersonID",
    texto: "FullName",
  },
  {
    nombre: "BillToCustomerID",
    etiqueta: "Cliente por facturar",
    opciones: "clientesFacturacion",
    id: "CustomerID",
    texto: "CustomerName",
    requerido: true,
  },
  {
    nombre: "DeliveryMethodID",
    etiqueta: "Método de entrega",
    opciones: "metodosEntrega",
    id: "DeliveryMethodID",
    texto: "DeliveryMethodName",
    requerido: true,
  },
  {
    nombre: "DeliveryCityID",
    etiqueta: "Ciudad de entrega",
    opciones: "ciudades",
    id: "CityID",
    texto: "CityName",
    requerido: true,
  },
];

const camposContacto = [
  { nombre: "PhoneNumber", etiqueta: "Teléfono" },
  { nombre: "FaxNumber", etiqueta: "Fax" },
  {
    nombre: "PaymentDays",
    etiqueta: "Días de gracia para pagar",
    tipo: "number",
  },
  { nombre: "WebsiteURL", etiqueta: "Sitio web", tipo: "url" },
];

const camposDireccion = [
  {
    nombre: "DireccionEntrega",
    etiqueta: "Dirección de entrega",
    multiline: true,
  },
  { nombre: "DeliveryPostalCode", etiqueta: "Código postal" },
  {
    nombre: "DireccionPostal",
    etiqueta: "Dirección postal",
    multiline: true,
  },
];

export default function ModalFormularioCliente({
  abierto,
  onClose,
  modoEdicion,
  formData,
  opciones = {},
  manejarCambio,
  manejarUbicacionCapturada,
  guardarCliente,
}) {
  const [errorValidacion, setErrorValidacion] = useState("");
  let titulo;
  let descripcion;
  let textoBoton;

  if (modoEdicion) {
    titulo = "Editar cliente";
    descripcion = "Actualice la información del cliente";
    textoBoton = "Guardar cambios";
  } else {
    titulo = "Crear cliente";
    descripcion = "Complete los datos para registrar un cliente";
    textoBoton = "Crear cliente";
  }

  const guardarConValidacion = () => {
    const faltaNombre = !String(formData.CustomerName ?? "").trim();
    let faltaRelacionObligatoria = false;

    if (!modoEdicion) {
      faltaRelacionObligatoria = camposRelacionados.some(
        (campo) =>
          campo.requerido && !String(formData[campo.nombre] ?? "").trim(),
      );
    }

    if (faltaNombre || faltaRelacionObligatoria) {
      setErrorValidacion("Complete todos los campos obligatorios.");
      return;
    }

    setErrorValidacion("");
    guardarCliente();
  };

  const manejarCambioCampo = (evento) => {
    setErrorValidacion("");
    manejarCambio(evento);
  };

  return (
    <ModalInterfazBase
      abierto={abierto}
      onClose={onClose}
      titulo={titulo}
      descripcion={descripcion}
      Icono={GroupsOutlinedIcon}
      maxWidth="md"
      contenidoSx={{ p: { xs: 2, md: 4 } }}
      acciones={
        <>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              borderColor: "#cbd5e1",
              color: "#475569",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={guardarConValidacion}
            variant="contained"
            startIcon={<GroupsOutlinedIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              px: 2.5,
              boxShadow: "none",
            }}
          >
            {textoBoton}
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {errorValidacion && <Alert severity="error">{errorValidacion}</Alert>}

        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
          >
            Información general
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="Nombre del cliente"
              name="CustomerName"
              value={formData.CustomerName ?? ""}
              onChange={manejarCambioCampo}
              required
              fullWidth
              sx={{ backgroundColor: "white" }}
            />
            {camposRelacionados.map((campo) => (
              <TextField
                key={campo.nombre}
                select
                label={campo.etiqueta}
                name={campo.nombre}
                value={formData[campo.nombre] ?? ""}
                onChange={manejarCambioCampo}
                required={!modoEdicion && Boolean(campo.requerido)}
                fullWidth
                sx={{ backgroundColor: "white", textAlign: "left" }}
              >
                <MenuItem value="" sx={{ textAlign: "left" }}>
                  Seleccione una opción
                </MenuItem>
                {(opciones[campo.opciones] || []).map((opcion) => (
                  <MenuItem
                    key={opcion[campo.id]}
                    value={opcion[campo.id]}
                    sx={{ textAlign: "left" }}
                  >
                    {opcion[campo.texto]}
                  </MenuItem>
                ))}
              </TextField>
            ))}
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
          >
            Información de contacto y pago
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            {camposContacto.map((campo) => (
              <TextField
                key={campo.nombre}
                label={campo.etiqueta}
                name={campo.nombre}
                type={campo.tipo || "text"}
                value={formData[campo.nombre] ?? ""}
                onChange={manejarCambioCampo}
                fullWidth
                sx={{ backgroundColor: "white" }}
              />
            ))}
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
          >
            Direcciones y ubicación
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              mb: 2,
            }}
          >
            {camposDireccion.map((campo) => (
              <TextField
                key={campo.nombre}
                label={campo.etiqueta}
                name={campo.nombre}
                value={formData[campo.nombre] ?? ""}
                onChange={manejarCambioCampo}
                multiline={campo.multiline}
                minRows={campo.multiline ? 2 : undefined}
                fullWidth
                sx={{ backgroundColor: "white" }}
              />
            ))}
          </Box>
          <CapturadorUbicacion
            onUbicacionCapturada={manejarUbicacionCapturada}
            latitudActual={formData.Latitud}
            longitudActual={formData.Longitud}
          />
          <MapaUbicacion
            latitud={formData.Latitud}
            longitud={formData.Longitud}
            titulo="Mapa de ubicación de entrega del cliente"
            alto={240}
            sx={{ mt: 2 }}
          />
        </Box>
      </Box>
    </ModalInterfazBase>
  );
}
