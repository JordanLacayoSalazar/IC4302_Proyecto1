USE WideWorldImporters;
GO


-- ================================================================
-- OBTENER PROVEEDORES
-- Parámetros : @NombreBusqueda, @CategoriaID, @MetodoEntregaID
-- Retorno    : proveedor, categoría y método de entrega
-- Descripción: Filtros acumulativos y orden alfabético por proveedor.
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerProveedores
    @NombreBusqueda NVARCHAR(100) = NULL,
    @CategoriaID INT = NULL,
    @MetodoEntregaID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.SupplierID,
        p.SupplierName AS NombreProveedor,
        c.SupplierCategoryName AS Categoria,
        m.DeliveryMethodName AS MetodoEntrega
    FROM syn_Proveedores AS p
    LEFT JOIN syn_CategoriasProveedor AS c
        ON p.SupplierCategoryID = c.SupplierCategoryID
    LEFT JOIN syn_MetodosEntrega AS m
        ON p.DeliveryMethodID = m.DeliveryMethodID
    WHERE
        (
            NULLIF(LTRIM(RTRIM(@NombreBusqueda)), '') IS NULL
            OR p.SupplierName LIKE '%' + LTRIM(RTRIM(@NombreBusqueda)) + '%'
        )
        AND (@CategoriaID IS NULL OR p.SupplierCategoryID = @CategoriaID)
        AND (@MetodoEntregaID IS NULL OR p.DeliveryMethodID = @MetodoEntregaID)
    ORDER BY p.SupplierName ASC;
END;
GO

-- ================================================================
-- OBTENER SUGERENCIAS DE PROVEEDORES
-- Parámetros : @Busqueda
-- Retorno    : hasta 20 nombres coincidentes
-- Descripción: Endpoint de autocompletado.
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerSugerenciasProveedores
    @Busqueda NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (20)
        SupplierID,
        SupplierName AS NombreProveedor
    FROM syn_Proveedores
    WHERE
        NULLIF(LTRIM(RTRIM(@Busqueda)), '') IS NULL
        OR SupplierName LIKE '%' + LTRIM(RTRIM(@Busqueda)) + '%'
    ORDER BY SupplierName ASC;
END;
GO

-- ================================================================
-- OBTENER DETALLE DEL PROVEEDOR
-- Parámetros : @SupplierID
-- Retorno    : detalle requerido por el enunciado.
-- Descripción: Obtiene los detaller del proveedor
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerDetalleProveedor
    @SupplierID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.SupplierID,
        p.SupplierReference AS CodigoProveedor,
        p.SupplierName AS NombreProveedor,
        p.SupplierCategoryID,
        c.SupplierCategoryName AS Categoria,
        p.PrimaryContactPersonID,
        Contact1.FullName AS ContactoPrimario,
        p.AlternateContactPersonID,
        Contact2.FullName AS ContactoAlternativo,
        p.DeliveryMethodID,
        m.DeliveryMethodName AS MetodoEntrega,
        p.DeliveryCityID,
        ci.CityName AS CiudadEntrega,
        p.DeliveryPostalCode AS CodigoPostal,
        p.PhoneNumber AS Telefono,
        p.FaxNumber AS Fax,
        p.WebsiteURL AS SitioWeb,
        CONCAT_WS(' | ', p.DeliveryAddressLine1, p.DeliveryAddressLine2) AS Direccion,
        CONCAT_WS(' | ', p.PostalAddressLine1, p.PostalAddressLine2) AS DireccionPostal,
        p.DeliveryAddressLine1,
        p.DeliveryAddressLine2,
        p.PostalAddressLine1,
        p.PostalAddressLine2,
        p.PostalPostalCode AS CodigoPostalPostal,
        p.DeliveryLocation.Lat AS Latitud,
        p.DeliveryLocation.Long AS Longitud,
        p.BankAccountName AS NombreBanco,
        p.BankAccountNumber AS CuentaCorriente,
        p.PaymentDays AS DiasGracia
    FROM syn_Proveedores AS p
    LEFT JOIN syn_CategoriasProveedor AS c
        ON p.SupplierCategoryID = c.SupplierCategoryID
    LEFT JOIN syn_MetodosEntrega AS m
        ON p.DeliveryMethodID = m.DeliveryMethodID
    LEFT JOIN syn_Ciudades AS ci
        ON p.DeliveryCityID = ci.CityID
    LEFT JOIN syn_Personas AS Contact1
        ON p.PrimaryContactPersonID = Contact1.PersonID
    LEFT JOIN syn_Personas AS Contact2
        ON p.AlternateContactPersonID = Contact2.PersonID
    WHERE p.SupplierID = @SupplierID;
