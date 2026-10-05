USE WideWorldImporters;
GO

/*
Lista de códigos de errores:
- 50101: El año inicial no puede ser mayor que el año final.
- 50102: El año inicial no existe en los datos de facturación.
- 50103: El año final no existe en los datos de facturación.
- 50104: El año inicial no existe en los datos de órdenes de compra.
- 50105: El año final no existe en los datos de órdenes de compra.
- 50201: El año indicado no existe en las facturas de la base de datos.
- 50210: El año indicado no existe en las órdenes de compra.
- 50211: El mes debe estar entre 1 y 12.
- 50212: El año indicado no existe en las facturas de la base de datos.
*/

-- ================================================================
-- REPORTE 1: compras a proveedores por proveedor y categoría
-- Parámetros : @Proveedor, @Categoria
-- Requisitos : MAX, MIN, AVG, agrupación y ROLLUP.
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerReporte1
    @Proveedor NVARCHAR(100) = NULL,
    @Categoria NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    WITH ComprasPorOrden AS
    (
        SELECT
            po.PurchaseOrderID,
            s.SupplierName,
            sc.SupplierCategoryName,
            SUM(pol.OrderedOuters * pol.ExpectedUnitPricePerOuter) AS MontoOrden
        FROM syn_OrdenesCompra AS po
        INNER JOIN syn_LineasOrdenCompra AS pol
            ON po.PurchaseOrderID = pol.PurchaseOrderID
        INNER JOIN syn_Proveedores AS s
            ON po.SupplierID = s.SupplierID
        INNER JOIN syn_CategoriasProveedor AS sc
            ON s.SupplierCategoryID = sc.SupplierCategoryID
        WHERE
            (
                NULLIF(LTRIM(RTRIM(@Proveedor)), '') IS NULL
                OR s.SupplierName LIKE '%' + LTRIM(RTRIM(@Proveedor)) + '%'
            )
            AND
            (
                NULLIF(LTRIM(RTRIM(@Categoria)), '') IS NULL
                OR sc.SupplierCategoryName LIKE '%' + LTRIM(RTRIM(@Categoria)) + '%'
            )
        GROUP BY
            po.PurchaseOrderID,
            s.SupplierName,
            sc.SupplierCategoryName
    )
    SELECT
        CASE
            WHEN GROUPING(SupplierCategoryName) = 1
                 AND GROUPING(SupplierName) = 1
                THEN 'TOTAL GENERAL'
            WHEN GROUPING(SupplierName) = 1
                THEN 'TOTAL CATEGORÍA'
            ELSE SupplierCategoryName
        END AS Categoria,
        CASE
            WHEN GROUPING(SupplierCategoryName) = 1
                 AND GROUPING(SupplierName) = 1
                THEN 'TOTAL GENERAL'
            WHEN GROUPING(SupplierName) = 1
                THEN SupplierCategoryName
            ELSE SupplierName
        END AS Proveedor,
        CAST(MAX(MontoOrden) AS DECIMAL(18,2)) AS MontoMasAlto,
        CAST(MIN(MontoOrden) AS DECIMAL(18,2)) AS MontoMasBajo,
        CAST(AVG(MontoOrden) AS DECIMAL(18,2)) AS CompraPromedio
    FROM ComprasPorOrden
    GROUP BY ROLLUP(SupplierCategoryName, SupplierName)
    ORDER BY
        GROUPING(SupplierCategoryName),
        SupplierCategoryName,
        GROUPING(SupplierName),
        SupplierName;
END;
GO


