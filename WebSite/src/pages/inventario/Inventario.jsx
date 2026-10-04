import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
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

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import InventoryIcon from "@mui/icons-material/Inventory";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import ModalDetallesProducto from "./ModalDetallesProducto";
import ModalFormularioProducto from "./ModalFormularioProducto";
import ModuloInterfazBase from "../../components/ModuloInterfazBase";
import PaginacionTabla, {
  obtenerCantidadFilasVisibles,
} from "../../components/PaginacionTabla";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import { mostrarError } from "../../components/ModuloHerramientas";
import {
  construirQuery,
  esDecimalNoNegativo,
  esEnteroNoNegativo,
  solicitarJson,
} from "../../components/apiHerramientas";

const FORMULARIO_INICIAL = {
  ProductoID: "",
  NombreProducto: "",
  NombreGrupo: "",
  Proveedor: "",
  Color: "",
  UnidadEmpaque: "",
  EmpaqueExterior: "",
  CantidadEmpaque: 1,
  Marca: "",
  Talla: "",
  Impuesto: 0,
  PrecioUnitario: 0,
  PrecioVenta: 0,
  Peso: 0,
  PalabrasClaves: "",
};

export default function Inventario({
  onErrorNotificacion,
  onErrorOcultarModulo,
}) {
  const [productos, setProductos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [grupos, setGrupos] = useState([]);
  const [sugerenciasNombre, setSugerenciasNombre] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [numPaginaActual, setNumPaginaActual] = useState(0);
  const [cantidadFilasPorPagina, setCantidadFilasPorPagina] = useState(5);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [formData, setFormData] = useState(FORMULARIO_INICIAL);

  const productosVisiblesArray = obtenerCantidadFilasVisibles(
    productos,
    numPaginaActual,
    cantidadFilasPorPagina,
  );

  /** Consulta los catálogos del módulo. */
  const cargarOpciones = async () => {
    try {
      const [gruposData, proveedoresData] = await Promise.all([
        solicitarJson("/api/inventario/grupos"),
        solicitarJson(
          "/api/proveedores/sugerencias" + construirQuery({ buscar: "" }),
        ),
      ]);
      setGrupos(gruposData);
      setProveedores(proveedoresData);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  const fetchProductos = async ({
    nombre = filtroNombre,
    grupoId = filtroGrupo,
  } = {}) => {
    try {
      const data = await solicitarJson(
        `/api/inventario${construirQuery({ nombre, grupoId })}`,
      );
      setProductos(data);
      setNumPaginaActual(0);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  useEffect(() => {
    let activo = true;

    const cargarInicial = async () => {
      const resultados = await Promise.allSettled([
        solicitarJson("/api/inventario"),
        solicitarJson("/api/inventario/grupos"),
        solicitarJson("/api/proveedores/sugerencias"),
      ]);

      if (!activo) return;

      const [resultadoProductos, resultadoGrupos, resultadoProveedores] =
        resultados;

      if (resultadoProductos.status === "fulfilled") {
        setProductos(resultadoProductos.value);
        setNumPaginaActual(0);
      } else {
        mostrarError(
          resultadoProductos.reason,
          onErrorNotificacion,
          onErrorOcultarModulo,
        );
      }

      if (resultadoGrupos.status === "fulfilled") {
        setGrupos(resultadoGrupos.value);
      }

      if (resultadoProveedores.status === "fulfilled") {
        setProveedores(resultadoProveedores.value);
      }
    };

    cargarInicial();
    return () => {
      activo = false;
    };
  }, [onErrorNotificacion, onErrorOcultarModulo]);

  useEffect(() => {
    const texto = filtroNombre.trim();
    const temporizador = setTimeout(async () => {
      try {
        const data = await solicitarJson(
          `/api/inventario/sugerencias${construirQuery({ buscar: texto })}`,
        );
        setSugerenciasNombre(data);
      } catch {
        setSugerenciasNombre([]);
      }
    }, 250);

    return () => clearTimeout(temporizador);
  }, [filtroNombre]);

  /** Restaura todos los filtros y consulta todos los productos. */
  const restaurarFiltros = async () => {
    setFiltroNombre("");
    setFiltroGrupo("");
    await fetchProductos({ nombre: "", grupoId: "" });
  };

  /** Abre los detalles del producto seleccionado. */
  const abrirDetalles = async (id) => {
    try {
      const data = await solicitarJson(`/api/inventario/${id}`);
      setProductoSeleccionado(data);
      setModalDetallesAbierto(true);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  /** Abre formulario vacío para un nuevo producto. */
  const abrirFormularioNuevo = () => {
    setModoEdicion(false);
    setFormData({ ...FORMULARIO_INICIAL });
    setModalFormAbierto(true);
  };

  /** Carga los datos del producto seleccionado en el formulario. */
  const abrirFormularioEdicion = async (productoRow) => {
    try {
      const data = await solicitarJson(
        `/api/inventario/${productoRow.ProductoID}`,
      );
      setModoEdicion(true);
      setFormData({
        ...FORMULARIO_INICIAL,
        ProductoID: productoRow.ProductoID,
        NombreProducto: data.NombreProducto || "",
        NombreGrupo: data.NombreGrupo || productoRow.Grupo || "",
        Proveedor: data.Proveedor || "",
        Color: data.Color === "N/A" ? "" : data.Color || "",
        UnidadEmpaque: data.UnidadEmpaque || "",
        EmpaqueExterior: data.EmpaqueExterior || "",
        CantidadEmpaque: data.CantidadEmpaque ?? 1,
        Marca: data.Marca === "N/A" ? "" : data.Marca || "",
        Talla: data.Talla === "N/A" ? "" : data.Talla || "",
        Impuesto: data.Impuesto ?? 0,
        PrecioUnitario: data.PrecioUnitario ?? 0,
        PrecioVenta: data.PrecioVenta ?? 0,
        Peso: data.Peso ?? 0,
        PalabrasClaves:
          data.PalabrasClaves === "N/A" ? "" : data.PalabrasClaves || "",
      });
      setModalFormAbierto(true);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    const camposEnteros = new Set(["CantidadEmpaque"]);
    const camposDecimales = new Set([
      "Impuesto",
      "PrecioUnitario",
      "PrecioVenta",
      "Peso",
    ]);

    if (camposEnteros.has(name) && !esEnteroNoNegativo(value)) return;
    if (camposDecimales.has(name) && !esDecimalNoNegativo(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const manejarCambioAutocomplete = (nombreCampo, valor) => {
    setFormData((prev) => ({ ...prev, [nombreCampo]: valor }));
  };

  const guardarProducto = async (datos) => {
    const ruta = datos.ProductoID
      ? `/api/inventario/${datos.ProductoID}`
      : "/api/inventario";
    const method = datos.ProductoID ? "PUT" : "POST";

    try {
      await solicitarJson(ruta, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      setModalFormAbierto(false);
      await Promise.all([fetchProductos(), cargarOpciones()]);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  const confirmarEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setModalEliminarAbierto(true);
  };

  const ejecutarEliminacion = async () => {
    if (!productoAEliminar) return;

    try {
      await solicitarJson(`/api/inventario/${productoAEliminar.ProductoID}`, {
        method: "DELETE",
      });
      setModalEliminarAbierto(false);
      setProductoAEliminar(null);
      await fetchProductos();
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  return (
    <ModuloInterfazBase
      titulo="Control de Inventarios"
      descripcion="Gestiona y administra los productos, stock y detalles logísticos"
      Icono={InventoryIcon}
      IconoBoton={AddIcon}
      textoBoton="Nuevo Producto"
      onCrear={abrirFormularioNuevo}
    >
      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", mb: 2 }}
          >
            <SearchIcon sx={{ color: "#283972", fontSize: 21 }} />
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#1e293b" }}
              >
                Buscar en inventario
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Nombre con sugerencias y grupo mediante selección.
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr auto auto" },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <Autocomplete
              freeSolo
              options={sugerenciasNombre}
              filterOptions={(options) => options}
              inputValue={filtroNombre}
              onInputChange={(_, value) => setFiltroNombre(value)}
              onChange={(_, value) => {
                setFiltroNombre(
                  typeof value === "string"
                    ? value
                    : value?.NombreProducto || "",
                );
              }}
              getOptionLabel={(option) =>
                typeof option === "string"
                  ? option
                  : option.NombreProducto || ""
              }
              noOptionsText="Sin sugerencias"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nombre del producto"
                  size="small"
                  onKeyDown={(e) => e.key === "Enter" && fetchProductos()}
                  sx={{ backgroundColor: "white" }}
                  slotProps={{
                    ...params.slotProps,
                    input: {
                      ...params.slotProps?.input,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                          {params.slotProps?.input?.startAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />

            <TextField
              select
              label="Grupo de producto"
              size="small"
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              sx={{ backgroundColor: "white", textAlign: "left" }}
            >
              <MenuItem value="">Todos los grupos</MenuItem>
              {grupos.map((grupo) => (
                <MenuItem key={grupo.GrupoID} value={grupo.GrupoID}>
                  {grupo.NombreGrupo}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() => fetchProductos()}
              sx={{
                height: 40,
                px: 2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                backgroundColor: "#284472",
              }}
            >
              Buscar
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={restaurarFiltros}
              sx={{
                height: 40,
                px: 2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#cbd5e1",
                color: "#475569",
              }}
            >
              Restaurar
            </Button>
          </Box>
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Productos registrados
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", mt: 0.3, mb: 1.5 }}
          >
            {productos.length} productos encontrados
          </Typography>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                    PRODUCTO
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                    GRUPO
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                    EXISTENCIAS
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "#475569" }}
                  >
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productosVisiblesArray.length > 0 ? (
                  productosVisiblesArray.map((row) => (
                    <TableRow key={row.ProductoID} hover>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: "center" }}
                        >
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#dcfce7",
                              color: "#16a34a",
                              fontWeight: 700,
                            }}
                          >
                            {row.NombreProducto?.charAt(0)?.toUpperCase() ||
                              "P"}
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: "#1e293b" }}
                            >
                              {row.NombreProducto}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#94a3b8" }}
                            >
                              ID: {row.ProductoID}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.Grupo || "N/A"}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color:
                              row.CantidadInventario > 0
                                ? "#15803d"
                                : "#b45309",
                          }}
                        >
                          {row.CantidadInventario ?? 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => abrirDetalles(row.ProductoID)}
                          sx={{ color: "#2563eb", backgroundColor: "#eff6ff" }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => abrirFormularioEdicion(row)}
                          sx={{
                            color: "#d97706",
                            backgroundColor: "#fffbeb",
                            ml: 1,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => confirmarEliminacion(row)}
                          sx={{
                            color: "#dc2626",
                            backgroundColor: "#fef2f2",
                            ml: 1,
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
                      <Inventory2OutlinedIcon
                        sx={{ fontSize: 50, color: "#cbd5e1" }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: "#475569", fontWeight: 600 }}
                      >
                        No hay productos
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Prueba con otros filtros o restaura la consulta.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <PaginacionTabla
            cantidadTotalFilas={productos.length}
            numPaginaActual={numPaginaActual}
            cantidadFilasPorPagina={cantidadFilasPorPagina}
            setNumPaginaActual={setNumPaginaActual}
            setCantidadFilasPorPagina={setCantidadFilasPorPagina}
            onCambiarPagina={(_, n) => setNumPaginaActual(n)}
          />
        </Box>
      </Box>

      <ModalDetallesProducto
        abierto={modalDetallesAbierto}
        onClose={() => setModalDetallesAbierto(false)}
        producto={productoSeleccionado}
      />

      <ModalFormularioProducto
        abierto={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        modoEdicion={modoEdicion}
        formData={formData}
        manejarCambioFormulario={manejarCambioFormulario}
        manejarCambioAutocomplete={manejarCambioAutocomplete}
        guardarProducto={guardarProducto}
        opcionesGrupos={grupos}
        opcionesProveedores={proveedores}
      />

      <ModalConfirmacion
        abierto={modalEliminarAbierto}
        onClose={() => setModalEliminarAbierto(false)}
        onConfirmar={ejecutarEliminacion}
        titulo="Eliminar producto"
        mensaje={
          <>
            ¿Estás seguro de que deseas eliminar el producto{" "}
            <b>{productoAEliminar?.NombreProducto}</b>? Esta acción no se puede
            deshacer.
          </>
        }
      />
    </ModuloInterfazBase>
  );
}
