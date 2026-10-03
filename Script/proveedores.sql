USE WideWorldImporters;
GO

/*
================================================================================
NOMBRE PROCEDIMIENTO: 
    ObtenerProveedores

DESCRIPCIÓN:
    Obtiene una lista de proveedores y muestra información relacionada con
    su categoría y método de entrega. Permite aplicar filtros opcionales
    por nombre del proveedor y categoría.

PARÁMETROS:
    @NombreBusqueda - Texto utilizado para buscar proveedores por nombre.

    @CategoriaID    - Identificador de la categoría del proveedor.

RETORNA:
    SupplierID      - Identificador del proveedor.
    NombreProveedor - Nombre del proveedor.
    Categoria       - Nombre de la categoría del proveedor.
    MetodoEntrega   - Nombre del método de entrega.

NOTAS:
    Los filtros son acumulativos cuando se proporcionan ambos parámetros.
    Si algunos de los parámetros es NULL el filto no se aplica.
    Los resultados se ordenan alfabéticamente por nombre del proveedor.
================================================================================ */
CREATE OR ALTER PROCEDURE ObtenerProveedores
    @NombreBusqueda NVARCHAR(100) = NULL,
    @CategoriaID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.SupplierID,
        p.SupplierName AS NombreProveedor,
        c.SupplierCategoryName AS Categoria,
        m.DeliveryMethodName AS MetodoEntrega
    FROM syn_Proveedores p
    LEFT JOIN syn_CategoriasProveedor c ON p.SupplierCategoryID = c.SupplierCategoryID
    LEFT JOIN syn_MetodosEntrega m ON p.DeliveryMethodID = m.DeliveryMethodID
    WHERE 
        (@NombreBusqueda IS NULL OR p.SupplierName LIKE '%' + @NombreBusqueda + '%')
        AND (@CategoriaID IS NULL OR p.SupplierCategoryID = @CategoriaID)
    ORDER BY p.SupplierName ASC; 
END;
GO

-- ==========================================
--  PROCEDIMIENTO: VER DETALLES EN VENTANA
-- ==========================================
CREATE OR ALTER PROCEDURE ObtenerDetalleProveedor
    @SupplierID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.SupplierReference AS CodigoProveedor,
        p.SupplierName AS NombreProveedor,
        c.SupplierCategoryName AS Categoria,
        Contact1.FullName AS ContactoPrimario,
        Contact2.FullName AS ContactoAlternativo,
        m.DeliveryMethodName AS MetodoEntrega,
        ci.CityName AS CiudadEntrega,
        p.DeliveryPostalCode AS CodigoPostal,
        p.PhoneNumber AS Telefono,
        p.FaxNumber AS Fax,
        p.WebsiteURL AS SitioWeb,
        p.DeliveryAddressLine1 + ', ' + p.DeliveryAddressLine2 AS Direccion,
        p.DeliveryLocation.Lat AS Latitud,
        p.DeliveryLocation.Long AS Longitud,
        p.BankAccountName AS NombreBanco,
        p.BankAccountNumber AS CuentaCorriente,
        p.PaymentDays AS DiasGracia
    FROM syn_Proveedores p
    LEFT JOIN syn_CategoriasProveedor c ON p.SupplierCategoryID = c.SupplierCategoryID
    LEFT JOIN syn_MetodosEntrega m ON p.DeliveryMethodID = m.DeliveryMethodID
    LEFT JOIN syn_Ciudades ci ON p.DeliveryCityID = ci.CityID
    LEFT JOIN syn_Personas Contact1 ON p.PrimaryContactPersonID = Contact1.PersonID
    LEFT JOIN syn_Personas Contact2 ON p.AlternateContactPersonID = Contact2.PersonID
    WHERE p.SupplierID = @SupplierID;
END;
GO


CREATE OR ALTER PROCEDURE ObtenerCategoriasProveedor
AS
BEGIN
    SET NOCOUNT ON;
    SELECT SupplierCategoryID, SupplierCategoryName
    FROM syn_CategoriasProveedor
    ORDER BY SupplierCategoryName ASC;
END;
GO

---------------------------------------------------------------------------------------------------------------------- estos los estoy cambiando
-- ==========================================
--  PROCEDIMIENTO: CREAR
-- ==========================================
CREATE OR ALTER PROCEDURE CrearProveedor
    -- Parámetros obligatorios desde el formulario
    @SupplierName NVARCHAR(100),
    @SupplierCategoryID INT,
    @PrimaryContactPersonID INT,
    @DeliveryMethodID INT,
    @DeliveryCityID INT,
    @SupplierReference NVARCHAR(20),
    
    -- Parámetros opcionales (por defecto NULL si no se envían)
    @AlternateContactPersonID INT = NULL,
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

    DECLARE @Location GEOGRAPHY;

    IF @Latitud IS NOT NULL AND @Longitud IS NOT NULL
        SET @Location = geography::Point(@Latitud, @Longitud, 4326);
    ELSE
        SET @Location = geography::Point(0, 0, 4326);

    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO syn_Proveedores (
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
        VALUES (
            @SupplierName, 
            @SupplierCategoryID, 
            @PrimaryContactPersonID, 
            ISNULL(@AlternateContactPersonID, @PrimaryContactPersonID),
            @DeliveryMethodID,
            @DeliveryCityID,
            @DeliveryCityID,
            @SupplierReference, 
            ISNULL(@BankAccountName, 'N/A'), 
            'N/A', 
            'N/A', 
            ISNULL(@BankAccountNumber, 'N/A'), 
            'N/A', 
            @PaymentDays, 
            '', 
            ISNULL(@PhoneNumber, 'N/A'), 
            ISNULL(@FaxNumber, 'N/A'), 
            ISNULL(@WebsiteURL, ''),
            'Dirección Default', 
            'Dirección Default 2', 
            '00000', 
            @Location,
            'Dirección Default', 
            'Dirección Default 2', 
            '00000', 
            1
        );
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ==========================================
--  PROCEDIMIENTO: ACTUALIZAR
-- ==========================================
CREATE OR ALTER PROCEDURE ActualizarProveedor
    @SupplierID INT,
    @SupplierName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        UPDATE syn_Proveedores
        SET SupplierName = @SupplierName,
            LastEditedBy = 1
        WHERE SupplierID = @SupplierID;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ==========================================
--  PROCEDIMIENTO: ELIMINAR
-- ==========================================
CREATE OR ALTER PROCEDURE EliminarProveedor
    @SupplierID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        DELETE FROM syn_Proveedores WHERE SupplierID = @SupplierID;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
