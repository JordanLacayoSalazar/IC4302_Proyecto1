USE WideWorldImporters;
GO


-- ================================================================
-- OBTENER PRODUCTOS
-- Parámetros : @NombreBusqueda, @GrupoID
-- Retorno    : listado ordenado de productos y existencia actual
-- Descripción: Aplica los filtros acumulativamente
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerProductos
    @NombreBusqueda NVARCHAR(100) = NULL,
    @GrupoID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        si.StockItemID AS ProductoID,
        si.StockItemName AS NombreProducto,
        grupo.StockGroupID AS GrupoID,
        grupo.StockGroupName AS Grupo,
        ISNULL(holdings.QuantityOnHand, 0) AS CantidadInventario
    FROM syn_Productos AS si
    OUTER APPLY (
        SELECT TOP (1)
            sg.StockGroupID,
            sg.StockGroupName
        FROM syn_ProductoGrupos AS pig
        INNER JOIN syn_GruposProducto AS sg
            ON sg.StockGroupID = pig.StockGroupID
        WHERE pig.StockItemID = si.StockItemID
        ORDER BY sg.StockGroupName ASC
    ) AS grupo
    LEFT JOIN syn_Inventario AS holdings
        ON holdings.StockItemID = si.StockItemID
    WHERE
        (
            NULLIF(LTRIM(RTRIM(@NombreBusqueda)), '') IS NULL
            OR si.StockItemName LIKE '%' + LTRIM(RTRIM(@NombreBusqueda)) + '%'
        )
        AND (@GrupoID IS NULL OR grupo.StockGroupID = @GrupoID)
    ORDER BY si.StockItemName ASC;
END;
GO

-- ================================================================
-- OBTENER DETALLE DEL PRODUCTO
-- Parámetros : @ProductoID
-- Retorno    : todos los datos solicitados por el enunciado
-- Descripción: Mustra los detalles de un prodcuto
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerDetalleProducto
    @ProductoID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        si.StockItemID AS ProductoID,
        si.StockItemName AS NombreProducto,
        proveedor.SupplierName AS Proveedor,
        grupo.StockGroupName AS NombreGrupo,
        color.ColorName AS Color,
        unitPackage.PackageTypeName AS UnidadEmpaque,
        outerPackage.PackageTypeName AS EmpaqueExterior,
        si.QuantityPerOuter AS CantidadEmpaque,
        si.Brand AS Marca,
        si.Size AS Talla,
        si.TaxRate AS Impuesto,
        si.UnitPrice AS PrecioUnitario,
        si.RecommendedRetailPrice AS PrecioVenta,
        si.TypicalWeightPerUnit AS Peso,
        si.SearchDetails AS PalabrasClaves,
        ISNULL(holdings.QuantityOnHand, 0) AS CantidadDisponible,
        holdings.BinLocation AS Ubicacion
    FROM syn_Productos AS si
    LEFT JOIN syn_Proveedores AS proveedor
        ON proveedor.SupplierID = si.SupplierID
    LEFT JOIN syn_Colores AS color
        ON color.ColorID = si.ColorID
    LEFT JOIN syn_TiposEmpaque AS unitPackage
        ON unitPackage.PackageTypeID = si.UnitPackageID
    LEFT JOIN syn_TiposEmpaque AS outerPackage
        ON outerPackage.PackageTypeID = si.OuterPackageID
    LEFT JOIN syn_Inventario AS holdings
        ON holdings.StockItemID = si.StockItemID
    OUTER APPLY (
        SELECT TOP (1)
            sg.StockGroupName
        FROM syn_ProductoGrupos AS pig
        INNER JOIN syn_GruposProducto AS sg
            ON sg.StockGroupID = pig.StockGroupID
        WHERE pig.StockItemID = si.StockItemID
        ORDER BY sg.StockGroupName ASC
    ) AS grupo
    WHERE si.StockItemID = @ProductoID;
END;
GO

-- ================================================================
-- OBTENER GRUPOS DE PRODUCTO
-- Parámetros : ninguno
-- Retorno    : catálogo de grupos para filtros y formularios
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerGruposProducto
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        StockGroupID AS GrupoID,
        StockGroupName AS NombreGrupo
    FROM syn_GruposProducto
    ORDER BY StockGroupName ASC;
END;
GO

-- ================================================================
-- OBTENER SUGERENCIAS DE PRODUCTOS
-- Parámetros : @Busqueda
-- Retorno    : hasta 20 coincidencias para autocompletado
-- Descripción: El filtrado se realiza en SQL para evitar traer todo
--              el catálogo al navegador.
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerSugerenciasProductos
    @Busqueda NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (20)
        StockItemID AS ProductoID,
        StockItemName AS NombreProducto
    FROM syn_Productos
    WHERE
        NULLIF(LTRIM(RTRIM(@Busqueda)), '') IS NULL
        OR StockItemName LIKE '%' + LTRIM(RTRIM(@Busqueda)) + '%'
    ORDER BY StockItemName ASC;