END;
GO

-- ================================================================
-- OBTENER CATEGORÍAS DE PROVEEDOR
-- Parámetros : ninguno
-- Retorno    : catálogo de categorías
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerCategoriasProveedor
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        SupplierCategoryID,
        SupplierCategoryName
    FROM syn_CategoriasProveedor
    ORDER BY SupplierCategoryName ASC;
END;
GO

-- ================================================================
-- OBTENER OPCIONES DEL FORMULARIO DE PROVEEDOR
-- Parámetros : ninguno
-- Retorno    : Obtiene las opciones para el formualario
-- ================================================================
CREATE OR ALTER PROCEDURE ObtenerOpcionesFormularioProveedor
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        SupplierCategoryID,
        SupplierCategoryName
    FROM syn_CategoriasProveedor
    ORDER BY SupplierCategoryName ASC;

    SELECT DISTINCT
        p.PersonID,
        p.FullName
    FROM syn_Personas AS p
    INNER JOIN
    (
        SELECT PrimaryContactPersonID AS PersonID
        FROM syn_Proveedores
        UNION
        SELECT AlternateContactPersonID
        FROM syn_Proveedores
    ) AS contactos
        ON contactos.PersonID = p.PersonID
    ORDER BY p.FullName ASC;

    SELECT
        DeliveryMethodID,
        DeliveryMethodName
    FROM syn_MetodosEntrega
    ORDER BY DeliveryMethodName ASC;

    SELECT DISTINCT
        c.CityID,
        c.CityName
    FROM syn_Ciudades AS c
    INNER JOIN
    (
        SELECT DeliveryCityID AS CityID
        FROM syn_Proveedores
        UNION
        SELECT PostalCityID
        FROM syn_Proveedores
    ) AS ciudades
        ON ciudades.CityID = c.CityID
    ORDER BY c.CityName ASC;
END;
GO

