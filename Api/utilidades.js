const sql = require("mssql");

const conectarBaseDatos = async () => {
  try {
    return await sql.connect(process.env.DB_CONFIG);
  } catch (error) {
    error.envIncorrecto = true;
    throw error;
  }
};

const manejarError = (res, err) => {
  // Errores críticos comunes. Si pasa al menos uno de estos, se oculta el módulo actual y se muestra un mensaje de error al usuario.

  //Cuando en el código se hace referencia a un procedimiento almacenado que no existe.
  const procedimientoNoEncontrado = err.number === 2812 || err.originalError?.info?.number === 2812;
  //Cuando en el código se hace referencia a una tabla que no existe.
  const tablaNoEncontrada = err.number === 208 || err.originalError?.info?.number === 208;
  //Cuando la base de datos no existe o el usuario 'sa' no tiene permisos.
  const baseDeDatosInaccesible = err.number === 4060 || err.originalError?.info?.number === 4060;

  if (err.envIncorrecto || procedimientoNoEncontrado || tablaNoEncontrada || baseDeDatosInaccesible) {
      res.status(500).json({
        errorMsg: err.message,
        esErrorCriticoBD: true,
      });
  } else {
      res.status(500).json({
        errorMsg: err.message,
        esErrorCriticoBD: false,
      });
  }
};

module.exports = { sql, conectarBaseDatos, manejarError };