/*
================================================================================
REPORTE 2: Estadísticas de ventas por cliente y categoría
-- Parámetros : @NombreCliente, @Categoria
-- Requisitos : MAX, MIN, AVG, agrupación y ROLLUP.
Obtiene el monto más alto, monto más bajo y venta promedio por
cliente y categoría de cliente. Se puede filtrar por nombre de cliente y categoría.
================================================================================
*/
CREATE OR ALTER PROCEDURE ObtenerReporte2
    @NombreCliente NVARCHAR(100) = NULL,
    @Categoria NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Se calcula el monto total de cada factura sumando los precios extendidos y los impuestos de sus líneas
    WITH TotalesFactura AS (
        SELECT
            il.InvoiceID,
            SUM(ISNULL(il.ExtendedPrice, 0) + ISNULL(il.TaxAmount, 0)) AS Monto
        FROM syn_LineasFactura AS il
        GROUP BY il.InvoiceID
    )
    SELECT
        CASE
            WHEN GROUPING(cc.CustomerCategoryName) = 1 AND GROUPING(c.CustomerName) = 1
                THEN 'TOTAL GENERAL'
            WHEN GROUPING(c.CustomerName) = 1
                THEN CONCAT('TOTAL CATEGORÍA: ', cc.CustomerCategoryName)
            ELSE cc.CustomerCategoryName
        END AS Categoria,

        CASE
            WHEN GROUPING(cc.CustomerCategoryName) = 1 AND GROUPING(c.CustomerName) = 1
                OR GROUPING(c.CustomerName) = 1
                THEN ''
            ELSE c.CustomerName
        END AS Cliente,

        CASE WHEN GROUPING(c.CustomerName) = 1 THEN NULL ELSE MAX(c.CustomerID) END AS ClienteID,

        MAX(ISNULL(tf.Monto, 0)) AS MontoMasAlto,
        MIN(ISNULL(tf.Monto, 0)) AS MontoMasBajo,
        AVG(CAST(ISNULL(tf.Monto, 0) AS DECIMAL(18, 2))) AS VentaPromedio

    FROM syn_Facturas AS i

    INNER JOIN syn_Clientes AS c
        ON i.CustomerID = c.CustomerID

    INNER JOIN syn_CategoriasCliente AS cc
        ON c.CustomerCategoryID = cc.CustomerCategoryID

    LEFT JOIN TotalesFactura AS tf
        ON i.InvoiceID = tf.InvoiceID

    WHERE
        (@NombreCliente IS NULL OR c.CustomerName LIKE '%' + LTRIM(RTRIM(@NombreCliente)) + '%')
        AND (@Categoria IS NULL OR cc.CustomerCategoryName LIKE '%' + LTRIM(RTRIM(@Categoria)) + '%')

    GROUP BY ROLLUP (cc.CustomerCategoryName, c.CustomerName)

    ORDER BY
        GROUPING(cc.CustomerCategoryName) ASC, -- El total general se va al final de todo el reporte
        cc.CustomerCategoryName ASC,
        GROUPING(c.CustomerName) ASC,          -- Los subtotales de cada categoría se van abajo de sus clientes
        c.CustomerName ASC;
END;
GO


-- ================================================================
-- REPORTE 3: Top 5 productos con mayor ganancia por año
-- Parámetros : @Anio
-- Requisitos : DENSE_RANK + PARTITION BY + filtro de año.
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerReporte3
    @Anio INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Anio IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM syn_Facturas WHERE YEAR(InvoiceDate) = @Anio)
        THROW 50201, 'El año indicado no existe en las facturas de la base de datos.', 1;


    WITH Ganancias AS
    (
        SELECT
            YEAR(i.InvoiceDate) AS Anio,
            si.StockItemName AS Producto,
            SUM(il.LineProfit) AS GananciaTotal,
            DENSE_RANK() OVER
            (
                PARTITION BY YEAR(i.InvoiceDate)
                ORDER BY SUM(il.LineProfit) DESC
            ) AS Ranking
        FROM syn_Facturas AS i
        INNER JOIN syn_LineasFactura AS il
            ON i.InvoiceID = il.InvoiceID
        INNER JOIN syn_Productos AS si
            ON il.StockItemID = si.StockItemID
        WHERE @Anio IS NULL OR YEAR(i.InvoiceDate) = @Anio
        GROUP BY
            YEAR(i.InvoiceDate),
            si.StockItemName
    )
    SELECT
        Anio,
        Ranking,
        Producto,
        CAST(GananciaTotal AS DECIMAL(18,2)) AS GananciaTotal
    FROM Ganancias
    WHERE Ranking <= 5
    ORDER BY Anio DESC, Ranking ASC, Producto ASC;