-- ================================================================
-- CREAR PROVEEDOR
-- Parámetros : datos generales, contactos, logística, dirección y
--              datos bancarios.
-- Retorno    : SupplierID creado.
-- Descripción: Crea un provedor
-- ================================================================
CREATE OR ALTER PROCEDURE CrearProveedor
    @SupplierName NVARCHAR(100),
    @SupplierCategoryName NVARCHAR(50),
    @PrimaryContactPersonName NVARCHAR(100),
    @AlternateContactPersonName NVARCHAR(100) = NULL,
    @DeliveryMethodName NVARCHAR(100),
    @CityName NVARCHAR(100),
    @SupplierReference NVARCHAR(20),
    @DeliveryAddressLine1 NVARCHAR(60) = NULL,
    @DeliveryAddressLine2 NVARCHAR(60) = NULL,
    @DeliveryPostalCode NVARCHAR(10) = NULL,
    @PostalAddressLine1 NVARCHAR(60) = NULL,
    @PostalAddressLine2 NVARCHAR(60) = NULL,
    @PostalPostalCode NVARCHAR(10) = NULL,
    @Latitud FLOAT = NULL,
    @Longitud FLOAT = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @FaxNumber NVARCHAR(20) = NULL,
    @WebsiteURL NVARCHAR(256) = NULL,
    @BankAccountName NVARCHAR(50) = NULL,
    @BankAccountNumber NVARCHAR(20) = NULL,
    @PaymentDays INT = 30
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @CategoryID INT,
        @DeliveryMethodID INT,
        @CityID INT,
        @PrimaryContactPersonID INT,
        @AlternateContactPersonID INT,
        @Location GEOGRAPHY,
        @NuevoSupplierID INT;

    IF NULLIF(LTRIM(RTRIM(@SupplierName)), '') IS NULL
        THROW 50101, 'El nombre del proveedor es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@SupplierReference)), '') IS NULL
        THROW 50102, 'La referencia del proveedor es obligatoria.', 1;

    IF NULLIF(LTRIM(RTRIM(@SupplierCategoryName)), '') IS NULL
        THROW 50103, 'La categoría del proveedor es obligatoria.', 1;

    IF NULLIF(LTRIM(RTRIM(@PrimaryContactPersonName)), '') IS NULL
        THROW 50104, 'El contacto primario es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@DeliveryMethodName)), '') IS NULL
        THROW 50105, 'El método de entrega es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@CityName)), '') IS NULL
        THROW 50106, 'La ciudad de entrega es obligatoria.', 1;

    IF @PaymentDays < 0
        THROW 50107, 'Los días de gracia no pueden ser negativos.', 1;

    IF @Latitud IS NOT NULL AND (@Latitud < -90 OR @Latitud > 90)
        THROW 50108, 'La latitud debe estar entre -90 y 90.', 1;

    IF @Longitud IS NOT NULL AND (@Longitud < -180 OR @Longitud > 180)
        THROW 50109, 'La longitud debe estar entre -180 y 180.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT TOP (1)
            @CategoryID = SupplierCategoryID
        FROM syn_CategoriasProveedor
        WHERE LTRIM(RTRIM(SupplierCategoryName)) = LTRIM(RTRIM(@SupplierCategoryName));

        IF @CategoryID IS NULL
        BEGIN
            INSERT INTO syn_CategoriasProveedor
                (SupplierCategoryName, LastEditedBy)
            VALUES
                (LTRIM(RTRIM(@SupplierCategoryName)), 1);

            SET @CategoryID = SCOPE_IDENTITY();
        END;

        SELECT TOP (1)
            @DeliveryMethodID = DeliveryMethodID
        FROM syn_MetodosEntrega
        WHERE LTRIM(RTRIM(DeliveryMethodName)) = LTRIM(RTRIM(@DeliveryMethodName));

        IF @DeliveryMethodID IS NULL
        BEGIN
            INSERT INTO syn_MetodosEntrega
                (DeliveryMethodName, LastEditedBy)
            VALUES
                (LTRIM(RTRIM(@DeliveryMethodName)), 1);

            SET @DeliveryMethodID = SCOPE_IDENTITY();
        END;

        SELECT TOP (1)
            @CityID = CityID
        FROM syn_Ciudades
        WHERE LTRIM(RTRIM(CityName)) = LTRIM(RTRIM(@CityName));

        IF @CityID IS NULL
            THROW 50110, 'La ciudad indicada no existe en la base de datos.', 1;

        SELECT TOP (1)
            @PrimaryContactPersonID = PersonID
        FROM syn_Personas
        WHERE LTRIM(RTRIM(FullName)) = LTRIM(RTRIM(@PrimaryContactPersonName));

        IF @PrimaryContactPersonID IS NULL
            THROW 50111, 'El contacto primario indicado no existe en la base de datos.', 1;

        SET @AlternateContactPersonID = @PrimaryContactPersonID;

        IF NULLIF(LTRIM(RTRIM(@AlternateContactPersonName)), '') IS NOT NULL
        BEGIN
            SELECT TOP (1)
                @AlternateContactPersonID = PersonID
            FROM syn_Personas
            WHERE LTRIM(RTRIM(FullName)) = LTRIM(RTRIM(@AlternateContactPersonName));

            IF @AlternateContactPersonID IS NULL
                THROW 50112, 'El contacto alternativo indicado no existe en la base de datos.', 1;
        END;

        IF @Latitud IS NOT NULL AND @Longitud IS NOT NULL
            SET @Location = geography::Point(@Latitud, @Longitud, 4326);
        ELSE
            SET @Location = geography::Point(0, 0, 4326);

        INSERT INTO syn_Proveedores
        (
            SupplierName,
            SupplierCategoryID,
            PrimaryContactPersonID,
            AlternateContactPersonID,
            DeliveryMethodID,
            DeliveryCityID,
            PostalCityID,
            SupplierReference,
            BankAccountName,
            BankAccountBranch,
            BankAccountCode,
            BankAccountNumber,
            BankInternationalCode,
            PaymentDays,
            InternalComments,
            PhoneNumber,
            FaxNumber,
            WebsiteURL,
            DeliveryAddressLine1,
            DeliveryAddressLine2,
            DeliveryPostalCode,
            DeliveryLocation,
            PostalAddressLine1,
            PostalAddressLine2,
            PostalPostalCode,
            LastEditedBy
        )
        VALUES
        (
            LTRIM(RTRIM(@SupplierName)),
            @CategoryID,
            @PrimaryContactPersonID,
            @AlternateContactPersonID,
            @DeliveryMethodID,
            @CityID,
            @CityID,
            LTRIM(RTRIM(@SupplierReference)),
            ISNULL(NULLIF(LTRIM(RTRIM(@BankAccountName)), ''), 'N/A'),
            'N/A',
            'N/A',
            ISNULL(NULLIF(LTRIM(RTRIM(@BankAccountNumber)), ''), 'N/A'),
            'N/A',
            @PaymentDays,
            '',
            ISNULL(NULLIF(LTRIM(RTRIM(@PhoneNumber)), ''), 'N/A'),
            ISNULL(NULLIF(LTRIM(RTRIM(@FaxNumber)), ''), 'N/A'),
            ISNULL(NULLIF(LTRIM(RTRIM(@WebsiteURL)), ''), ''),
            ISNULL(NULLIF(LTRIM(RTRIM(@DeliveryAddressLine1)), ''), 'N/A'),
            ISNULL(NULLIF(LTRIM(RTRIM(@DeliveryAddressLine2)), ''), 'N/A'),
            ISNULL(NULLIF(LTRIM(RTRIM(@DeliveryPostalCode)), ''), 'N/A'),
            @Location,
            ISNULL(NULLIF(LTRIM(RTRIM(@PostalAddressLine1)), ''), 'N/A'),
            ISNULL(NULLIF(LTRIM(RTRIM(@PostalAddressLine2)), ''), 'N/A'),
            ISNULL(NULLIF(LTRIM(RTRIM(@PostalPostalCode)), ''), 'N/A'),
            1
        );

        SET @NuevoSupplierID = SCOPE_IDENTITY();

        COMMIT TRANSACTION;

        SELECT @NuevoSupplierID AS SupplierID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO

