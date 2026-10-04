import { useEffect, useMemo, useState } from "react";

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import ModuloInterfazBase from "../../components/ModuloInterfazBase";
import PaginacionTabla, {
  obtenerCantidadFilasVisibles,
} from "../../components/PaginacionTabla";
import { mostrarError } from "../../components/ModuloHerramientas";
import {
  construirQuery,
  esEnteroNoNegativo,
  solicitarJson,
} from "../../components/apiHerramientas";

const FILTROS_INICIALES = {
  proveedor: "",
  categoria: "",
  subcategoria: "",
  anio: "",
  mes: "",
};

const MESES = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const CONFIG_REPORTES = [
  {
    num: 1,
    label: "Compras a proveedores",
    desc: "Montos máximo, mínimo y promedio agrupados por proveedor y categoría.",
    Icono: LocalShippingIcon,
    etiqueta: "Compras",
    inputs: [
      {
        campo: "proveedor",
        label: "Proveedor",
        source: "proveedores",
        tipo: "texto",
      },
      {
        campo: "categoria",
        label: "Categoría de proveedor",
        source: "categoriasProveedores",
        tipo: "texto",
      },
    ],
  },

  {
    num: 3,
    label: "Top 5 ganancias por producto",
    desc: "Productos con mayor ganancia por año.",
    Icono: TrendingUpIcon,
    etiqueta: "Rentabilidad",
    inputs: [
      {
        campo: "anio",
        label: "Año",
        source: "anios",
        tipo: "entero",
      },
    ],
  },

  {
    num: 6,
    label: "Matriz resumen de ventas",
    desc: "Resumen de ventas de categorías de productos por año.",
    Icono: BarChartIcon,
    etiqueta: "Resumen",
    inputs: [],
  },

  {
    num: 8,
    label: "Seguimiento de compras a proveedores",
    desc: "Resumen mensual por proveedor con cantidades y montos.",
    Icono: LocalShippingIcon,
    etiqueta: "Seguimiento",
    inputs: [
      {
        campo: "anio",
        label: "Año",
        source: "anios",
        tipo: "entero",
      },
      {
        campo: "mes",
        label: "Mes",
        source: "meses",
        tipo: "opciones",
      },
      {
        campo: "categoria",
        label: "Categoría de producto",
        source: "categoriasProductos",
        tipo: "texto",
      },
      {
        campo: "subcategoria",
        label: "Subcategoría / producto",
        source: "subcategorias",
        tipo: "texto",
      },
    ],
  },

  {
    num: 9,
    label: "Rotación de inventario",
    desc: "Días estimados de rotación por producto, año y proveedor.",
    Icono: InventoryIcon,
    etiqueta: "Inventario",
    inputs: [
      {
        campo: "anio",
        label: "Año",
        source: "anios",
        tipo: "entero",
      },
      {
        campo: "categoria",
        label: "Categoría de producto",
        source: "categoriasProductos",
        tipo: "texto",
      },
      {
        campo: "proveedor",
        label: "Proveedor",
        source: "proveedores",
        tipo: "texto",
      },
    ],
  },
];

const formatearEncabezado = (nombre) =>
  nombre
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letra) => letra.toUpperCase());

const formatearValor = (columna, valor) => {
  if (valor === null || valor === undefined || valor === "") {
    return (
      <Typography
        variant="body2"
        sx={{
          color: "#94a3b8",
          fontStyle: "italic",
        }}
      >
        N/A
      </Typography>
    );
  }

  if (valor instanceof Date) {
    return valor.toLocaleDateString();
  }

  const nombreColumna = columna.toLowerCase();

  const esMoneda =
    typeof valor === "number" &&
    ["monto", "precio", "ganancia", "ventas", "facturado", "total"].some(
      (termino) => nombreColumna.includes(termino),
    );

  if (esMoneda) {
    return (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: "#047857",
        }}
      >
        $
        {Number(valor).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Typography>
    );
  }

  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}/.test(valor)) {
    return new Date(valor).toLocaleDateString();
  }

  return String(valor);
};

