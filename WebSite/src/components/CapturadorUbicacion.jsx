import { useState, useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Collapse,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Importaciones de Leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Subcomponente para manejar los clics en el mapa y centrar la vista
function ManejadorMapa({ setUbicacion, posicionActual }) {
  const map = useMap();

  // Escuchar clics en el mapa
  useMapEvents({
    click(e) {
      setUbicacion(e.latlng.lat, e.latlng.lng);
    },
  });

  // Centrar el mapa cuando la posición cambia
  useEffect(() => {
    if (posicionActual) {
      map.flyTo(posicionActual, 15);
    }
  }, [posicionActual, map]);

  return posicionActual ? <Marker position={posicionActual} /> : null;
}

export default function CapturadorUbicacion({
  onUbicacionCapturada,
  latitudActual,
  longitudActual,
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [direccionAbuscar, setDireccionAbuscar] = useState("");
  const [mostrarMapa, setMostrarMapa] = useState(
    !!(latitudActual && longitudActual),
  );

  const posicion =
    latitudActual && longitudActual ? [latitudActual, longitudActual] : null;
  const posicionInicialMapa = posicion || [9.9281, -84.0905];

  const manejarCambioUbicacion = (lat, lng) => {
    onUbicacionCapturada(lat, lng);
    setMostrarMapa(true);
    setError("");
  };

  const buscarPorDireccion = async () => {
    if (!direccionAbuscar) return;
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionAbuscar)}`,
      );
      const datos = await respuesta.json();

      if (datos && datos.length > 0) {
        const lat = parseFloat(datos[0].lat);
        const lng = parseFloat(datos[0].lon);
        manejarCambioUbicacion(lat, lng);
      } else {
        setError(
          "No se encontraron resultados para esta dirección. Intenta ser más específico.",
        );
      }
    } catch {
      setError("Hubo un error al conectar con el servicio de búsqueda.");
    } finally {
      setCargando(false);
    }
  };

  const obtenerUbicacionGPS = () => {
    setCargando(true);
    setError("");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicionPos) => {
          const lat = posicionPos.coords.latitude;
          const lng = posicionPos.coords.longitude;
          manejarCambioUbicacion(lat, lng);
          setCargando(false);
        },
        (err) => {
          console.error(err);
          setError(
            "No se pudo obtener la ubicación. Verifica los permisos de tu navegador.",
          );
          setCargando(false);
        },
      );
    } else {
      setError("Tu navegador no soporta geolocalización.");
      setCargando(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 3,
        border: "1px solid #e2e8f0",
        borderRadius: 3,
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: "#1e293b" }}
      >
        Ubicación del Proveedor
      </Typography>

      {/* Búsqueda por texto */}
      <Box>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
          Buscar dirección:
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Ej: San José, Sabana Norte..."
          value={direccionAbuscar}
          onChange={(e) => setDireccionAbuscar(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && buscarPorDireccion()}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={buscarPorDireccion}
                    disabled={cargando || !direccionAbuscar}
                    color="primary"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 1 }}>Opciones Rápidas</Divider>

      {/* Botones de acción rápida */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="outlined"
          startIcon={<MyLocationIcon />}
          onClick={obtenerUbicacionGPS}
          disabled={cargando}
          fullWidth
          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
        >
          Usar mi GPS actual
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<MapIcon />}
          onClick={() => setMostrarMapa(!mostrarMapa)}
          fullWidth
          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
        >
          {mostrarMapa ? "Ocultar Mapa" : "Seleccionar en el mapa"}
        </Button>
      </Stack>

      {/* Mensajes de error */}
      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Visualización del Mapa Interactivo */}
      <Collapse in={mostrarMapa}>
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: "#64748b", mb: 1, display: "block" }}
          >
            * Puedes hacer clic en cualquier parte del mapa para ajustar el
            marcador.
          </Typography>
          <Box
            sx={{
              height: 300,
              width: "100%",
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #cbd5e1",
            }}
          >
            <MapContainer
              center={posicionInicialMapa}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ManejadorMapa
                setUbicacion={manejarCambioUbicacion}
                posicionActual={posicion}
              />
            </MapContainer>
          </Box>
        </Box>
      </Collapse>

      {/* Confirmación Visual de Coordenadas */}
      {posicion && !error && (
        <Alert
          icon={<LocationOnIcon />}
          severity="success"
          sx={{ borderRadius: 2, alignItems: "center", mt: 1 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Ubicación lista y guardada
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            Lat: {posicion[0].toFixed(6)} | Lng: {posicion[1].toFixed(6)}
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
