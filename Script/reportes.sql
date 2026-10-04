USE WideWorldImporters;
GO


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

-- ================================================================
-- AÑOS VÁLIDOS DISPONIBLES
-- Parámetros : ninguno
-- Retorno    : años presentes en facturas u órdenes de compra.
-- ================================================================
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
