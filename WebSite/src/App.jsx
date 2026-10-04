import { useState } from "react";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LogoutIcon from "@mui/icons-material/Logout";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Proveedores from "./pages/proveedores/Proveedores";
import Clientes from "./pages/clientes/Clientes";
import Inventario from "./pages/inventario/Inventario";
import Reportes from "./pages/reportes/Reportes";
import { verificarConexionBD } from "./components/ModuloHerramientas";
import { Box, CircularProgress, Typography } from "@mui/material";
import "./App.css";

const modulos = [
  {
    id: "clientes",
    numero: "01",
    nombre: "Clientes",
    descripcion:
      "Gestiona y consulta la información de los clientes registrados, sus contactos, direcciones, métodos de entrega y datos de facturación.",
    Icono: GroupsOutlinedIcon,
  },
  {
    id: "proveedores",
    numero: "02",
    nombre: "Proveedores",
    descripcion:
      "Administra y consulta los proveedores, incluyendo sus datos de contacto, direcciones, métodos de entrega e información bancaria.",
    Icono: LocalShippingOutlinedIcon,
  },
  {
    id: "inventarios",
    numero: "03",
    nombre: "Inventarios",
    descripcion:
      "Consulta y gestiona los productos disponibles, sus características, precios, proveedores, existencias y ubicaciones.",
    Icono: Inventory2OutlinedIcon,
  },
  {
    id: "ventas",
    numero: "04",
    nombre: "Ventas",
    descripcion:
      "Consulta y gestiona las ventas realizadas, facturas, clientes, productos, cantidades, impuestos y totales.",
    Icono: AttachMoneyIcon,
  },
];

const reportes = {
  id: "reportes",
  nombre: "Reportes estadisticos",
  descripcion:
    "Analiza las compras, ventas, inventarios y principales indicadores mediante reportes y consultas estadísticas.",
  Icono: QueryStatsOutlinedIcon,
};