END;
GO


/*
================================================================================
REPORTE 4: Top 5 clientes por cantidad de facturas emitidas por año.
-- Parámetros : @AnioInicio, @AnioFin
-- Requisitos : DENSE_RANK + PARTITION BY + filtro de año.
Devuelve primero los años disponibles para los filtros y después el reporte
con el monto total facturado por cliente.
================================================================================
*/
CREATE OR ALTER PROCEDURE ObtenerReporte4
    @AnioInicio INT = NULL,
    @AnioFin INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @AnioInicio IS NOT NULL AND @AnioFin IS NOT NULL
        AND @AnioInicio > @AnioFin
    BEGIN
        ;THROW 50101, 'El año inicial no puede ser mayor que el año final.', 1;
    END;

    WITH AniosFacturacion AS (
        -- Se obtienen los años distintos de facturación que existen
        SELECT DISTINCT -- Para obtener los años distintos de facturación que existen
            DATEPART(YEAR, i.InvoiceDate) AS Anio
        FROM syn_Facturas AS i
    )
    SELECT Anio
    INTO #AniosFacturacion -- Se crea una tabla temporal para almacenar los años de facturación
    FROM AniosFacturacion;

    IF @AnioInicio IS NOT NULL
        AND NOT EXISTS (
            SELECT 1
            FROM #AniosFacturacion
            WHERE Anio = @AnioInicio
        )
    BEGIN
        ;THROW 50102, 'El año inicial no existe en los datos de facturación.', 1;
    END;

    IF @AnioFin IS NOT NULL
        AND NOT EXISTS (
            SELECT 1
            FROM #AniosFacturacion
            WHERE Anio = @AnioFin
        )
    BEGIN
        ;THROW 50103, 'El año final no existe en los datos de facturación.', 1;
    END;


    WITH TotalesFactura AS (
        SELECT
            il.InvoiceID,
            SUM(ISNULL(il.ExtendedPrice, 0) + ISNULL(il.TaxAmount, 0)) AS Monto
        FROM syn_LineasFactura AS il
        GROUP BY il.InvoiceID
    ),

    -- Se obtiene la cantidad de facturas y el monto total facturado por año y cliente
    VentasClienteAnio AS (
        SELECT
            DATEPART(YEAR, i.InvoiceDate) AS Anio,
            c.CustomerID,
            c.CustomerName AS Cliente,
            COUNT(*) AS CantidadFacturas,
            SUM(ISNULL(tf.Monto, 0)) AS MontoTotalFacturado
        FROM syn_Facturas AS i

        INNER JOIN syn_Clientes AS c
            ON i.CustomerID = c.CustomerID

        LEFT JOIN TotalesFactura AS tf
            ON i.InvoiceID = tf.InvoiceID

        WHERE
            (@AnioInicio IS NULL OR DATEPART(YEAR, i.InvoiceDate) >= @AnioInicio)
            AND (@AnioFin IS NULL OR DATEPART(YEAR, i.InvoiceDate) <= @AnioFin)
        GROUP BY
            DATEPART(YEAR, i.InvoiceDate),
            c.CustomerID,
            c.CustomerName
    ),

    -- Se hace un ranking de los clientes por cantidad de facturas emitidas por año
    ClientesRanking AS (
        SELECT
            Anio,
            CustomerID,
            Cliente,
            CantidadFacturas,
            MontoTotalFacturado,
            DENSE_RANK() OVER (
                PARTITION BY Anio
                ORDER BY CantidadFacturas DESC
            ) AS Posicion
        FROM VentasClienteAnio
    )
    SELECT
        Anio,
        Posicion,
        CustomerID,
        Cliente,
        CantidadFacturas,
        MontoTotalFacturado
    FROM ClientesRanking
    WHERE Posicion <= 5
    ORDER BY Anio DESC, Posicion ASC, Cliente ASC;

    DROP TABLE #AniosFacturacion;
