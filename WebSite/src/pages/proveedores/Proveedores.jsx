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
import BusinessIcon from "@mui/icons-material/Business";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";

import ModalDetallesProveedor from "./ModalDetallesProveedor";
import ModalFormularioProveedor from "./ModalFormularioProveedor";
import ModuloInterfazBase from "../../components/ModuloInterfazBase";
import PaginacionTabla, {
  obtenerCantidadFilasVisibles,
} from "../../components/PaginacionTabla";
import ModalConfirmacion from "../../components/ModalConfirmacion";
import { mostrarError } from "../../components/ModuloHerramientas";
import {
  construirQuery,
  esEnteroNoNegativo,
  solicitarJson,
} from "../../components/apiHerramientas";

const FORMULARIO_INICIAL = {
  SupplierID: "",
  SupplierName: "",
  SupplierCategoryName: "",
  PrimaryContactPersonName: "",
  AlternateContactPersonName: "",
  DeliveryMethodName: "",
  DeliveryCityName: "",
  SupplierReference: "",
  DeliveryAddressLine1: "",
  DeliveryAddressLine2: "",
  DeliveryPostalCode: "",
  PostalAddressLine1: "",
  PostalAddressLine2: "",
  PostalPostalCode: "",
  PhoneNumber: "",
  FaxNumber: "",
  WebsiteURL: "",
  BankAccountName: "",
  BankAccountNumber: "",
  PaymentDays: 30,
  Latitud: null,
  Longitud: null,
};

