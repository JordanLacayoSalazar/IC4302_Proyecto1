import { useState } from "react";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LogoutIcon from "@mui/icons-material/Logout";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Proveedores from "./components/Proveedores";
import "./App.css";

const modulos = [
  {
    id: "clientes",
    numero: "01",
    nombre: "Clientes",
    descripcion: "Consulta y administra la información de los clientes.",
    Icono: GroupsOutlinedIcon,
  },
  {
    id: "proveedores",
    numero: "02",
    nombre: "Proveedores",
    descripcion: "Gestiona proveedores, contactos y datos de entrega.",
    Icono: LocalShippingOutlinedIcon,
  },
  {
    id: "inventarios",
    numero: "03",
    nombre: "Inventarios",
    descripcion: "Explora productos, existencias y detalles de inventario.",
    Icono: Inventory2OutlinedIcon,
  },
  {
    id: "ventas",
    numero: "04",
    nombre: "Ventas",
    descripcion: "Consulta facturas, clientes y detalle de ventas.",
    Icono: AttachMoneyIcon,
  },
];

const reportes = {
  id: "reportes",
  nombre: "Reportes estadisticos",
  descripcion: "Indicadores, tendencias y resumenes del negocio.",
  Icono: QueryStatsOutlinedIcon,
};

function App() {
  const [moduloActual, setmoduloActual] = useState(null);
  const [errorModulo, setErrorModulo] = useState("");
  const [errorConexion, setErrorConexion] = useState("");
  let contenido;

  const abrirModulo = (id) => {
    setErrorModulo("");
    setErrorConexion("");
    setmoduloActual(id);
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
            <span className="descripcion-reportes">
              {reportes.descripcion}
            </span>
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

    if (errorConexion) {
      contenido = (
        <section className="pantalla-error-conexion">
          <div className="cuadro-error-conexion" role="alert">
            <h1>Error al acceder a la base de datos</h1>
            <p>Mensaje de error: {errorConexion}</p>
            <div className="causas-error">
              <p>
                <strong>Posibles causas:</strong>
              </p>
              <p>• Verifique que la API esté en ejecución.</p>
              <p>
                • Verifique la configuración del archivo .env en la carpeta
                Api para conectarse a SQL Server.
              </p>
            </div>
            <button
              className="boton-volver"
              onClick={() => {
                setErrorModulo("");
                setErrorConexion("");
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
    } else {
      if (moduloActual === "proveedores") {
        contenidoModulo = (
          <Proveedores
            onError={setErrorModulo}
            onConnectionError={(mensaje) => {
              setErrorModulo("");
              setErrorConexion(mensaje);
            }}
          />
        );
      }

      contenido = (
        <section className="contenido-modulo">
          <button
            className="boton-volver"
            onClick={() => {
              setErrorModulo("");
              setErrorConexion("");
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
        onClose={() => setErrorModulo("")}
        open={Boolean(errorModulo)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorModulo("")}
          severity="error"
          variant="filled"
          sx={{ maxWidth: "90vw", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
        >
          {errorModulo}
        </Alert>
      </Snackbar>
    </main>
  );
}

export default App;