END;
GO


/*
================================================================================
REPORTE 5: Top 5 proveedores por cantidad de órdenes de compra y año.
-- Parámetros : @AnioInicio, @AnioFin
-- Requisitos : DENSE_RANK + PARTITION BY + filtro de año.
Valida que los años del rango existan en los datos de órdenes de compra y
devuelve el monto total de las órdenes por proveedor.
================================================================================
*/
CREATE OR ALTER PROCEDURE ObtenerReporte5
    @AnioInicio INT = NULL,
    @AnioFin INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @AnioInicio IS NOT NULL AND @AnioFin IS NOT NULL
        AND @AnioInicio > @AnioFin
    BEGIN
        ;THROW 50101, 'El año inicial no puede ser mayor que el año final.', 1;
    END;

    WITH AniosOrdenCompra AS (
        SELECT DISTINCT
            DATEPART(YEAR, po.OrderDate) AS Anio
        FROM syn_OrdenesCompra AS po
    )
    SELECT Anio
    INTO #AniosOrdenCompra
    FROM AniosOrdenCompra;

    IF @AnioInicio IS NOT NULL
        AND NOT EXISTS (
            SELECT 1
            FROM #AniosOrdenCompra
            WHERE Anio = @AnioInicio
        )
    BEGIN
        ;THROW 50104, 'El año inicial no existe en los datos de órdenes de compra.', 1;
    END;

    IF @AnioFin IS NOT NULL
        AND NOT EXISTS (
            SELECT 1
            FROM #AniosOrdenCompra
            WHERE Anio = @AnioFin
        )
    BEGIN
        ;THROW 50105, 'El año final no existe en los datos de órdenes de compra.', 1;
    END;

    -- Se calcula el monto total de cada orden de compra sumando los precios por unidad por
    -- la cantidad de unidades ordenadas en cada línea de la orden
    WITH TotalesOrden AS (
        SELECT
            pol.PurchaseOrderID,
            SUM(pol.OrderedOuters * ISNULL(pol.ExpectedUnitPricePerOuter, 0)) AS Monto
        FROM syn_LineasOrdenCompra AS pol
        GROUP BY pol.PurchaseOrderID
    ),

    -- Se obtiene la cantidad de órdenes y el monto total por año y proveedor
    ComprasProveedorAnio AS (
        SELECT
            DATEPART(YEAR, po.OrderDate) AS Anio,
            s.SupplierID,
            s.SupplierName AS Proveedor,
            sc.SupplierCategoryName AS Categoria,
            COUNT(*) AS CantidadOrdenes,
            SUM(ISNULL(tord.Monto, 0)) AS MontoTotal
        FROM syn_OrdenesCompra AS po

        INNER JOIN syn_Proveedores AS s
            ON po.SupplierID = s.SupplierID

        INNER JOIN syn_CategoriasProveedor AS sc
            ON s.SupplierCategoryID = sc.SupplierCategoryID

        LEFT JOIN TotalesOrden AS tord
            ON po.PurchaseOrderID = tord.PurchaseOrderID

        WHERE
            (@AnioInicio IS NULL OR DATEPART(YEAR, po.OrderDate) >= @AnioInicio)
            AND (@AnioFin IS NULL OR DATEPART(YEAR, po.OrderDate) <= @AnioFin)
        GROUP BY
            DATEPART(YEAR, po.OrderDate),
            s.SupplierID,
            s.SupplierName,
            sc.SupplierCategoryName
    ),

    -- Se hace un ranking de los proveedores por cantidad de órdenes emitidas por año
    ProveedoresRanking AS (
        SELECT
            Anio,
            SupplierID,
            Proveedor,
            Categoria,
            CantidadOrdenes,
            MontoTotal,
            DENSE_RANK() OVER (
                PARTITION BY Anio
                ORDER BY CantidadOrdenes DESC
            ) AS Posicion
        FROM ComprasProveedorAnio
    )
    SELECT
        Anio,
        Posicion,
        SupplierID,
        Proveedor,
        Categoria,
        CantidadOrdenes,
        MontoTotal
    FROM ProveedoresRanking
    WHERE Posicion <= 5
    ORDER BY Anio DESC, Posicion ASC, Proveedor ASC;

    DROP TABLE #AniosOrdenCompra;