export default function Proveedores({
  onErrorNotificacion,
  onErrorOcultarModulo,
}) {
  const [proveedores, setProveedores] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [sugerenciasNombre, setSugerenciasNombre] = useState([]);
  const [opcionesFormulario, setOpcionesFormulario] = useState({
    categorias: [],
    contactos: [],
    metodosEntrega: [],
    ciudades: [],
  });

  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [numPaginaActual, setNumPaginaActual] = useState(0);
  const [cantidadFilasPorPagina, setCantidadFilasPorPagina] = useState(5);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [formData, setFormData] = useState(FORMULARIO_INICIAL);

  const proveedoresVisiblesArray = obtenerCantidadFilasVisibles(
    proveedores,
    numPaginaActual,
    cantidadFilasPorPagina,
  );

  /**
   * Carga catálogos del módulo desde la API.
   * @returns {Promise<void>} Actualiza los estados de opciones.
   */
  const cargarOpciones = async () => {
    try {
      const [categoriasData, opcionesData] = await Promise.all([
        solicitarJson("/api/categorias-proveedores"),
        solicitarJson("/api/proveedores/opciones"),
      ]);

      setCategorias(categoriasData);
      setOpcionesFormulario(opcionesData);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  /**
   * Consulta proveedores usando los filtros.
   * @param {{nombre?: string, categoriaId?: string}} filtros Filtros a enviar.
   * @returns {Promise<void>} Actualiza la tabla y reinicia su paginación.
   */
  const fetchProveedores = async ({
    nombre = filtroNombre,
    categoriaId = filtroCategoria,
  } = {}) => {
    try {
      const datos = await solicitarJson(
        `/api/proveedores${construirQuery({
          nombre,
          categoriaId,
        })}`,
      );
      setProveedores(datos);
      setNumPaginaActual(0);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  useEffect(() => {
    let activo = true;

    const cargarInicial = async () => {
      const resultados = await Promise.allSettled([
        solicitarJson("/api/proveedores"),
        solicitarJson("/api/categorias-proveedores"),
        solicitarJson("/api/proveedores/opciones"),
      ]);

      if (!activo) return;

      const [resultadoProveedores, resultadoCategorias, resultadoOpciones] =
        resultados;

      if (resultadoProveedores.status === "fulfilled") {
        setProveedores(resultadoProveedores.value);
        setNumPaginaActual(0);
      } else {
        mostrarError(
          resultadoProveedores.reason,
          onErrorNotificacion,
          onErrorOcultarModulo,
        );
      }

      if (resultadoCategorias.status === "fulfilled") {
        setCategorias(resultadoCategorias.value);
      }

      if (resultadoOpciones.status === "fulfilled") {
        setOpcionesFormulario(resultadoOpciones.value);
      }

      const erroresCatalogo = resultados
        .slice(1)
        .filter((resultado) => resultado.status === "rejected");

      if (
        erroresCatalogo.length > 0 &&
        resultadoProveedores.status === "fulfilled"
      ) {
        onErrorNotificacion(
          "Se cargaron los proveedores, pero uno o más catálogos del formulario no están disponibles.",
        );
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
        const datos = await solicitarJson(
          `/api/proveedores/sugerencias${construirQuery({ buscar: texto })}`,
        );
        setSugerenciasNombre(datos);
      } catch {
        setSugerenciasNombre([]);
      }
    }, 250);

    return () => clearTimeout(temporizador);
  }, [filtroNombre]);

  /**
   * Restablece filtros
   * @returns {Promise<void>} Tabla completa de proveedores.
   */
  const restaurarFiltros = async () => {
    setFiltroNombre("");
    setFiltroCategoria("");
    await fetchProveedores({ nombre: "", categoriaId: "" });
  };

  /**
   * Obtiene el detalle de un proveedor.
   * @param {number} id Identificador del proveedor.
   * @returns {Promise<void>} Abre el modal con los datos recibidos.
   */
  const abrirDetalles = async (id) => {
    try {
      const data = await solicitarJson(`/api/proveedores/${id}`);
      setProveedorSeleccionado(data);
      setModalDetallesAbierto(true);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  /** Abre el formulario para crear un proveedor. */
  const abrirFormularioNuevo = () => {
    setModoEdicion(false);
    setFormData({ ...FORMULARIO_INICIAL });
    setModalFormAbierto(true);
  };

  /**
   * Carga un proveedor para edición.
   * @param {object} proveedorRow Fila seleccionada.
   * @returns {Promise<void>} Abre el formulario con los datos actuales.
   */
  const abrirFormularioEdicion = async (proveedorRow) => {
    try {
      const data = await solicitarJson(
        `/api/proveedores/${proveedorRow.SupplierID}`,
      );

      setModoEdicion(true);
      setFormData({
        ...FORMULARIO_INICIAL,
        SupplierID: data.SupplierID ?? proveedorRow.SupplierID,
        SupplierName: data.NombreProveedor || "",
        SupplierCategoryName: data.Categoria || "",
        PrimaryContactPersonName: data.ContactoPrimario || "",
        AlternateContactPersonName: data.ContactoAlternativo || "",
        DeliveryMethodName: data.MetodoEntrega || "",
        DeliveryCityName: data.CiudadEntrega || "",
        SupplierReference: data.CodigoProveedor || "",
        DeliveryAddressLine1: data.DeliveryAddressLine1 || "",
        DeliveryAddressLine2: data.DeliveryAddressLine2 || "",
        DeliveryPostalCode:
          data.CodigoPostal === "N/A" ? "" : data.CodigoPostal || "",
        PostalAddressLine1: data.PostalAddressLine1 || "",
        PostalAddressLine2: data.PostalAddressLine2 || "",
        PostalPostalCode:
          data.CodigoPostalPostal === "N/A"
            ? ""
            : data.CodigoPostalPostal || "",
        PhoneNumber: data.Telefono === "N/A" ? "" : data.Telefono || "",
        FaxNumber: data.Fax === "N/A" ? "" : data.Fax || "",
        WebsiteURL: data.SitioWeb || "",
        BankAccountName:
          data.NombreBanco === "N/A" ? "" : data.NombreBanco || "",
        BankAccountNumber:
          data.CuentaCorriente === "N/A" ? "" : data.CuentaCorriente || "",
        PaymentDays: data.DiasGracia ?? 30,
        Latitud: data.Latitud ?? null,
        Longitud: data.Longitud ?? null,
      });
      setModalFormAbierto(true);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    if (name === "PaymentDays" && !esEnteroNoNegativo(value)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const manejarCambioAutocomplete = (nombreCampo, valor) => {
    setFormData((prev) => ({ ...prev, [nombreCampo]: valor }));
  };

  const manejarUbicacionCapturada = (lat, lng) => {
    setFormData((prev) => ({ ...prev, Latitud: lat, Longitud: lng }));
  };

  const guardarProveedor = async (datosFormulario) => {
    const id = datosFormulario.SupplierID;
    const ruta = id ? `/api/proveedores/${id}` : "/api/proveedores";
    const method = id ? "PUT" : "POST";

    try {
      await solicitarJson(ruta, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosFormulario),
      });
      setModalFormAbierto(false);
      await Promise.all([fetchProveedores(), cargarOpciones()]);
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  const confirmarEliminacion = (proveedor) => {
    setProveedorAEliminar(proveedor);
    setModalEliminarAbierto(true);
  };

  /** Elimina el proveedor seleccionado. */
  const ejecutarEliminacion = async () => {
    if (!proveedorAEliminar) return;

    try {
      await solicitarJson(`/api/proveedores/${proveedorAEliminar.SupplierID}`, {
        method: "DELETE",
      });
      setModalEliminarAbierto(false);
      setProveedorAEliminar(null);
      await fetchProveedores();
    } catch (error) {
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  const opcionesCategoria = categorias.length
    ? categorias
    : opcionesFormulario.categorias;

  return (
    <ModuloInterfazBase
      titulo="Gestión de Proveedores"
      descripcion="Consulta, administra y controla los proveedores registrados"
      Icono={BusinessIcon}
      IconoBoton={AddIcon}
      textoBoton="Nuevo Proveedor"
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
                Buscar proveedores
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Los filtros se envían directamente al procedimiento almacenado.
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
                    : value?.NombreProveedor || "",
                );
              }}
              getOptionLabel={(option) =>
                typeof option === "string"
                  ? option
                  : option.NombreProveedor || ""
              }
              noOptionsText="Sin sugerencias"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nombre del proveedor"
                  size="small"
                  onKeyDown={(e) => e.key === "Enter" && fetchProveedores()}
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
              label="Categoría"
              size="small"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              sx={{ backgroundColor: "white", textAlign: "left" }}
            >
              <MenuItem value="">Todas las categorías</MenuItem>
              {opcionesCategoria.map((cat) => (
                <MenuItem
                  key={cat.SupplierCategoryID}
                  value={cat.SupplierCategoryID}
                >
                  {cat.SupplierCategoryName}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() => fetchProveedores()}
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
            Proveedores registrados
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", mt: 0.3, mb: 1.5 }}
          >
            {proveedores.length} proveedores encontrados
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
                    PROVEEDOR
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                    CATEGORÍA
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>
                    MÉTODO DE ENTREGA
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
                {proveedoresVisiblesArray.length > 0 ? (
                  proveedoresVisiblesArray.map((row) => (
                    <TableRow key={row.SupplierID} hover>
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
                              backgroundColor: "#dbeafe",
                              color: "#2563eb",
                              fontWeight: 700,
                            }}
                          >
                            {row.NombreProveedor?.charAt(0)?.toUpperCase() ||
                              "P"}
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: "#1e293b" }}
                            >
                              {row.NombreProveedor}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#94a3b8" }}
                            >
                              ID: {row.SupplierID}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.Categoria || "N/A"}</TableCell>
                      <TableCell>{row.MetodoEntrega || "N/A"}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => abrirDetalles(row.SupplierID)}
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
                      <BusinessOutlinedIcon
                        sx={{ fontSize: 50, color: "#cbd5e1" }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: "#475569", fontWeight: 600 }}
                      >
                        No hay proveedores
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
            cantidadTotalFilas={proveedores.length}
            numPaginaActual={numPaginaActual}
            cantidadFilasPorPagina={cantidadFilasPorPagina}
            setNumPaginaActual={setNumPaginaActual}
            setCantidadFilasPorPagina={setCantidadFilasPorPagina}
            onCambiarPagina={(_, n) => setNumPaginaActual(n)}
          />
        </Box>
      </Box>

      <ModalDetallesProveedor
        abierto={modalDetallesAbierto}
        onClose={() => setModalDetallesAbierto(false)}
        proveedor={proveedorSeleccionado}
      />

      <ModalFormularioProveedor
        abierto={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        modoEdicion={modoEdicion}
        IconoCrear={BusinessIcon}
        IconoEditar={EditIcon}
        IconoModulo={AddBusinessIcon}
        formData={formData}
        manejarCambioFormulario={manejarCambioFormulario}
        manejarCambioAutocomplete={manejarCambioAutocomplete}
        manejarUbicacionCapturada={manejarUbicacionCapturada}
        guardarProveedor={guardarProveedor}
        opcionesCategorias={
          opcionesFormulario.categorias.length
            ? opcionesFormulario.categorias
            : categorias
        }
        opcionesContactos={opcionesFormulario.contactos}
        opcionesMetodosEntrega={opcionesFormulario.metodosEntrega}
        opcionesCiudades={opcionesFormulario.ciudades}
      />

      <ModalConfirmacion
        abierto={modalEliminarAbierto}
        onClose={() => setModalEliminarAbierto(false)}
        onConfirmar={ejecutarEliminacion}
        titulo="Eliminar proveedor"
        mensaje={
          <>
            ¿Estás seguro de que deseas eliminar al proveedor{" "}
            <b>{proveedorAEliminar?.NombreProveedor}</b>?
          </>
        }
      />
    </ModuloInterfazBase>
  );
}