function TablaReporteDinamica({
  datos,
  numPaginaActual,
  cantidadFilasPorPagina,
  setNumPaginaActual,
  setCantidadFilasPorPagina,
}) {
  if (!datos?.length) {
    return (
      <Paper
        elevation={0}
        sx={{
          py: 8,
          mt: 2,
          textAlign: "center",
          backgroundColor: "#f8fafc",
          borderRadius: 3,
          border: "1px dashed #cbd5e1",
        }}
      >
        <BarChartIcon
          sx={{
            fontSize: 64,
            color: "#cbd5e1",
            mb: 2,
          }}
        />

        <Typography
          variant="h6"
          sx={{
            color: "#475569",
            fontWeight: 700,
          }}
        >
          No se encontraron datos
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#94a3b8",
            mt: 0.5,
          }}
        >
          Ajusta los filtros o genera nuevamente el reporte.
        </Typography>
      </Paper>
    );
  }

  const columnas = Object.keys(datos[0]);

  const filasVisibles = obtenerCantidadFilasVisibles(
    datos,
    numPaginaActual,
    cantidadFilasPorPagina,
  );

  return (
    <Box>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          overflow: "auto",
          mt: 3,
        }}
      >
        <Table
          size="medium"
          sx={{
            minWidth: 760,
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#f1f5f9",
              }}
            >
              {columnas.map((columna) => (
                <TableCell
                  key={columna}
                  sx={{
                    fontWeight: 800,
                    color: "#334155",
                    py: 1.8,
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.45px",
                  }}
                >
                  {formatearEncabezado(columna)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filasVisibles.map((fila, indice) => (
              <TableRow
                key={`${numPaginaActual}-${indice}`}
                hover
                sx={{
                  "&:last-child td": {
                    borderBottom: 0,
                  },
                  "&:nth-of-type(even)": {
                    backgroundColor: "#fafafa",
                  },
                }}
              >
                {columnas.map((columna) => (
                  <TableCell
                    key={columna}
                    sx={{
                      color: "#1e293b",
                      py: 1.7,
                    }}
                  >
                    {formatearValor(columna, fila[columna])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <PaginacionTabla
          cantidadTotalFilas={datos.length}
          numPaginaActual={numPaginaActual}
          cantidadFilasPorPagina={cantidadFilasPorPagina}
          setNumPaginaActual={setNumPaginaActual}
          setCantidadFilasPorPagina={setCantidadFilasPorPagina}
          onCambiarPagina={(_, pagina) => setNumPaginaActual(pagina)}
        />
      </Box>
    </Box>
  );
}

function FiltroAutocomplete({
  label,
  value,
  options,
  onChange,
  onInputChange,
  numeric = false,
  freeSolo = true,
}) {
  const opciones = options || [];

  const valorSeleccionado = freeSolo
    ? value || ""
    : (opciones.find(
        (opcion) => String(opcion?.value ?? opcion) === String(value ?? ""),
      ) ?? null);

  return (
    <Autocomplete
      freeSolo={freeSolo}
      options={opciones}
      filterOptions={(items) => items}
      value={valorSeleccionado}
      onChange={(_, nuevaOpcion) => {
        if (nuevaOpcion === null || nuevaOpcion === undefined) {
          onChange("");
          return;
        }

        const nuevoValor =
          typeof nuevaOpcion === "string"
            ? nuevaOpcion
            : String(nuevaOpcion?.value ?? nuevaOpcion?.label ?? "");

        onChange(nuevoValor);
      }}
      onInputChange={(_, nuevoTexto, motivo) => {
        if (motivo === "clear") {
          if (freeSolo) {
            onInputChange("");
          } else {
            onChange("");
          }

          return;
        }

        if (!freeSolo) {
          return;
        }

        if (numeric && !esEnteroNoNegativo(nuevoTexto)) {
          return;
        }

        onInputChange(nuevoTexto);
      }}
      getOptionLabel={(opcion) =>
        typeof opcion === "string"
          ? opcion
          : (opcion?.label ?? String(opcion?.value ?? ""))
      }
      isOptionEqualToValue={(opcion, seleccion) =>
        String(opcion?.value ?? opcion) ===
        String(seleccion?.value ?? seleccion)
      }
      noOptionsText="Sin opciones"
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          slotProps={{
            ...params.slotProps,
            htmlInput: {
              ...params.slotProps?.htmlInput,
              inputMode: numeric ? "numeric" : "text",
            },
          }}
          sx={{
            backgroundColor: "white",
          }}
        />
      )}
    />
  );
}

export default function Reportes({
  onErrorNotificacion,
  onErrorOcultarModulo,
}) {
  const [reporteSeleccionadoId, setReporteSeleccionadoId] = useState(null);

  const [datosReporte, setDatosReporte] = useState([]);

  const [filtros, setFiltros] = useState({
    ...FILTROS_INICIALES,
  });

  const [anios, setAnios] = useState([]);

  const [categoriasProveedores, setCategoriasProveedores] = useState([]);

  const [categoriasProductos, setCategoriasProductos] = useState([]);

  const [subcategorias, setSubcategorias] = useState([]);

  const [sugerenciasProveedores, setSugerenciasProveedores] = useState([]);

  const [numPaginaActual, setNumPaginaActual] = useState(0);

  const [cantidadFilasPorPagina, setCantidadFilasPorPagina] = useState(10);

  const [generando, setGenerando] = useState(false);

  const reporteActual = useMemo(
    () =>
      CONFIG_REPORTES.find((reporte) => reporte.num === reporteSeleccionadoId),
    [reporteSeleccionadoId],
  );

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [
          aniosData,
          categoriasProveedorData,
          gruposProductoData,
          subcategoriaData,
        ] = await Promise.all([
          solicitarJson("/api/reportes/opciones/anios"),
          solicitarJson("/api/categorias-proveedores"),
          solicitarJson("/api/inventario/grupos"),
          solicitarJson("/api/inventario/subcategorias"),
        ]);

        setAnios(
          aniosData.map((item) => ({
            value: String(item.Anio),
            label: String(item.Anio),
          })),
        );

        setCategoriasProveedores(
          categoriasProveedorData.map((item) => item.SupplierCategoryName),
        );

        setCategoriasProductos(
          gruposProductoData.map((item) => item.NombreGrupo),
        );

        setSubcategorias(subcategoriaData.map((item) => item.Subcategoria));
      } catch (error) {
        mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
      }
    };

    cargarCatalogos();
  }, [onErrorNotificacion, onErrorOcultarModulo]);

  useEffect(() => {
    const necesitaProveedor = reporteActual?.inputs.some(
      (input) => input.campo === "proveedor",
    );

    const necesitaSubcategoria = reporteActual?.inputs.some(
      (input) => input.campo === "subcategoria",
    );

    const temporizador = setTimeout(async () => {
      if (necesitaProveedor) {
        try {
          const datos = await solicitarJson(
            `/api/proveedores/sugerencias${construirQuery({
              buscar: filtros.proveedor,
            })}`,
          );

          setSugerenciasProveedores(datos.map((item) => item.NombreProveedor));
        } catch {
          setSugerenciasProveedores([]);
        }
      } else {
        setSugerenciasProveedores([]);
      }

      if (necesitaSubcategoria) {
        try {
          const datos = await solicitarJson(
            `/api/inventario/subcategorias${construirQuery({
              buscar: filtros.subcategoria,
            })}`,
          );

          setSubcategorias(datos.map((item) => item.Subcategoria));
        } catch {
          setSubcategorias([]);
        }
      }
    }, 250);

    return () => clearTimeout(temporizador);
  }, [reporteActual, filtros.proveedor, filtros.subcategoria]);

  const seleccionarReporte = (id) => {
    setReporteSeleccionadoId(id);

    setFiltros({
      ...FILTROS_INICIALES,
    });

    setDatosReporte([]);

    setNumPaginaActual(0);
  };

  const regresarAReportes = () => {
    setReporteSeleccionadoId(null);

    setFiltros({
      ...FILTROS_INICIALES,
    });

    setDatosReporte([]);

    setNumPaginaActual(0);
  };

  const actualizarFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  /**
   * Ejecuta el reporte seleccionado.
   *
   * El frontend únicamente arma los parámetros.
   * Los cálculos y transformaciones se mantienen
   * en SQL Server.
   */
  const cargarReporte = async () => {
    if (!reporteActual) {
      return;
    }

    const aniosDisponibles = new Set(anios.map((item) => String(item.value)));

    const anioInvalido =
      filtros.anio && !aniosDisponibles.has(String(filtros.anio));

    if (anioInvalido) {
      const error = new Error(
        "Selecciona un año válido presente en la base de datos.",
      );

      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);

      return;
    }

    if (filtros.mes) {
      const mes = Number(filtros.mes);

      if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
        const error = new Error(
          "El mes debe ser un número entero entre 1 y 12.",
        );

        mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);

        return;
      }
    }

    setGenerando(true);

    try {
      const parametros = {};

      reporteActual.inputs.forEach((input) => {
        parametros[input.campo] = filtros[input.campo];
      });

      const data = await solicitarJson(
        `/api/reportes/${reporteActual.num}${construirQuery(parametros)}`,
      );

      setDatosReporte(Array.isArray(data) ? data : []);

      setNumPaginaActual(0);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    } finally {
      setGenerando(false);
    }
  };

  const restaurarFiltros = () => {
    setFiltros({
      ...FILTROS_INICIALES,
    });

    setDatosReporte([]);

    setNumPaginaActual(0);
  };

  const obtenerOpciones = (source) => {
    const fuentes = {
      anios,
      meses: MESES,
      categoriasProveedores,
      categoriasProductos,
      subcategorias,
      proveedores: sugerenciasProveedores,
    };

    return fuentes[source] || [];
  };

  const renderFiltro = (input) => {
    const opciones = obtenerOpciones(input.source);

    return (
      <FiltroAutocomplete
        key={input.campo}
        label={input.label}
        value={filtros[input.campo]}
        options={opciones}
        numeric={input.tipo === "entero"}
        onChange={(valor) => actualizarFiltro(input.campo, valor)}
        onInputChange={(valor) => actualizarFiltro(input.campo, valor)}
        freeSolo={input.tipo !== "opciones"}
      />
    );
  };

  return (
    <ModuloInterfazBase
      titulo="Reportes y datos estadísticos"
      descripcion="Consulta los indicadores directamente calculados por SQL Server"
      Icono={QueryStatsOutlinedIcon}
      ocultarBotonNuevo
    >
      <Box
        sx={{
          p: {
            xs: 2.5,
            md: 3,
          },
        }}
      >
        {!reporteActual ? (
          <>
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
                mb: 3,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 65%)",
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: "#dbeafe",
                    color: "#2563eb",
                  }}
                >
                  <QueryStatsOutlinedIcon />
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Centro de reportes
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                    }}
                  >
                    Selecciona el análisis que deseas ejecutar y después aplica
                    sus filtros.
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  lg: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              {CONFIG_REPORTES.map((reporte) => {
                const Icono = reporte.Icono;

                return (
                  <Card
                    key={reporte.num}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        borderColor: "#93c5fd",
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => seleccionarReporte(reporte.num)}
                      sx={{
                        height: "100%",
                        p: 2.3,
                        textAlign: "left",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                          alignItems: "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            flexShrink: 0,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            backgroundColor: "#eff6ff",
                            color: "#2563eb",
                          }}
                        >
                          <Icono />
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#2563eb",
                              fontWeight: 800,
                            }}
                          >
                            REPORTE {reporte.num}
                          </Typography>

                          <Typography
                            variant="subtitle1"
                            sx={{
                              mt: 0.35,
                              fontWeight: 800,
                              color: "#0f172a",
                            }}
                          >
                            {reporte.label}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: "#64748b",
                              mt: 0.5,
                              lineHeight: 1.55,
                            }}
                          >
                            {reporte.desc}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        size="small"
                        label={reporte.etiqueta}
                        sx={{
                          mt: 2,
                          backgroundColor: "#f8fafc",
                          color: "#475569",
                          fontWeight: 700,
                        }}
                      />
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          </>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
                backgroundColor: "#f8fafc",
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={regresarAReportes}
                  sx={{
                    textTransform: "none",
                    color: "#475569",
                    fontWeight: 700,
                  }}
                >
                  Reportes
                </Button>

                <Chip
                  label={`Reporte ${reporteActual.num}`}
                  size="small"
                  sx={{
                    fontWeight: 800,
                  }}
                />
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: "#dbeafe",
                    color: "#2563eb",
                  }}
                >
                  <reporteActual.Icono />
                </Box>

                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 850,
                      color: "#0f172a",
                    }}
                  >
                    {reporteActual.label}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      mt: 0.5,
                    }}
                  >
                    {reporteActual.desc} Los filtros se resuelven en el
                    procedimiento almacenado correspondiente.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <Box
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
              }}
            >
              {reporteActual.inputs.length > 0 ? (
                <Box
                  sx={{
                    p: 2.2,
                    borderRadius: 3,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      color: "#1e293b",
                      mb: 2,
                    }}
                  >
                    Filtros del reporte
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: `repeat(${Math.min(
                          reporteActual.inputs.length,
                          4,
                        )}, minmax(0, 1fr))`,
                      },
                      gap: 1.5,
                    }}
                  >
                    {reporteActual.inputs.map(renderFiltro)}
                  </Box>

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1.2}
                    sx={{
                      justifyContent: "flex-end",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<RestartAltIcon />}
                      onClick={restaurarFiltros}
                      disabled={generando}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 700,
                      }}
                    >
                      Limpiar
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<SearchIcon />}
                      onClick={cargarReporte}
                      disabled={generando}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 800,
                        px: 3,
                        boxShadow: "none",
                      }}
                    >
                      {generando ? "Generando…" : "Generar reporte"}
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Stack
                  direction="row"
                  spacing={1.2}
                  sx={{
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={cargarReporte}
                    disabled={generando}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      fontWeight: 800,
                      boxShadow: "none",
                    }}
                  >
                    {generando ? "Generando…" : "Generar reporte"}
                  </Button>
                </Stack>
              )}
            </Box>

            <Divider />

            <Box
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
              }}
            >
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
                sx={{
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Resultados
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      mt: 0.3,
                    }}
                  >
                    Información devuelta directamente por la base de datos.
                  </Typography>
                </Box>

                <Chip
                  icon={<AssessmentIcon />}
                  label={`${datosReporte.length} registros`}
                  sx={{
                    backgroundColor: "#eff6ff",
                    color: "#1d4ed8",
                    fontWeight: 800,
                  }}
                />
              </Stack>

              <TablaReporteDinamica
                datos={datosReporte}
                numPaginaActual={numPaginaActual}
                cantidadFilasPorPagina={cantidadFilasPorPagina}
                setNumPaginaActual={setNumPaginaActual}
                setCantidadFilasPorPagina={setCantidadFilasPorPagina}
              />
            </Box>
          </Paper>
        )}
      </Box>
    </ModuloInterfazBase>
  );
}
