import { useCallback, useEffect, useState } from "react";
import {
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
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ModuloInterfazBase from "../../components/ModuloInterfazBase";
import PaginacionTabla, {
  obtenerCantidadFilasVisibles,
} from "../../components/PaginacionTabla";
import { API_URL, mostrarError } from "../../components/ModuloHerramientas";
import ModalFormularioCliente from "./ModalFormularioCliente";
import ModalDetallesCliente from "./ModalDetallesCliente";

/**
 * Renderiza el módulo de clientes, su tabla y sus formularios.
 * @param {object} props Manejadores de notificaciones y control del módulo.
 * @param {Function} props.onErrorNotificacion Notifica errores al usuario.
 * @param {Function} props.onErrorOcultarModulo Oculta el módulo si el error lo requiere.
 * @returns {JSX.Element} Interfaz de gestión de clientes.
 */
export default function Clientes({
  onErrorNotificacion,
  onErrorOcultarModulo,
}) {
  const [clientes, setClientes] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroMetodoEntrega, setFiltroMetodoEntrega] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [clienteIdEdicion, setClienteIdEdicion] = useState(null);
  const [formData, setFormData] = useState({});
  const [opcionesFormulario, setOpcionesFormulario] = useState({});
  const [pagina, setPagina] = useState(0);
  const [cantidadFilasPorPagina, setCantidadFilasPorPagina] = useState(5);

  const clientesVisibles = obtenerCantidadFilasVisibles(
    clientes,
    pagina,
    cantidadFilasPorPagina,
  );

  /**
   * Consulta clientes con los filtros seleccionados y vuelve a la primera página.
   * @param {string} [nombre=""] Texto opcional para filtrar clientes.
   * @param {string} [categoria=""] Categoría seleccionada.
   * @param {string} [metodoEntrega=""] Método de entrega seleccionado.
   * @returns {Promise<void>} Completa la solicitud y actualiza el estado.
   */
  const fetchClientes = useCallback(
    async (
      nombre = "",
      categoria = "",
      metodoEntrega = "",
    ) => {
      const parametros = new URLSearchParams();
      if (nombre.trim()) parametros.set("nombre", nombre.trim());
      if (categoria) parametros.set("categoria", categoria);
      if (metodoEntrega) parametros.set("metodoEntrega", metodoEntrega);

      try {
        const respuesta = await fetch(
          `${API_URL}/api/clientes?${parametros.toString()}`,
        );
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          const error = new Error(
            resultado.errorMsg || "No se pudieron cargar los clientes.",
          );
          error.ocultarModulo = resultado.esErrorCriticoBD;
          throw error;
        }

        if (!Array.isArray(resultado)) {
          throw new Error(
            "La respuesta de clientes no tiene el formato esperado.",
          );
        }
        setClientes(resultado);
        setPagina(0);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
      }
    },
    [onErrorNotificacion, onErrorOcultarModulo],
  );

  /**
   * Carga los catálogos para los selectores del formulario de clientes.
   * @returns {Promise<void>} Actualiza el estado de opciones del formulario.
   */
  const fetchOpcionesFormulario = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/opciones-clientes`);
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        const error = new Error(
          resultado.errorMsg ||
            "No se pudieron cargar las opciones de clientes.",
        );
        error.ocultarModulo = resultado.esErrorCriticoBD;
        throw error;
      }

      setOpcionesFormulario(resultado);
    } catch (error) {
      console.error("Error al cargar opciones del formulario:", error);
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  }, [onErrorNotificacion, onErrorOcultarModulo]);

  /** Abre el formulario vacío para registrar un cliente nuevo. */
  const abrirFormularioNuevo = () => {
    setModoEdicion(false);
    setClienteIdEdicion(null);
    setFormData({ CustomerName: "", Latitud: null, Longitud: null });
    setModalFormularioAbierto(true);
  };

  /**
   * Obtiene los datos del cliente y abre el formulario en modo edición.
   * @param {object} cliente Fila del cliente, con CustomerID.
   * @returns {Promise<void>} Carga el formulario o notifica el error.
   */
  const abrirFormularioEdicion = async (cliente) => {
    try {
      const respuesta = await fetch(
        `${API_URL}/api/clientes/${cliente.CustomerID}`,
      );
      const detalle = await respuesta.json();

      if (!respuesta.ok) {
        const error = new Error(
          detalle.errorMsg || "No se pudieron cargar los datos del cliente.",
        );
        error.ocultarModulo = detalle.esErrorCriticoBD;
        throw error;
      }

      setModoEdicion(true);
      setClienteIdEdicion(cliente.CustomerID);
      setFormData({
        CustomerName: detalle.NombreCliente || "",
        PhoneNumber: detalle.PhoneNumber,
        FaxNumber: detalle.FaxNumber,
        PaymentDays: detalle.PaymentDays,
        WebsiteURL: detalle.WebsiteURL,
        DireccionEntrega: [
          detalle.DeliveryAddressLine1,
          detalle.DeliveryAddressLine2,
        ]
          .filter(Boolean)
          .join("\n"),
        DeliveryPostalCode: detalle.DeliveryPostalCode,
        DireccionPostal: [
          detalle.PostalAddressLine1,
          detalle.PostalAddressLine2,
        ]
          .filter(Boolean)
          .join("\n"),
        BillToCustomerID: detalle.BillToCustomerID,
        CustomerCategoryID: detalle.CustomerCategoryID,
        BuyingGroupID: detalle.BuyingGroupID,
        PrimaryContactPersonID: detalle.PrimaryContactPersonID,
        AlternateContactPersonID: detalle.AlternateContactPersonID,
        DeliveryMethodID: detalle.DeliveryMethodID,
        DeliveryCityID: detalle.DeliveryCityID,
        Latitud: detalle.Latitud,
        Longitud: detalle.Longitud,
      });
      setModalFormularioAbierto(true);
    } catch (error) {
      console.error("Error al cargar el cliente para editar:", error);
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  /**
   * Actualiza un campo del formulario y convierte IDs y valores numéricos.
   * @param {import('react').ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} evento
   *   Evento de cambio del campo.
   */
  const manejarCambioFormulario = (evento) => {
    let valor = evento.target.value;
    const camposId = [
      "CustomerCategoryID",
      "BillToCustomerID",
      "PrimaryContactPersonID",
      "AlternateContactPersonID",
      "BuyingGroupID",
      "DeliveryMethodID",
      "DeliveryCityID",
    ];
    if (
      evento.target.type === "number" ||
      camposId.includes(evento.target.name)
    ) {
      if (valor === "") {
        valor = null;
      } else {
        valor = Number(valor);
      }
    } else if (valor === "") {
      valor = null;
    }

    setFormData((datosAnteriores) => ({
      ...datosAnteriores,
      [evento.target.name]: valor,
    }));
  };

  /**
   * Guarda las coordenadas capturadas para la ubicación de entrega.
   * @param {number|null} latitud Latitud seleccionada.
   * @param {number|null} longitud Longitud seleccionada.
   */
  const manejarUbicacionCapturada = (latitud, longitud) => {
    setFormData((datosAnteriores) => ({
      ...datosAnteriores,
      Latitud: latitud,
      Longitud: longitud,
    }));
  };

  /**
   * Crea o actualiza el cliente y vuelve a cargar la lista.
   * @returns {Promise<void>} Completa el guardado y actualiza la interfaz.
   */
  const guardarCliente = async () => {
    const url = modoEdicion
      ? `${API_URL}/api/clientes/${clienteIdEdicion}`
      : `${API_URL}/api/clientes`;
    /**
     * Separa una dirección multilínea en sus dos campos de almacenamiento.
     * @param {string|null|undefined} direccion Dirección escrita en el formulario.
     * @returns {{linea1: string|null, linea2: string|null}} Líneas de dirección.
     */
    const separarDireccion = (direccion) => {
      const lineas = String(direccion ?? "").split(/\r?\n/);
      const direccionVacia = lineas.every((linea) => !linea.trim());

      return {
        linea1: direccionVacia ? null : lineas[0],
        linea2: direccionVacia ? null : lineas.slice(1).join("\n"),
      };
    };
    const direccionEntrega = separarDireccion(formData.DireccionEntrega);
    const direccionPostal = separarDireccion(formData.DireccionPostal);
    const datosCliente = {
      ...formData,
      DeliveryAddressLine1: direccionEntrega.linea1,
      DeliveryAddressLine2: direccionEntrega.linea2,
      PostalAddressLine1: direccionPostal.linea1,
      PostalAddressLine2: direccionPostal.linea2,
    };
    delete datosCliente.DireccionEntrega;
    delete datosCliente.DireccionPostal;

    try {
      const respuesta = await fetch(url, {
        method: modoEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosCliente),
      });
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        const error = new Error(
          resultado.errorMsg || "No se pudo guardar el cliente.",
        );
        error.ocultarModulo = resultado.esErrorCriticoBD;
        throw error;
      }

      setModalFormularioAbierto(false);
      await fetchClientes(filtroNombre, filtroCategoria, filtroMetodoEntrega);
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  /**
   * Solicita confirmación y elimina el cliente seleccionado.
   * @param {number|string} id Identificador del cliente.
   * @returns {Promise<void>} Completa la eliminación y recarga la lista.
   */
  const eliminarCliente = async (id) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este cliente?")) {
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/clientes/${id}`, {
        method: "DELETE",
      });
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        const error = new Error(
          resultado.errorMsg || "No se pudo eliminar el cliente.",
        );
        error.ocultarModulo = resultado.esErrorCriticoBD;
        throw error;
      }

      await fetchClientes(filtroNombre, filtroCategoria, filtroMetodoEntrega);
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      fetchClientes("");
      fetchOpcionesFormulario();
    }, 0);

    return () => window.clearTimeout(temporizador);
  }, [fetchClientes, fetchOpcionesFormulario]);

  /** Limpia los tres filtros y vuelve a cargar todos los clientes. */
  const restaurarFiltros = () => {
    setFiltroNombre("");
    setFiltroCategoria("");
    setFiltroMetodoEntrega("");
    fetchClientes("", "", "");
  };

  /**
   * Carga y abre el modal con el detalle del cliente indicado.
   * @param {number|string} id Identificador del cliente.
   * @returns {Promise<void>} Abre el detalle o muestra un error.
   */
  const abrirDetalle = async (id) => {
    try {
      const respuesta = await fetch(`${API_URL}/api/clientes/${id}`);
      const detalle = await respuesta.json();

      if (!respuesta.ok) {
        const error = new Error(
          detalle.errorMsg || "No se pudieron cargar los detalles del cliente.",
        );
        error.ocultarModulo = detalle.esErrorCriticoBD;
        throw error;
      }

      setClienteSeleccionado(detalle);
      setDetalleAbierto(true);
    } catch (error) {
      console.error("Error al obtener detalle del cliente:", error);
      mostrarError(error, onErrorNotificacion, onErrorOcultarModulo);
    }
  };

  let textoCantidadClientes;
  if (clientes.length === 1) {
    textoCantidadClientes = "1 cliente encontrado";
  } else {
    textoCantidadClientes = `${clientes.length} clientes encontrados`;
  }

  let filasClientes;
  if (clientes.length > 0) {
    filasClientes = clientesVisibles.map((cliente) => (
      <TableRow key={cliente.CustomerID} hover>
        <TableCell>
          <Typography sx={{ fontWeight: 700, color: "#1e293b" }}>
            {cliente.NombreCliente}
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            ID: {cliente.CustomerID}
          </Typography>
        </TableCell>
        <TableCell>{cliente.Categoria || "N/A"}</TableCell>
        <TableCell>{cliente.MetodoEntrega || "N/A"}</TableCell>
        <TableCell align="center">
          <IconButton
            size="small"
            title="Ver detalles"
            onClick={() => abrirDetalle(cliente.CustomerID)}
            sx={{ color: "#2563eb", backgroundColor: "#eff6ff" }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            title="Editar cliente"
            onClick={() => abrirFormularioEdicion(cliente)}
            sx={{ color: "#d97706", backgroundColor: "#fffbeb", ml: 1 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            title="Eliminar cliente"
            onClick={() => eliminarCliente(cliente.CustomerID)}
            sx={{ color: "#dc2626", backgroundColor: "#fef2f2", ml: 1 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  } else {
    filasClientes = (
      <TableRow>
        <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
          <GroupsOutlinedIcon sx={{ fontSize: 50, color: "#cbd5e1" }} />
          <Typography variant="h6" sx={{ color: "#475569", fontWeight: 600 }}>
            No hay clientes
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            No se encontraron clientes con los filtros actuales.
          </Typography>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <ModuloInterfazBase
      titulo="Gestión de Clientes"
      descripcion="Consulta y administra los clientes registrados"
      Icono={GroupsOutlinedIcon}
      IconoBoton={PersonAddIcon}
      textoBoton="Nuevo cliente"
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
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#1e293b" }}
            >
              Buscar clientes
            </Typography>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr auto auto" },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <TextField
              label="Nombre del cliente"
              size="small"
              value={filtroNombre}
              onChange={(event) => setFiltroNombre(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  fetchClientes(
                    filtroNombre,
                    filtroCategoria,
                    filtroMetodoEntrega,
                  );
                }
              }}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ backgroundColor: "white" }}
            />
            <TextField
              select
              label="Categoría del cliente"
              size="small"
              value={filtroCategoria}
              onChange={(event) => setFiltroCategoria(event.target.value)}
              sx={{ backgroundColor: "white", textAlign: "left" }}
            >
              <MenuItem value="">Todas las categorías</MenuItem>
              {(opcionesFormulario.categorias || []).map((categoria) => (
                <MenuItem
                  key={categoria.CustomerCategoryID}
                  value={categoria.CustomerCategoryName}
                >
                  {categoria.CustomerCategoryName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Método de entrega"
              size="small"
              value={filtroMetodoEntrega}
              onChange={(event) => setFiltroMetodoEntrega(event.target.value)}
              sx={{ backgroundColor: "white", textAlign: "left" }}
            >
              <MenuItem value="">Todos los métodos</MenuItem>
              {(opcionesFormulario.metodosEntrega || []).map((metodo) => (
                <MenuItem
                  key={metodo.DeliveryMethodID}
                  value={metodo.DeliveryMethodName}
                >
                  {metodo.DeliveryMethodName}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() =>
                fetchClientes(
                  filtroNombre,
                  filtroCategoria,
                  filtroMetodoEntrega,
                )
              }
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
            Clientes registrados
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", mt: 0.3, mb: 1.5 }}
          >
            {textoCantidadClientes}
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
                    CLIENTE
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
              <TableBody>{filasClientes}</TableBody>
            </Table>
          </TableContainer>
          <PaginacionTabla
            cantidadTotalFilas={clientes.length}
            numPaginaActual={pagina}
            cantidadFilasPorPagina={cantidadFilasPorPagina}
            setNumPaginaActual={setPagina}
            setCantidadFilasPorPagina={setCantidadFilasPorPagina}
            onCambiarPagina={(_, nuevaPagina) => setPagina(nuevaPagina)}
          />
        </Box>
      </Box>

      <ModalDetallesCliente
        abierto={detalleAbierto}
        onClose={() => setDetalleAbierto(false)}
        cliente={clienteSeleccionado}
      />
      <ModalFormularioCliente
        abierto={modalFormularioAbierto}
        onClose={() => setModalFormularioAbierto(false)}
        modoEdicion={modoEdicion}
        formData={formData}
        opciones={opcionesFormulario}
        manejarCambio={manejarCambioFormulario}
        manejarUbicacionCapturada={manejarUbicacionCapturada}
        guardarCliente={guardarCliente}
      />
    </ModuloInterfazBase>
  );
}
