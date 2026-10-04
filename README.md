# Proyecto #1: Wide World Importers

### Integrantes del grupo: 

| Nombre | Carné |
| ------ | ----- |
| **Jordan Javier Lacayo Salazar** | 2025092130 |
| **Antony Roberto Campbell Ortega** | 2024174749 |

### Estado del proyecto: **Excelente**

### Enlace del video de la aplicación en ejecución:

<br>

---

**Importante:** La API requiere el archivo .env para funcionar correctamente. Para no exponer información sensible, este archivo no se incluye en este repositorio. Antes de ejecutar la aplicación, se debe crear el archivo .env en la raíz de la carpeta Api y colocar las credenciales. Para más información, vaya a la sección **Pasos de instalación de programas y herramientas utilizadas: Express: dotenv.**

---
<br>

## Pasos de instalación de programas y herramientas utilizadas
En la tarea #1 del presente curso, se realizó gran parte de la preparación del entorno de desarrollo que será utilizado durante el proyecto. Se instalaron y configuraron las herramientas necesarias para trabajar con SQL Server y el desarrollo de los servicios web mediante Node.js.

Las principales herramientas y componentes instalados durante esta tarea fueron:
- SQL Server 2025 Express: el motor de base de datos.
- Node.js: herramienta utilizada para desarrollar los servicios web.
- `npm`: herramientas utilizada para administrar las librerías usadas por el proyecto.
- Express.js: framework utilizado para crear la API y configurar sus rutas.
- `mssql`: controlador utilizado para establecer la comunicación entre Node.js y SQL Server.
- `dotenv`: librería utilizada para cargar las variables de configuración desde el archivo .env.
  
Ahora bien, para el desarrollo de este proyecto, se tuvieron que instalar más componentes para poder cumplir con los requerimientos. A continuación, se detallan los pasos de instalación:
<br>

### React
React es una biblioteca de JavaScript utilizada para desarrollar la interfaz de usuario de la aplicación web. En este proyecto se utilizó para construir las diferentes páginas correspondientes a los módulos de Clientes, Proveedores, Inventarios y Ventas, así como los componentes necesarios para mostrar y gestionar la información.

Para crear el proyecto con React se ejecutó en la carpeta WebSite:
```bash
npm create vite@latest frontend
```
Durante la creación del proyecto se seleccionó:
- Framework: React
- Lenguaje: JavaScript

Posteriormente, se instalaron las dependencias:
```bash
npm install
```

Aprovechando las capacidades de React, se instaló la siguiente librería:
#### Material UI
MUI es una biblioteca de componentes para React que permite crear interfaces modernas de manera sencilla.  
En el proyecto se utilizó para construir elementos de la interfaz como botones, paginación de tablas, ventanas modales, menús y formularios, además del uso de íconos para mejorar la usabilidad, guiar visualmente al usuario en las acciones del sistema y enriquecer la experiencia general de la aplicación.

Para instalar Material UI se ejecutaron los siguientes comandos dentro del directorio WebSite:
```bash
npm install @mui/material @emotion/react @emotion/styled
```
- `@mui/material`: Dependencia principal de Material UI. Proporciona una colección de componentes prediseñados para React.
- `@emotion/react`: Dependencia de Material UI que permite que sus componentes puedan gestionar sus estilos dentro de React.
- `@emotion/styled`: Dependencia de Material UI que complementa el sistema de estilos de Emotion.
  
Y también para usar el conjunto de iconos de Material UI mediante:
```bash
npm install @mui/icons-material
```

> **Nota:** Al descargar o clonar este repositorio, para instalar todas las dependencias de React, se ejecuta `npm install` en la carpeta WebSite.

<br><br>

### Express
Express es un framework para Node.js utilizado para crear los diferentes endpoints de la API, los cuales permiten que el frontend realice solicitudes HTTP al backend. Estas solicitudes son procesadas por la API y, cuando corresponde, ejecutan los procedimientos almacenados desarrollados en SQL Server para consultar o modificar la información.

Para lograrlo, primero se ejecutó este comando en la carpeta Api con el fin de crear el proyecto Node.js:
```bash
npm init -y
```
Posteriormente se instaló Express:
```bash
npm install express
```

