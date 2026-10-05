USE WideWorldImporters;
GO


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

DROP SYNONYM IF EXISTS syn_Productos;
CREATE SYNONYM syn_Productos FOR Warehouse.StockItems;

DROP SYNONYM IF EXISTS syn_Colores;
CREATE SYNONYM syn_Colores FOR Warehouse.Colors;

DROP SYNONYM IF EXISTS syn_TiposEmpaque;
CREATE SYNONYM syn_TiposEmpaque FOR Warehouse.PackageTypes;

DROP SYNONYM IF EXISTS syn_GruposProducto;
CREATE SYNONYM syn_GruposProducto FOR Warehouse.StockGroups;

DROP SYNONYM IF EXISTS syn_ProductoGrupos;
CREATE SYNONYM syn_ProductoGrupos FOR Warehouse.StockItemStockGroups;

DROP SYNONYM IF EXISTS syn_Inventario;
CREATE SYNONYM syn_Inventario FOR Warehouse.StockItemHoldings;

DROP SYNONYM IF EXISTS syn_OrdenesCompra;
CREATE SYNONYM syn_OrdenesCompra FOR Purchasing.PurchaseOrders;

DROP SYNONYM IF EXISTS syn_LineasOrdenCompra;
CREATE SYNONYM syn_LineasOrdenCompra FOR Purchasing.PurchaseOrderLines;

DROP SYNONYM IF EXISTS syn_Facturas;
CREATE SYNONYM syn_Facturas FOR Sales.Invoices;

DROP SYNONYM IF EXISTS syn_LineasFactura;
CREATE SYNONYM syn_LineasFactura FOR Sales.InvoiceLines;

DROP SYNONYM IF EXISTS syn_TransaccionesCliente;
CREATE SYNONYM syn_TransaccionesCliente FOR Sales.CustomerTransactions;

DROP SYNONYM IF EXISTS syn_TransaccionesInventario;
CREATE SYNONYM syn_TransaccionesInventario FOR Warehouse.StockItemTransactions;
GO
