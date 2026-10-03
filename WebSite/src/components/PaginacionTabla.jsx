import { TablePagination } from "@mui/material";

// La función se exporta para que los módulos obtengan el mismo segmento de filas.
// eslint-disable-next-line react-refresh/only-export-components
export const obtenerCantidadFilasVisibles = (filas, numPaginaActual, cantidadFilasPorPagina) => {
  const inicio = numPaginaActual * cantidadFilasPorPagina;
  const fin = inicio + cantidadFilasPorPagina;
  return filas.slice(inicio, fin);
};

export default function PaginacionTabla({
  cantidadTotalFilas,
  numPaginaActual,
  cantidadFilasPorPagina,
  setNumPaginaActual,
  setCantidadFilasPorPagina,
  onCambiarPagina,
  opcionesCantidadFilasPorPagina = [5, 10, 20],
}) {
  const cambiarCantidadFilasPorPagina = (evento) => {
    setCantidadFilasPorPagina(Number(evento.target.value));
    setNumPaginaActual(0);
  };

  return (
    <TablePagination
      component="div"
      count={cantidadTotalFilas}
      page={numPaginaActual}
      rowsPerPage={cantidadFilasPorPagina}
      onPageChange={onCambiarPagina}
      onRowsPerPageChange={cambiarCantidadFilasPorPagina}
      rowsPerPageOptions={opcionesCantidadFilasPorPagina}
      labelRowsPerPage="Filas por página:"
      labelDisplayedRows={({ from: desde, to: hasta, count: total }) =>
        `${desde}–${hasta} de ${total !== -1 ? total : `más de ${hasta}`}`
      }
      sx={{
        border: "1px solid #e2e8f0",
        borderTop: 0,
        borderRadius: "0 0 12px 12px",
        backgroundColor: "#fff",
      }}
    />
  );
}