END;
GO


-- ================================================================
-- REPORTE 6: matriz resumen de ventas por categoría y año
-- Parámetros : ninguno
-- Requisitos : resumen tipo matriz por categorías y años vendidos.
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerReporte6
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Categoria,
        ISNULL([2013], 0) AS Ventas_2013,
        ISNULL([2014], 0) AS Ventas_2014,
        ISNULL([2015], 0) AS Ventas_2015,
        ISNULL([2016], 0) AS Ventas_2016
    FROM
    (
        SELECT
            sg.StockGroupName AS Categoria,
            YEAR(i.InvoiceDate) AS Anio,
            il.ExtendedPrice + il.TaxAmount AS Monto
        FROM syn_Facturas AS i
        INNER JOIN syn_LineasFactura AS il
            ON i.InvoiceID = il.InvoiceID
        INNER JOIN syn_ProductoGrupos AS pig
            ON il.StockItemID = pig.StockItemID
        INNER JOIN syn_GruposProducto AS sg
            ON pig.StockGroupID = sg.StockGroupID
        WHERE YEAR(i.InvoiceDate) BETWEEN 2013 AND 2016
    ) AS DatosBase
    PIVOT
    (
        SUM(Monto)
        FOR Anio IN ([2013], [2014], [2015], [2016])
    ) AS Matriz
    ORDER BY Categoria ASC;
END;
GO


/*
================================================================================
REPORTE 7: Seguimiento mensual de ventas por cliente.
-- Parámetros : @Anio, @Mes, @CategoriaProducto, @SubcategoriaProducto
-- Requisitos : filtros por año, mes, categoría y subcategoría de producto.
================================================================================
*/
CREATE OR ALTER PROCEDURE ObtenerReporte7
    @Anio INT = NULL,
    @Mes INT = NULL,
    @CategoriaProducto NVARCHAR(50) = NULL,
    @SubcategoriaProducto NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Obtiene los productos y sus categorías para poder filtrar por categoría de producto
    WITH ProductosPorCategoria AS (
        SELECT sisg.StockItemID, sg.StockGroupName
        FROM syn_ProductoGrupos AS sisg
        INNER JOIN syn_GruposProducto AS sg
            ON sisg.StockGroupID = sg.StockGroupID
    )
    SELECT
        c.CustomerID,
        c.CustomerName AS Cliente,
        DATEPART(YEAR, i.InvoiceDate) AS Anio,
        DATEPART(MONTH, i.InvoiceDate) AS Mes,
        MIN(i.InvoiceDate) AS PrimeraFacturaDelMes,
        MAX(i.InvoiceDate) AS UltimaFacturaDelMes,
        SUM(ISNULL(il.ExtendedPrice, 0) + ISNULL(il.TaxAmount, 0)) AS MontoTotalComprado,
        SUM(il.Quantity) AS CantidadTotal,
        MIN(il.Quantity) AS CantidadMinima,
        MAX(il.Quantity) AS CantidadMaxima
    FROM syn_Facturas AS i

    INNER JOIN syn_Clientes AS c
        ON i.CustomerID = c.CustomerID

    INNER JOIN syn_LineasFactura AS il
        ON i.InvoiceID = il.InvoiceID

    INNER JOIN syn_Productos AS si
        ON il.StockItemID = si.StockItemID

    WHERE
        -- Año y mes
        (@Anio IS NULL OR DATEPART(YEAR, i.InvoiceDate) = @Anio)
        AND (@Mes IS NULL OR DATEPART(MONTH, i.InvoiceDate) = @Mes)

        --Categoría de producto
        AND (
            @CategoriaProducto IS NULL
            OR si.StockItemID IN ( -- Se filtra por productos que pertenecen a la categoría especificada
                SELECT StockItemID
                FROM ProductosPorCategoria
                WHERE StockGroupName LIKE '%' + LTRIM(RTRIM(@CategoriaProducto)) + '%'
            )
        )

        -- Subcategoría de producto
        AND (
            @SubcategoriaProducto IS NULL
            OR si.StockItemName LIKE '%' + LTRIM(RTRIM(@SubcategoriaProducto)) + '%'
        )

    GROUP BY
        c.CustomerID,
        c.CustomerName,
        DATEPART(YEAR, i.InvoiceDate),
        DATEPART(MONTH, i.InvoiceDate)
    ORDER BY
        c.CustomerName ASC,
        Anio DESC,
        Mes DESC;
END;
GO


-- ================================================================
-- REPORTE 8: seguimiento mensual de compras a proveedores
-- Parámetros : @Anio, @Mes, @CategoriaProducto, @SubcategoriaProducto
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerReporte8
    @Anio INT = NULL,
    @Mes INT = NULL,
    @CategoriaProducto NVARCHAR(50) = NULL,
    @SubcategoriaProducto NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Anio IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM syn_OrdenesCompra WHERE YEAR(OrderDate) = @Anio)
        THROW 50210, 'El año indicado no existe en las órdenes de compra.', 1;

    IF @Mes IS NOT NULL AND (@Mes < 1 OR @Mes > 12)
        THROW 50211, 'El mes debe estar entre 1 y 12.', 1;


    SELECT
        s.SupplierName AS Proveedor,
        YEAR(po.OrderDate) AS Anio,
        MONTH(po.OrderDate) AS Mes,
        CAST(SUM(pol.OrderedOuters * pol.ExpectedUnitPricePerOuter) AS DECIMAL(18,2)) AS MontoTotal,
        MIN(po.OrderDate) AS PrimeraFacturaMes,
        MAX(po.OrderDate) AS UltimaFacturaMes,
        SUM(pol.OrderedOuters) AS CantidadTotal,
        MIN(pol.OrderedOuters) AS CantidadMinima,
        MAX(pol.OrderedOuters) AS CantidadMaxima
    FROM syn_OrdenesCompra AS po
    INNER JOIN syn_LineasOrdenCompra AS pol
        ON po.PurchaseOrderID = pol.PurchaseOrderID
    INNER JOIN syn_Proveedores AS s
        ON po.SupplierID = s.SupplierID
    INNER JOIN syn_Productos AS si
        ON pol.StockItemID = si.StockItemID
    INNER JOIN syn_ProductoGrupos AS pig
        ON si.StockItemID = pig.StockItemID
    INNER JOIN syn_GruposProducto AS sg
        ON pig.StockGroupID = sg.StockGroupID
    WHERE
        (@Anio IS NULL OR YEAR(po.OrderDate) = @Anio)
        AND (@Mes IS NULL OR MONTH(po.OrderDate) = @Mes)
        AND
        (
            NULLIF(LTRIM(RTRIM(@CategoriaProducto)), '') IS NULL
            OR sg.StockGroupName LIKE '%' + LTRIM(RTRIM(@CategoriaProducto)) + '%'
        )
        AND
        (
            NULLIF(LTRIM(RTRIM(@SubcategoriaProducto)), '') IS NULL
            OR si.StockItemName LIKE '%' + LTRIM(RTRIM(@SubcategoriaProducto)) + '%'
        )
    GROUP BY
        s.SupplierName,
        YEAR(po.OrderDate),
        MONTH(po.OrderDate)
    ORDER BY Anio DESC, Mes DESC, MontoTotal DESC, Proveedor ASC;
END;
GO


-- ================================================================
-- REPORTE 9: días estimados de rotación/cobertura por producto
-- Parámetros : @CategoriaProducto, @Anio, @Proveedor
-- Nota       : StockItemHoldings representa existencia actual, por lo
--              que el indicador usa inventario actual frente a unidades
--              vendidas del año seleccionado como métrica de rotación.
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerReporte9
    @CategoriaProducto NVARCHAR(50) = NULL,
    @Anio INT = NULL,
    @Proveedor NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @Anio IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM syn_Facturas WHERE YEAR(InvoiceDate) = @Anio)
        THROW 50212, 'El año indicado no existe en las facturas de la base de datos.', 1;


    WITH ProductosVendidos AS
    (
        SELECT
            si.StockItemID,
            si.StockItemName AS Producto,
            grupo.StockGroupName AS Categoria,
            s.SupplierName AS Proveedor,
            YEAR(i.InvoiceDate) AS Anio,
            SUM(il.Quantity) AS TotalVendido
        FROM syn_Facturas AS i
        INNER JOIN syn_LineasFactura AS il
            ON i.InvoiceID = il.InvoiceID
        INNER JOIN syn_Productos AS si
            ON il.StockItemID = si.StockItemID
        INNER JOIN syn_Proveedores AS s
            ON si.SupplierID = s.SupplierID
        OUTER APPLY
        (
            SELECT TOP (1)
                sg.StockGroupName
            FROM syn_ProductoGrupos AS pig
            INNER JOIN syn_GruposProducto AS sg
                ON pig.StockGroupID = sg.StockGroupID
            WHERE pig.StockItemID = si.StockItemID
            ORDER BY sg.StockGroupName ASC
        ) AS grupo
        WHERE
            (@Anio IS NULL OR YEAR(i.InvoiceDate) = @Anio)
            AND
            (
                NULLIF(LTRIM(RTRIM(@Proveedor)), '') IS NULL
                OR s.SupplierName LIKE '%' + LTRIM(RTRIM(@Proveedor)) + '%'
            )
            AND
            (
                NULLIF(LTRIM(RTRIM(@CategoriaProducto)), '') IS NULL
                OR grupo.StockGroupName LIKE '%' + LTRIM(RTRIM(@CategoriaProducto)) + '%'
            )
        GROUP BY
            si.StockItemID,
            si.StockItemName,
            grupo.StockGroupName,
            s.SupplierName,
            YEAR(i.InvoiceDate)
    )
    SELECT
        pv.Producto,
        pv.Categoria,
        pv.Proveedor,
        pv.Anio,
        ISNULL(holdings.QuantityOnHand, 0) AS InventarioActual,
        pv.TotalVendido,
        CASE
            WHEN pv.TotalVendido > 0
                THEN CAST((ISNULL(holdings.QuantityOnHand, 0) * 365.0) / pv.TotalVendido AS DECIMAL(10,2))
            ELSE 0
        END AS PromedioDiasRotacion
    FROM ProductosVendidos AS pv
    LEFT JOIN syn_Inventario AS holdings
        ON pv.StockItemID = holdings.StockItemID
    ORDER BY PromedioDiasRotacion DESC, pv.Producto ASC;
END;
GO