#### MSSQL
Este paquete permite establecer una conexión entre Node.js y Microsoft SQL Server. En este proyecto es utilizado por la API para conectarse a la base de datos y ejecutar los procedimientos almacenados.

Se instaló con el comando:
```bash
npm install mssql
```

#### CORS
El Cross-Origin Resource Sharing permite la comunicación entre el frontend y el backend que conforman el programa. Debido a que ambas aplicaciones se ejecutan en diferentes puertos durante el desarrollo, son considerados orígenes diferentes por el navegador. Así que la configuración de CORS permite que el frontend pueda realizar solicitudes HTTP a los endpoints de la API.

Se instaló con el comando:
```bash
npm install cors
```
Dicha configuración se aplica en el archivo `index.js` mediante las siguientes líneas:
```js
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
```
Esto habilita el CORS en la aplicación Express.

#### Leaflet
Leaflet es una biblioteca de JavaScript utilizada para trabajar con mapas interactivos. Se usa para mostrar la ubicación geográfica en la información detallada de los clientes y proveedores a partir de las coordenadas almacenadas en la base de datos, específicamente en el campo DeliveryLocation de la tabla Purchasing.Suppliers.

La instalación se realizó mediante:
```bash
npm install leaflet react-leaflet
```
Se usan principalmente:
- `leaflet`: biblioteca encargada de la funcionalidad del mapa.
- `react-leaflet`: integración de Leaflet con React.

#### dotenv
`dotenv` permite cargar variables de configuración desde un archivo .env, ya que, por motivos de seguridad, las credenciales utilizadas para conectarse a SQL Server no deben escribirse directamente en el código fuente, ya que el proyecto será almacenado en GitHub.

Entonces, se debe utilizar un archivo .env para almacenar las credenciales y otros datos necesarios para establecer la conexión con el motor de base de datos.

Se instaló `dotenv` con el comando:
```bash
npm install dotenv
```

**Configuración del archivo .env:** En la raíz del directorio Api, se debe crear el archivo .env. Dentro del archivo, se deben colocar las siguientes variables:
```
DB_CONFIG="Server=localhost,1433;Database=WideWorldImporters;User Id=sa;Password=CONTRASEÑA;TrustServerCertificate=true;"
PORT=3000
```
Se debe reemplazar `CONTRASEÑA` por la contraseña real.

> **Nota:** Al descargar o clonar este repositorio, para instalar todas las dependencias de Express, se ejecuta `npm install` en la carpeta Api.

<br><br>


## Objetivos alcanzados
- Implementación de la interfaz web mediante React.
- Implementación de la API mediante Express.
- Conexión de la base de datos Wide World Importers con la aplicación web.
- Creación del módulo de Clientes, permitiendo consultar y gestionar todos los registros, utilizando filtros de búsqueda acumulativos y mostrando la información detallada de cada cliente.
- Creación del módulo de Proveedores, permitiendo consultar y gestionar todos los registros, utilizando filtros de búsqueda acumulativos y mostrando la información detallada de cada proveedor.
- Creación del módulo de Inventarios, permitiendo consultar y gestionar todos los registros, utilizando filtros de búsqueda acumulativos y mostrando la información detallada de cada inventario.
- Creación del módulo de Ventas, permitiendo consultar y gestionar todos los registros, utilizando filtros de búsqueda acumulativos y mostrando la información detallada de cada venta.
- Desarrollo de los reportes y consultas estadísticas solicitados, utilizando funciones como ROLLUP y DENSE_RANK.
- Configuración de sinónimos para el acceso a las tablas desde los procedimientos almacenados.
- Desarrollo de los procedimientos almacenados, usando TRANSACTION, COMMIT y ROLLBACK para crear, modificar y eliminar registros.
- Integración de la API con los procedimientos almacenados, permitiendo procesar las consultas y enviar sus resultados a la interfaz web.
- Incorporación de manejo de errores para controlar situaciones inesperadas durante el uso de la aplicación.
  
## Objetivos no alcanzados
No se identificaron objetivos no alcanzados. Todos los objetivos establecidos en el enunciado del proyecto fueron implementados.


