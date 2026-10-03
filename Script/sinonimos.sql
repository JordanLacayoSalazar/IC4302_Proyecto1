USE WideWorldImporters;
GO

-- ==========================================
--  CREACIÓN DE SINÓNIMOS
-- ==========================================
DROP SYNONYM IF EXISTS syn_Clientes;
CREATE SYNONYM syn_Clientes FOR Sales.Customers;

DROP SYNONYM IF EXISTS syn_CategoriasCliente;
CREATE SYNONYM syn_CategoriasCliente FOR Sales.CustomerCategories;

DROP SYNONYM IF EXISTS syn_GruposCompra;
CREATE SYNONYM syn_GruposCompra FOR Sales.BuyingGroups;

DROP SYNONYM IF EXISTS syn_Proveedores;
CREATE SYNONYM syn_Proveedores FOR Purchasing.Suppliers;

DROP SYNONYM IF EXISTS syn_CategoriasProveedor;
CREATE SYNONYM syn_CategoriasProveedor FOR Purchasing.SupplierCategories;

DROP SYNONYM IF EXISTS syn_MetodosEntrega;
CREATE SYNONYM syn_MetodosEntrega FOR Application.DeliveryMethods;

DROP SYNONYM IF EXISTS syn_Ciudades;
CREATE SYNONYM syn_Ciudades FOR Application.Cities;

DROP SYNONYM IF EXISTS syn_Personas;
CREATE SYNONYM syn_Personas FOR Application.People;
GO