/*
================================================================================
REPORTE 10: Métodos de entrega más utilizados por destino.
-- Parámetros : @Anio, @Mes, @CategoriaClienteID, @CategoriaProductoID, @ProductoID
-- Requisitos : DENSE_RANK + PARTITION BY + filtros por año, mes, categoría de cliente, categoría de producto y producto.
================================================================================
*/
CREATE OR ALTER PROCEDURE ObtenerReporte10
    @Anio INT = NULL,
    @Mes INT = NULL,
    @CategoriaClienteID INT = NULL,
    @CategoriaProductoID INT = NULL,
    @ProductoID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Se obtiene la cantidad de facturas por destino y método de entrega
    WITH VentasPorDestinoYMetodo AS
    (
        SELECT
            cty.CityName AS LugarDestino,
            dm.DeliveryMethodName AS MetodoEnvio,
            COUNT(DISTINCT i.InvoiceID) AS CantidadVentas
            -- Se hace DISTINCT para contar cada factura una sola vez, aunque tenga varias líneas de productos,
            -- debido a que se hace un JOIN con Sales.InvoiceLines

        FROM syn_Facturas AS i

        INNER JOIN syn_Clientes AS c
            ON i.CustomerID = c.CustomerID

        INNER JOIN syn_Ciudades AS cty
            ON c.DeliveryCityID = cty.CityID

        INNER JOIN syn_MetodosEntrega AS dm
            ON i.DeliveryMethodID = dm.DeliveryMethodID

        INNER JOIN syn_LineasFactura AS il
            ON i.InvoiceID = il.InvoiceID

        INNER JOIN syn_Productos AS si
            ON il.StockItemID = si.StockItemID

        WHERE
            -- Año y mes
            (@Anio IS NULL OR YEAR(i.InvoiceDate) = @Anio)
            AND (@Mes IS NULL OR MONTH(i.InvoiceDate) = @Mes)

            -- Categoría del cliente
            AND (
                @CategoriaClienteID IS NULL
                OR c.CustomerCategoryID = @CategoriaClienteID
            )

            -- Categoría del producto
            AND (
                @CategoriaProductoID IS NULL OR
                EXISTS (
                    SELECT 1
                    FROM syn_ProductoGrupos AS sisg
                    WHERE sisg.StockItemID = si.StockItemID
                      AND sisg.StockGroupID = @CategoriaProductoID
                )
            )

            -- Producto
            AND (@ProductoID IS NULL OR si.StockItemID = @ProductoID)

        GROUP BY
            cty.CityName,
            dm.DeliveryMethodName
    ),

    MetodosEntregaRanking AS
    (
        SELECT
            LugarDestino,
            MetodoEnvio,
            CantidadVentas,
            DENSE_RANK() OVER (
                PARTITION BY LugarDestino
                ORDER BY CantidadVentas DESC
            ) AS Posicion
        FROM VentasPorDestinoYMetodo
    )

    SELECT
        LugarDestino,
        MetodoEnvio,
        CantidadVentas
    FROM MetodosEntregaRanking
    WHERE Posicion = 1
    ORDER BY CantidadVentas DESC;

END;
GO

-- ================================================================
-- AÑOS VÁLIDOS DISPONIBLES
-- Parámetros : ninguno
-- Retorno    : años presentes en facturas u órdenes de compra.
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerOpcionesFiltrosReportes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT YEAR(InvoiceDate) AS Anio
    FROM syn_Facturas
    WHERE InvoiceDate IS NOT NULL
    ORDER BY Anio DESC;

    SELECT DISTINCT YEAR(OrderDate) AS Anio
    FROM syn_OrdenesCompra
    WHERE OrderDate IS NOT NULL
    ORDER BY Anio DESC;

    SELECT
        CustomerCategoryID,
        CustomerCategoryName
    FROM syn_CategoriasCliente
    ORDER BY CustomerCategoryName ASC;

    SELECT
        StockGroupID AS CategoriaProductoID,
        StockGroupName AS NombreCategoriaProducto
    FROM syn_GruposProducto
    ORDER BY StockGroupName ASC;

    SELECT
        StockItemID AS ProductoID,
        StockItemName AS NombreProducto
    FROM syn_Productos
    ORDER BY StockItemName ASC;
END;
GO

CREATE OR ALTER PROCEDURE ObtenerAniosReportes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT Anio
    FROM
    (
        SELECT YEAR(InvoiceDate) AS Anio
        FROM syn_Facturas
        UNION
        SELECT YEAR(OrderDate) AS Anio
        FROM syn_OrdenesCompra
    ) AS Anios
    WHERE Anio IS NOT NULL
    ORDER BY Anio DESC;
END;
GO