function App() {
  const [moduloActual, setmoduloActual] = useState(null);
  const [ErrorNotificacion, setErrorNotificacion] = useState("");
  const [ErrorOcultarModulo, setErrorOcultarModulo] = useState("");
  const [verificandoConexion, setVerificandoConexion] = useState(false);
  let contenido;

  const abrirModulo = async (id) => {
    setErrorNotificacion("");
    setErrorOcultarModulo("");
    setmoduloActual(id);
    setVerificandoConexion(true);

    try {
      await verificarConexionBD();
    } catch (error) {
      const mensaje = error.message || String(error);
      setErrorOcultarModulo(mensaje);
    } finally {
      setVerificandoConexion(false);
    }
  };

  if (moduloActual === null) {
    contenido = (
      <section aria-labelledby="titulo-inicio" className="contenido-inicio">
        <header className="encabezado">
          <p className="titulo-tec">Instituto Tecnológico de Costa Rica</p>
          <p className="titulo-curso">IC4302 - Bases de Datos II</p>
          <h1 id="titulo-inicio" className="titulo-proyecto">
            Proyecto #1: Wide World Importers
          </h1>
          <p className="integrantes">
            Integrantes del grupo: Jordan Lacayo y Antony Campbell.
          </p>
        </header>

        <div aria-label="Modulos disponibles" className="cuadricula-modulos">
          {modulos.map((modulo) => (
            <button
              className="tarjeta-modulo"
              key={modulo.id}
              onClick={() => abrirModulo(modulo.id)}
              type="button"
            >
              <span className="fila-superior-tarjeta">
                <span className="icono-modulo">
                  <modulo.Icono aria-hidden="true" />
                </span>
                <span className="numero-modulo">{modulo.numero}</span>
              </span>
              <span className="titulo-modulo">{modulo.nombre}</span>
              <span className="descripcion-modulo">{modulo.descripcion}</span>
              <span aria-hidden="true" className="accion-tarjeta">
                Abrir módulo
                <OpenInNewIcon className="icono-abrir" />
              </span>
            </button>
          ))}
        </div>
        <button
          className="tarjeta-reportes"
          onClick={() => abrirModulo(reportes.id)}
          type="button"
        >
          <span className="icono-reportes">
            <reportes.Icono aria-hidden="true" />
          </span>
          <span className="contenido-reportes">
            <span className="titulo-reportes">{reportes.nombre}</span>
            <span className="descripcion-reportes">{reportes.descripcion}</span>
          </span>
          <span aria-hidden="true" className="accion-reportes">
            Ver reportes
            <OpenInNewIcon className="icono-abrir" />
          </span>
        </button>
      </section>
    );
  } else {
    let contenidoModulo = null;

    if (ErrorOcultarModulo) {
      contenido = (
        <section className="pantalla-error-conexion">
          <div className="cuadro-error-conexion" role="alert">
            <h1>Error al acceder a la base de datos</h1>
            <p>Mensaje de error: {ErrorOcultarModulo}</p>
            <div className="causas-error">
              <p>
                <strong>Posibles causas:</strong>
              </p>
              <p>• Verifique que la API esté en ejecución.</p>
              <p>
                • Verifique la configuración del archivo .env en la carpeta Api
                para conectarse a SQL Server.
              </p>
            </div>
            <button
              className="boton-volver"
              onClick={() => {
                setErrorNotificacion("");
                setErrorOcultarModulo("");
                setmoduloActual(null);
              }}
              type="button"
            >
              <LogoutIcon aria-hidden="true" className="icono-volver" />
              Volver al menú principal
            </button>
          </div>
        </section>
      );
    } else if (verificandoConexion) {
      contenido = (
        <section className="contenido-modulo">
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CircularProgress size={24} />
              <Typography>
                Verificando conexión con la base de datos...
              </Typography>
            </Box>
          </Box>
        </section>
      );
    } else {
      if (moduloActual === "proveedores") {
        contenidoModulo = (
          <Proveedores
            onErrorNotificacion={setErrorNotificacion}
            onErrorOcultarModulo={(mensaje) => {
              setErrorNotificacion("");
              setErrorOcultarModulo(mensaje);
            }}
          />
        );
      } else if (moduloActual === "clientes") {
        contenidoModulo = (
          <Clientes
            onErrorNotificacion={setErrorNotificacion}
            onErrorOcultarModulo={(mensaje) => {
              setErrorNotificacion("");
              setErrorOcultarModulo(mensaje);
            }}
          />
        );
      } else if (moduloActual === "inventarios") {
        contenidoModulo = (
          <Inventario
            onErrorNotificacion={setErrorNotificacion}
            onErrorOcultarModulo={(mensaje) => {
              setErrorNotificacion("");
              setErrorOcultarModulo(mensaje);
            }}
          />
        );
      } else if (moduloActual === "reportes") {
        contenidoModulo = (
          <Reportes
            onErrorNotificacion={setErrorNotificacion}
            onErrorOcultarModulo={(mensaje) => {
              setErrorNotificacion("");
              setErrorOcultarModulo(mensaje);
            }}
          />
        );
      }

      contenido = (
        <section className="contenido-modulo">
          <button
            className="boton-volver"
            onClick={() => {
              setErrorNotificacion("");
              setErrorOcultarModulo("");
              setmoduloActual(null);
            }}
            type="button"
          >
            <LogoutIcon aria-hidden="true" className="icono-volver" />
            Volver al menú principal
          </button>
          {contenidoModulo}
        </section>
      );
    }
  }

  return (
    <main className="contenedor-aplicacion">
      {contenido}
      <Snackbar
        autoHideDuration={10000}
        onClose={() => setErrorNotificacion("")}
        open={Boolean(ErrorNotificacion)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorNotificacion("")}
          severity="error"
          variant="filled"
          sx={{
            maxWidth: "90vw",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {ErrorNotificacion}
        </Alert>
      </Snackbar>
    </main>
  );
}

export default App;