-- ================================================================
-- ACTUALIZAR PROVEEDOR
-- Parámetros : @SupplierID + mismos datos editables de creación
-- Retorno    : ninguno
-- Descripción: Actualización del proveedor
-- ================================================================
CREATE OR ALTER PROCEDURE ActualizarProveedor
    @SupplierID INT,
    @SupplierName NVARCHAR(100),
    @SupplierCategoryName NVARCHAR(50),
    @PrimaryContactPersonName NVARCHAR(100),
    @AlternateContactPersonName NVARCHAR(100) = NULL,
    @DeliveryMethodName NVARCHAR(100),
    @CityName NVARCHAR(100),
    @SupplierReference NVARCHAR(20),
    @DeliveryAddressLine1 NVARCHAR(60) = NULL,
    @DeliveryAddressLine2 NVARCHAR(60) = NULL,
    @DeliveryPostalCode NVARCHAR(10) = NULL,
    @PostalAddressLine1 NVARCHAR(60) = NULL,
    @PostalAddressLine2 NVARCHAR(60) = NULL,
    @PostalPostalCode NVARCHAR(10) = NULL,
    @Latitud FLOAT = NULL,
    @Longitud FLOAT = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @FaxNumber NVARCHAR(20) = NULL,
    @WebsiteURL NVARCHAR(256) = NULL,
    @BankAccountName NVARCHAR(50) = NULL,
    @BankAccountNumber NVARCHAR(20) = NULL,
    @PaymentDays INT = 30
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @CategoryID INT,
        @DeliveryMethodID INT,
        @CityID INT,
        @PrimaryContactPersonID INT,
        @AlternateContactPersonID INT,
        @Location GEOGRAPHY;

    IF NOT EXISTS (
        SELECT 1
        FROM syn_Proveedores
        WHERE SupplierID = @SupplierID
    )
        THROW 50113, 'El proveedor indicado no existe.', 1;

    IF NULLIF(LTRIM(RTRIM(@SupplierName)), '') IS NULL
        THROW 50114, 'El nombre del proveedor es obligatorio.', 1;

    IF NULLIF(LTRIM(RTRIM(@SupplierReference)), '') IS NULL
        THROW 50115, 'La referencia del proveedor es obligatoria.', 1;

    IF @PaymentDays < 0
        THROW 50116, 'Los días de gracia no pueden ser negativos.', 1;

    IF @Latitud IS NOT NULL AND (@Latitud < -90 OR @Latitud > 90)
        THROW 50117, 'La latitud debe estar entre -90 y 90.', 1;

    IF @Longitud IS NOT NULL AND (@Longitud < -180 OR @Longitud > 180)
        THROW 50118, 'La longitud debe estar entre -180 y 180.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT TOP (1)
            @CategoryID = SupplierCategoryID
        FROM syn_CategoriasProveedor
        WHERE LTRIM(RTRIM(SupplierCategoryName)) = LTRIM(RTRIM(@SupplierCategoryName));

        IF @CategoryID IS NULL
        BEGIN
            INSERT INTO syn_CategoriasProveedor
                (SupplierCategoryName, LastEditedBy)
            VALUES
                (LTRIM(RTRIM(@SupplierCategoryName)), 1);

            SET @CategoryID = SCOPE_IDENTITY();
        END;

        SELECT TOP (1)
            @DeliveryMethodID = DeliveryMethodID
        FROM syn_MetodosEntrega
        WHERE LTRIM(RTRIM(DeliveryMethodName)) = LTRIM(RTRIM(@DeliveryMethodName));

        IF @DeliveryMethodID IS NULL
        BEGIN
            INSERT INTO syn_MetodosEntrega
                (DeliveryMethodName, LastEditedBy)
            VALUES
                (LTRIM(RTRIM(@DeliveryMethodName)), 1);

            SET @DeliveryMethodID = SCOPE_IDENTITY();
        END;

        SELECT TOP (1)
            @CityID = CityID
        FROM syn_Ciudades
        WHERE LTRIM(RTRIM(CityName)) = LTRIM(RTRIM(@CityName));

        IF @CityID IS NULL
            THROW 50119, 'La ciudad indicada no existe en la base de datos.', 1;

        SELECT TOP (1)
            @PrimaryContactPersonID = PersonID
        FROM syn_Personas
        WHERE LTRIM(RTRIM(FullName)) = LTRIM(RTRIM(@PrimaryContactPersonName));

        IF @PrimaryContactPersonID IS NULL
            THROW 50120, 'El contacto primario indicado no existe en la base de datos.', 1;

        SET @AlternateContactPersonID = @PrimaryContactPersonID;

        IF NULLIF(LTRIM(RTRIM(@AlternateContactPersonName)), '') IS NOT NULL
        BEGIN
            SELECT TOP (1)
                @AlternateContactPersonID = PersonID
            FROM syn_Personas
            WHERE LTRIM(RTRIM(FullName)) = LTRIM(RTRIM(@AlternateContactPersonName));

            IF @AlternateContactPersonID IS NULL
                THROW 50121, 'El contacto alternativo indicado no existe en la base de datos.', 1;
        END;

        IF @Latitud IS NOT NULL AND @Longitud IS NOT NULL
            SET @Location = geography::Point(@Latitud, @Longitud, 4326);
        ELSE
            SET @Location = geography::Point(0, 0, 4326);

        UPDATE syn_Proveedores
        SET
            SupplierName = LTRIM(RTRIM(@SupplierName)),
            SupplierCategoryID = @CategoryID,
            PrimaryContactPersonID = @PrimaryContactPersonID,
            AlternateContactPersonID = @AlternateContactPersonID,
            DeliveryMethodID = @DeliveryMethodID,
            DeliveryCityID = @CityID,
            PostalCityID = @CityID,
            SupplierReference = LTRIM(RTRIM(@SupplierReference)),
            PhoneNumber = ISNULL(NULLIF(LTRIM(RTRIM(@PhoneNumber)), ''), 'N/A'),
            FaxNumber = ISNULL(NULLIF(LTRIM(RTRIM(@FaxNumber)), ''), 'N/A'),
            WebsiteURL = ISNULL(NULLIF(LTRIM(RTRIM(@WebsiteURL)), ''), ''),
            BankAccountName = ISNULL(NULLIF(LTRIM(RTRIM(@BankAccountName)), ''), 'N/A'),
            BankAccountNumber = ISNULL(NULLIF(LTRIM(RTRIM(@BankAccountNumber)), ''), 'N/A'),
            PaymentDays = @PaymentDays,
            DeliveryAddressLine1 = ISNULL(NULLIF(LTRIM(RTRIM(@DeliveryAddressLine1)), ''), 'N/A'),
            DeliveryAddressLine2 = ISNULL(NULLIF(LTRIM(RTRIM(@DeliveryAddressLine2)), ''), 'N/A'),
            DeliveryPostalCode = ISNULL(NULLIF(LTRIM(RTRIM(@DeliveryPostalCode)), ''), 'N/A'),
            DeliveryLocation = @Location,
            PostalAddressLine1 = ISNULL(NULLIF(LTRIM(RTRIM(@PostalAddressLine1)), ''), 'N/A'),
            PostalAddressLine2 = ISNULL(NULLIF(LTRIM(RTRIM(@PostalAddressLine2)), ''), 'N/A'),
            PostalPostalCode = ISNULL(NULLIF(LTRIM(RTRIM(@PostalPostalCode)), ''), 'N/A'),
            LastEditedBy = 1
        WHERE SupplierID = @SupplierID;

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
-- ELIMINAR PROVEEDOR
-- Parámetros : @SupplierID
-- Retorno    : ninguno
-- ================================================================
CREATE OR ALTER PROCEDURE EliminarProveedor
    @SupplierID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM syn_Proveedores
        WHERE SupplierID = @SupplierID
    )
        THROW 50122, 'El proveedor indicado no existe.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM syn_Proveedores
        WHERE SupplierID = @SupplierID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO
