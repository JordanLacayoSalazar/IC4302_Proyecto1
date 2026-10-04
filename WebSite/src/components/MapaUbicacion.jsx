import { Box } from "@mui/material";

const obtenerCoordenada = (valor) => {
  if (valor === null || valor === undefined || String(valor).trim() === "") {
    return null;
  }

  const coordenada = Number(valor);
  if (!Number.isFinite(coordenada)) {
    return null;
  }

  return coordenada;
};

const obtenerEnlaceMapa = (latitud, longitud, margen) => {
  const minLongitud = Math.max(-180, longitud - margen);
  const minLatitud = Math.max(-90, latitud - margen);
  const maxLongitud = Math.min(180, longitud + margen);
  const maxLatitud = Math.min(90, latitud + margen);
  const limites = [minLongitud, minLatitud, maxLongitud, maxLatitud].join(
    "%2C",
  );

  return `https://www.openstreetmap.org/export/embed.html?bbox=${limites}&layer=mapnik&marker=${latitud}%2C${longitud}`;
};

export default function MapaUbicacion({
  latitud,
  longitud,
  titulo = "Mapa de ubicación",
  alto = 300,
  sx = {},
}) {
  const latitudNumerica = obtenerCoordenada(latitud);
  const longitudNumerica = obtenerCoordenada(longitud);

  if (
    latitudNumerica === null ||
    longitudNumerica === null ||
    latitudNumerica < -90 ||
    latitudNumerica > 90 ||
    longitudNumerica < -180 ||
    longitudNumerica > 180
  ) {
    return null;
  }

  return (
    <Box
      component="iframe"
      title={titulo}
      src={obtenerEnlaceMapa(latitudNumerica, longitudNumerica, 0.005)}
      loading="lazy"
      sx={{
        width: "100%",
        height: alto,
        border: 0,
        borderRadius: 2,
        ...sx,
      }}
    />
  );
}
