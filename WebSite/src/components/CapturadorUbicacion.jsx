import React, { useState } from "react";
import { Button, Box, Typography, Alert } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

export default function CapturadorUbicacion({
  onUbicacionCapturada,
  latitudActual,
  longitudActual,
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const obtenerUbicacion = () => {
    setCargando(true);
    setError("");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          const lat = posicion.coords.latitude;
          const lng = posicion.coords.longitude;
          onUbicacionCapturada(lat, lng);
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
        gap: 1,
        p: 2,
        border: "1px dashed #cbd5e1",
        borderRadius: 2,
        backgroundColor: "#f8fafc",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, color: "#475569" }}
      >
        Geolocalización
      </Typography>
      <Button
        variant="outlined"
        startIcon={<MyLocationIcon />}
        onClick={obtenerUbicacion}
        disabled={cargando}
        sx={{
          alignSelf: "flex-start",
          textTransform: "none",
          borderRadius: 2,
          fontWeight: 600,
        }}
      >
        {cargando ? "Obteniendo coordenadas..." : "Usar mi ubicación actual"}
      </Button>

      {error && (
        <Alert severity="error" sx={{ py: 0 }}>
          {error}
        </Alert>
      )}

      {latitudActual && longitudActual && !error && (
        <Typography
          variant="caption"
          sx={{ color: "#16a34a", fontWeight: 700 }}
        >
          Coordenadas registradas: {latitudActual.toFixed(6)},{" "}
          {longitudActual.toFixed(6)}
        </Typography>
      )}
    </Box>
  );
}