END;
GO

-- ================================================================
-- OBTENER SUBCATEGORÍAS UTILIZABLES POR REPORTES
-- Parámetros : @Busqueda
-- Retorno    : nombre del producto
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerSubcategoriasProductos
    @Busqueda NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (50)
        StockItemID AS ProductoID,
        StockItemName AS Subcategoria
    FROM syn_Productos
    WHERE
        NULLIF(LTRIM(RTRIM(@Busqueda)), '') IS NULL
        OR StockItemName LIKE '%' + LTRIM(RTRIM(@Busqueda)) + '%'
    ORDER BY StockItemName ASC;
END;
GO

-- ================================================================
-- CREAR PRODUCTO
-- Parámetros : datos principales y comerciales del producto
-- Retorno    : StockItemID del producto creado
-- Descripción: Crea un prodcuto 
-- ================================================================
CREATE OR ALTER PROCEDURE CrearProducto
    @NombreProducto NVARCHAR(100),
    @NombreGrupo NVARCHAR(50),
    @NombreProveedor NVARCHAR(100),
    @Color NVARCHAR(20) = NULL,
    @UnidadEmpaque NVARCHAR(50),
    @EmpaqueExterior NVARCHAR(50),
    @CantidadEmpaque INT,
    @Marca NVARCHAR(50) = NULL,
    @Talla NVARCHAR(20) = NULL,
    @Impuesto DECIMAL(18,3),
    @PrecioUnitario DECIMAL(18,2),
    @PrecioVenta DECIMAL(18,2),
    @Peso DECIMAL(18,3),
    @PalabrasClaves NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @GrupoID INT,
        @ProveedorID INT,
        @ColorID INT,
        @UnitPkgID INT,
        @OuterPkgID INT,
        @NuevoProductoID INT;

    IF NULLIF(LTRIM(RTRIM(@NombreProducto)), '') IS NULL
        THROW 50001, 'El nombre del producto es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@NombreGrupo)), '') IS NULL
        THROW 50002, 'El grupo del producto es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@NombreProveedor)), '') IS NULL
        THROW 50003, 'El proveedor es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@UnidadEmpaque)), '') IS NULL
        THROW 50004, 'La unidad de empaque es obligatoria.', 1;

    IF NULLIF(LTRIM(RTRIM(@EmpaqueExterior)), '') IS NULL
        THROW 50005, 'El empaque exterior es obligatorio.', 1;

    IF @CantidadEmpaque < 1
        THROW 50006, 'La cantidad por empaque debe ser mayor que cero.', 1;

    IF @Impuesto < 0
        THROW 50007, 'El impuesto no puede ser negativo.', 1;

    IF @PrecioUnitario < 0 OR @PrecioVenta < 0 OR @Peso < 0
        THROW 50008, 'Los precios y el peso no pueden ser negativos.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT TOP (1)
            @GrupoID = StockGroupID
        FROM syn_GruposProducto
        WHERE LTRIM(RTRIM(StockGroupName)) = LTRIM(RTRIM(@NombreGrupo));

        IF @GrupoID IS NULL
        BEGIN
            INSERT INTO syn_GruposProducto
                (StockGroupName, LastEditedBy)
            VALUES
                (LTRIM(RTRIM(@NombreGrupo)), 1);

            SET @GrupoID = SCOPE_IDENTITY();
        END;

        SELECT TOP (1)
            @ProveedorID = SupplierID
        FROM syn_Proveedores
        WHERE LTRIM(RTRIM(SupplierName)) = LTRIM(RTRIM(@NombreProveedor));

        IF @ProveedorID IS NULL
            THROW 50009, 'El proveedor indicado no existe. Seleccione un proveedor válido.', 1;

        IF NULLIF(LTRIM(RTRIM(@Color)), '') IS NOT NULL
        BEGIN
            SELECT TOP (1)
                @ColorID = ColorID
            FROM syn_Colores
            WHERE LTRIM(RTRIM(ColorName)) = LTRIM(RTRIM(@Color));

            IF @ColorID IS NULL
            BEGIN
                INSERT INTO syn_Colores
                    (ColorName, LastEditedBy)
                VALUES
                    (LTRIM(RTRIM(@Color)), 1);

                SET @ColorID = SCOPE_IDENTITY();
            END;
        END;

        SELECT TOP (1)
            @UnitPkgID = PackageTypeID
        FROM syn_TiposEmpaque
        WHERE LTRIM(RTRIM(PackageTypeName)) = LTRIM(RTRIM(@UnidadEmpaque));

        IF @UnitPkgID IS NULL
        BEGIN
            INSERT INTO syn_TiposEmpaque
                (PackageTypeName, LastEditedBy)
            VALUES
                (LTRIM(RTRIM(@UnidadEmpaque)), 1);

            SET @UnitPkgID = SCOPE_IDENTITY();
        END;

        SELECT TOP (1)
            @OuterPkgID = PackageTypeID
        FROM syn_TiposEmpaque
        WHERE LTRIM(RTRIM(PackageTypeName)) = LTRIM(RTRIM(@EmpaqueExterior));

        IF @OuterPkgID IS NULL
        BEGIN
            INSERT INTO syn_TiposEmpaque
                (PackageTypeName, LastEditedBy)
            VALUES
                (LTRIM(RTRIM(@EmpaqueExterior)), 1);

            SET @OuterPkgID = SCOPE_IDENTITY();
        END;

        INSERT INTO syn_Productos
        (
            StockItemName,
            SupplierID,
            ColorID,
            UnitPackageID,
            OuterPackageID,
            Brand,
            Size,
            LeadTimeDays,
            QuantityPerOuter,
            IsChillerStock,
            TaxRate,
            UnitPrice,
            RecommendedRetailPrice,
            TypicalWeightPerUnit,
            MarketingComments,
            LastEditedBy
        )
        VALUES
        (
            LTRIM(RTRIM(@NombreProducto)),
            @ProveedorID,
            @ColorID,
            @UnitPkgID,
            @OuterPkgID,
            NULLIF(LTRIM(RTRIM(@Marca)), ''),
            NULLIF(LTRIM(RTRIM(@Talla)), ''),
            14,
            @CantidadEmpaque,
            0,
            @Impuesto,
            @PrecioUnitario,
            @PrecioVenta,
            @Peso,
            NULLIF(LTRIM(RTRIM(@PalabrasClaves)), ''),
            1
        );

        SET @NuevoProductoID = SCOPE_IDENTITY();

        INSERT INTO syn_ProductoGrupos
            (StockItemID, StockGroupID, LastEditedBy)
        VALUES
            (@NuevoProductoID, @GrupoID, 1);

        INSERT INTO syn_Inventario
        (
            StockItemID,
            QuantityOnHand,
            BinLocation,
            LastStocktakeQuantity,
            LastCostPrice,
            ReorderLevel,
            TargetStockLevel,
            LastEditedBy
        )
        VALUES
        (
            @NuevoProductoID,
            0,
            'N/A',
            0,
            @PrecioUnitario,
            10,
            50,
            1
        );

        COMMIT TRANSACTION;

        SELECT @NuevoProductoID AS ProductoID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO

-- ================================================================
-- ACTUALIZAR PRODUCTO
-- Parámetros : @ProductoID + datos editables
-- Retorno    : mensaje implícito de éxito
-- Descripción: Actualiza producto
-- ================================================================
CREATE OR ALTER PROCEDURE ActualizarProducto
    @ProductoID INT,
    @NombreProducto NVARCHAR(100),
    @NombreGrupo NVARCHAR(50),
    @NombreProveedor NVARCHAR(100),
    @Color NVARCHAR(20) = NULL,
    @UnidadEmpaque NVARCHAR(50),
    @EmpaqueExterior NVARCHAR(50),
    @CantidadEmpaque INT,
    @Marca NVARCHAR(50) = NULL,
    @Talla NVARCHAR(20) = NULL,
    @Impuesto DECIMAL(18,3),
    @PrecioUnitario DECIMAL(18,2),
    @PrecioVenta DECIMAL(18,2),
    @Peso DECIMAL(18,3),
    @PalabrasClaves NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @GrupoID INT,
        @ProveedorID INT,
        @ColorID INT,
        @UnitPkgID INT,
        @OuterPkgID INT;

    IF NOT EXISTS (
        SELECT 1
        FROM syn_Productos
        WHERE StockItemID = @ProductoID
    )
        THROW 50010, 'El producto indicado no existe.', 1;

    IF NULLIF(LTRIM(RTRIM(@NombreProducto)), '') IS NULL
        THROW 50011, 'El nombre del producto es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@NombreGrupo)), '') IS NULL
        THROW 50012, 'El grupo del producto es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@NombreProveedor)), '') IS NULL
        THROW 50013, 'El proveedor es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@UnidadEmpaque)), '') IS NULL
        THROW 50014, 'La unidad de empaque es obligatoria.', 1;

    IF NULLIF(LTRIM(RTRIM(@EmpaqueExterior)), '') IS NULL
        THROW 50015, 'El empaque exterior es obligatorio.', 1;

    IF @CantidadEmpaque < 1
        THROW 50016, 'La cantidad por empaque debe ser mayor que cero.', 1;

    IF @Impuesto < 0 OR @PrecioUnitario < 0 OR @PrecioVenta < 0 OR @Peso < 0
        THROW 50017, 'Los valores numéricos no pueden ser negativos.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT TOP (1)
            @GrupoID = StockGroupID
        FROM syn_GruposProducto
        WHERE LTRIM(RTRIM(StockGroupName)) = LTRIM(RTRIM(@NombreGrupo));

        IF @GrupoID IS NULL
        BEGIN
            INSERT INTO syn_GruposProducto
                (StockGroupName, LastEditedBy)
            VALUES
                (LTRIM(RTRIM(@NombreGrupo)), 1);

            SET @GrupoID = SCOPE_IDENTITY();
        END;

        SELECT TOP (1)
            @ProveedorID = SupplierID
        FROM syn_Proveedores
        WHERE LTRIM(RTRIM(SupplierName)) = LTRIM(RTRIM(@NombreProveedor));

        IF @ProveedorID IS NULL
            THROW 50018, 'El proveedor indicado no existe. Seleccione un proveedor válido.', 1;

        IF NULLIF(LTRIM(RTRIM(@Color)), '') IS NOT NULL
        BEGIN
            SELECT TOP (1)
                @ColorID = ColorID
            FROM syn_Colores
            WHERE LTRIM(RTRIM(ColorName)) = LTRIM(RTRIM(@Color));

            IF @ColorID IS NULL
            BEGIN
                INSERT INTO syn_Colores
                    (ColorName, LastEditedBy)
                VALUES
                    (LTRIM(RTRIM(@Color)), 1);

                SET @ColorID = SCOPE_IDENTITY();
            END;
        END;

        SELECT TOP (1)
            @UnitPkgID = PackageTypeID
        FROM syn_TiposEmpaque
        WHERE LTRIM(RTRIM(PackageTypeName)) = LTRIM(RTRIM(@UnidadEmpaque));

        IF @UnitPkgID IS NULL
        BEGIN
            INSERT INTO syn_TiposEmpaque
                (PackageTypeName, LastEditedBy)
            VALUES
                (LTRIM(RTRIM(@UnidadEmpaque)), 1);

            SET @UnitPkgID = SCOPE_IDENTITY();
        END;

        SELECT TOP (1)
            @OuterPkgID = PackageTypeID
        FROM syn_TiposEmpaque
        WHERE LTRIM(RTRIM(PackageTypeName)) = LTRIM(RTRIM(@EmpaqueExterior));

        IF @OuterPkgID IS NULL
        BEGIN
            INSERT INTO syn_TiposEmpaque
                (PackageTypeName, LastEditedBy)
            VALUES
                (LTRIM(RTRIM(@EmpaqueExterior)), 1);

            SET @OuterPkgID = SCOPE_IDENTITY();
        END;

        UPDATE syn_Productos
        SET
            StockItemName = LTRIM(RTRIM(@NombreProducto)),
            SupplierID = @ProveedorID,
            ColorID = @ColorID,
            UnitPackageID = @UnitPkgID,
            OuterPackageID = @OuterPkgID,
            Brand = NULLIF(LTRIM(RTRIM(@Marca)), ''),
            Size = NULLIF(LTRIM(RTRIM(@Talla)), ''),
            QuantityPerOuter = @CantidadEmpaque,
            TaxRate = @Impuesto,
            UnitPrice = @PrecioUnitario,
            RecommendedRetailPrice = @PrecioVenta,
            TypicalWeightPerUnit = @Peso,
            MarketingComments = NULLIF(LTRIM(RTRIM(@PalabrasClaves)), ''),
            LastEditedBy = 1
        WHERE StockItemID = @ProductoID;

        DELETE FROM syn_ProductoGrupos
        WHERE StockItemID = @ProductoID;

        INSERT INTO syn_ProductoGrupos
            (StockItemID, StockGroupID, LastEditedBy)
        VALUES
            (@ProductoID, @GrupoID, 1);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO

-- ================================================================
-- ELIMINAR PRODUCTO
-- Parámetros : @ProductoID
-- Retorno    : ninguno
-- Descripción: Elimina un producto de la base de datos
-- ================================================================
CREATE OR ALTER PROCEDURE EliminarProducto
    @ProductoID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM syn_Productos
        WHERE StockItemID = @ProductoID
    )
        THROW 50019, 'El producto indicado no existe.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM syn_Inventario
        WHERE StockItemID = @ProductoID;

        DELETE FROM syn_ProductoGrupos
        WHERE StockItemID = @ProductoID;

        DELETE FROM syn_Productos
        WHERE StockItemID = @ProductoID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO
