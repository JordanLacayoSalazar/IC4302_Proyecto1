USE WideWorldImporters;
GO

CREATE OR ALTER PROCEDURE ObtenerClientes
    @NombreBusqueda NVARCHAR(100) = NULL
AS
BEGIN
    SELECT
        c.CustomerID,
        c.CustomerName AS NombreCliente,
        cc.CustomerCategoryName AS Categoria,
        dm.DeliveryMethodName AS MetodoEntrega
    FROM syn_Clientes AS c
    LEFT JOIN syn_CategoriasCliente AS cc
        ON c.CustomerCategoryID = cc.CustomerCategoryID
    LEFT JOIN syn_MetodosEntrega AS dm
        ON c.DeliveryMethodID = dm.DeliveryMethodID
    WHERE 
        @NombreBusqueda IS NULL
        OR
        c.CustomerName LIKE '%' + @NombreBusqueda + '%'
    ORDER BY c.CustomerName ASC;
END;
GO


CREATE OR ALTER PROCEDURE ObtenerDetalleCliente
    @CustomerID INT
AS
BEGIN
    SELECT
        c.CustomerID,
        c.BillToCustomerID,
        c.CustomerCategoryID,
        c.BuyingGroupID,
        c.PrimaryContactPersonID,
        c.AlternateContactPersonID,
        c.DeliveryMethodID,
        c.DeliveryCityID,
        c.PostalCityID,
        c.CustomerName AS NombreCliente,
        c.PhoneNumber,
        c.FaxNumber,
        c.PaymentDays,
        c.WebsiteURL,
        c.DeliveryAddressLine1,
        c.DeliveryAddressLine2,
        c.DeliveryPostalCode,
        c.PostalAddressLine1,
        c.PostalAddressLine2,
        c.PostalPostalCode,
        cc.CustomerCategoryName AS Categoria,
        bg.BuyingGroupName AS GrupoCompra,
        contactoPrimario.FullName AS ContactoPrimario,
        contactoAlternativo.FullName AS ContactoAlternativo,
        clienteFacturacion.CustomerName AS ClienteFacturacion,
        dm.DeliveryMethodName AS MetodoEntrega,
        ciudadEntrega.CityName AS CiudadEntrega,
        c.DeliveryPostalCode AS CodigoPostal,
        c.PhoneNumber AS Telefono,
        c.FaxNumber AS Fax,
        c.PaymentDays AS DiasGracia,
        c.WebsiteURL AS SitioWeb,

        CASE
            WHEN ISNULL(c.DeliveryAddressLine1, '') = ''
                AND ISNULL(c.DeliveryAddressLine2, '') = ''
            THEN ''

            WHEN ISNULL(c.DeliveryAddressLine2, '') = ''
            THEN ISNULL(c.DeliveryAddressLine1, '')

            WHEN ISNULL(c.DeliveryAddressLine1, '') = ''
            THEN ISNULL(c.DeliveryAddressLine2, '')

            ELSE c.DeliveryAddressLine1 + ', ' + c.DeliveryAddressLine2
        END AS DireccionEntrega,

        CASE
            WHEN ISNULL(c.PostalAddressLine1, '') = ''
                AND ISNULL(c.PostalAddressLine2, '') = ''
            THEN ''

            WHEN ISNULL(c.PostalAddressLine2, '') = ''
            THEN ISNULL(c.PostalAddressLine1, '')

            WHEN ISNULL(c.PostalAddressLine1, '') = ''
            THEN ISNULL(c.PostalAddressLine2, '')

            ELSE c.PostalAddressLine1 + ', ' + c.PostalAddressLine2
        END AS DireccionPostal,

        CASE
            WHEN c.DeliveryLocation IS NULL THEN NULL
            ELSE
                CONVERT(VARCHAR(50), c.DeliveryLocation.Lat) +
                ', ' +
                CONVERT(VARCHAR(50), c.DeliveryLocation.Long)
        END AS LocalizacionEntrega,
        c.DeliveryLocation.Lat AS Latitud,
        c.DeliveryLocation.Long AS Longitud

    FROM syn_Clientes AS c

    LEFT JOIN syn_CategoriasCliente AS cc
        ON c.CustomerCategoryID = cc.CustomerCategoryID

    LEFT JOIN syn_GruposCompra AS bg
        ON c.BuyingGroupID = bg.BuyingGroupID

    LEFT JOIN syn_Personas AS contactoPrimario
        ON c.PrimaryContactPersonID = contactoPrimario.PersonID

    LEFT JOIN syn_Personas AS contactoAlternativo
        ON c.AlternateContactPersonID = contactoAlternativo.PersonID

    LEFT JOIN syn_Clientes AS clienteFacturacion
        ON c.BillToCustomerID = clienteFacturacion.CustomerID

    LEFT JOIN syn_MetodosEntrega AS dm
        ON c.DeliveryMethodID = dm.DeliveryMethodID

    LEFT JOIN syn_Ciudades AS ciudadEntrega
        ON c.DeliveryCityID = ciudadEntrega.CityID

    WHERE c.CustomerID = @CustomerID;
END;
GO

-- ==========================================
--  PROCEDIMIENTO: CREAR
-- ==========================================
CREATE OR ALTER PROCEDURE CrearCliente
    @CustomerName NVARCHAR(100),
    @BillToCustomerID INT,
    @CustomerCategoryID INT,
    @PrimaryContactPersonID INT,
    @DeliveryMethodID INT,
    @DeliveryCityID INT,
    @BuyingGroupID INT = NULL,
    @AlternateContactPersonID INT = NULL,
    @PostalCityID INT = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @FaxNumber NVARCHAR(20) = NULL,
    @WebsiteURL NVARCHAR(256) = NULL,
    @PaymentDays INT = NULL,
    @DeliveryAddressLine1 NVARCHAR(60) = NULL,
    @DeliveryAddressLine2 NVARCHAR(60) = NULL,
    @DeliveryPostalCode NVARCHAR(10) = NULL,
    @PostalAddressLine1 NVARCHAR(60) = NULL,
    @PostalAddressLine2 NVARCHAR(60) = NULL,
    @PostalPostalCode NVARCHAR(10) = NULL,
    @Latitud FLOAT = NULL,
    @Longitud FLOAT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DeliveryLocation GEOGRAPHY = NULL;
    DECLARE @NuevoCustomerID INT;

    IF @Latitud IS NOT NULL AND @Longitud IS NOT NULL
        SET @DeliveryLocation = geography::Point(@Latitud, @Longitud, 4326);

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO syn_Clientes (
            CustomerName,
            BillToCustomerID,
            CustomerCategoryID,
            BuyingGroupID,
            PrimaryContactPersonID,
            AlternateContactPersonID,
            DeliveryMethodID,
            DeliveryCityID,
            PostalCityID,
            CreditLimit,
            AccountOpenedDate,
            StandardDiscountPercentage,
            IsStatementSent,
            IsOnCreditHold,
            PaymentDays,
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
            @CustomerName,
            @BillToCustomerID,
            @CustomerCategoryID,
            @BuyingGroupID,
            @PrimaryContactPersonID,
            @AlternateContactPersonID,
            @DeliveryMethodID,
            @DeliveryCityID,
            ISNULL(@PostalCityID, @DeliveryCityID),
            NULL,
            CAST(GETDATE() AS DATE),
            0,
            0,
            0,
            ISNULL(@PaymentDays, 7),
            ISNULL(@PhoneNumber, 'N/A'),
            ISNULL(@FaxNumber, 'N/A'),
            ISNULL(@WebsiteURL, ''),
            ISNULL(@DeliveryAddressLine1, 'N/A'),
            @DeliveryAddressLine2,
            ISNULL(@DeliveryPostalCode, 'N/A'),
            @DeliveryLocation,
            ISNULL(@PostalAddressLine1, 'N/A'),
            @PostalAddressLine2,
            ISNULL(@PostalPostalCode, 'N/A'),
            1
        );

        SET @NuevoCustomerID = SCOPE_IDENTITY();

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
CREATE OR ALTER PROCEDURE ActualizarCliente
    @CustomerID INT,
    @CustomerName NVARCHAR(100),
    @BillToCustomerID INT = NULL,
    @CustomerCategoryID INT = NULL,
    @BuyingGroupID INT = NULL,
    @PrimaryContactPersonID INT = NULL,
    @AlternateContactPersonID INT = NULL,
    @DeliveryMethodID INT = NULL,
    @DeliveryCityID INT = NULL,
    @PostalCityID INT = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @FaxNumber NVARCHAR(20) = NULL,
    @WebsiteURL NVARCHAR(256) = NULL,
    @PaymentDays INT = NULL,
    @DeliveryAddressLine1 NVARCHAR(60) = NULL,
    @DeliveryAddressLine2 NVARCHAR(60) = NULL,
    @DeliveryPostalCode NVARCHAR(10) = NULL,
    @PostalAddressLine1 NVARCHAR(60) = NULL,
    @PostalAddressLine2 NVARCHAR(60) = NULL,
    @PostalPostalCode NVARCHAR(10) = NULL,
    @Latitud FLOAT = NULL,
    @Longitud FLOAT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DeliveryLocation GEOGRAPHY = NULL;
    IF @Latitud IS NOT NULL AND @Longitud IS NOT NULL
        SET @DeliveryLocation = geography::Point(@Latitud, @Longitud, 4326);

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE syn_Clientes
        SET CustomerName = @CustomerName,
            BillToCustomerID = ISNULL(@BillToCustomerID, BillToCustomerID),
            CustomerCategoryID = ISNULL(@CustomerCategoryID, CustomerCategoryID),
            BuyingGroupID = ISNULL(@BuyingGroupID, BuyingGroupID),
            PrimaryContactPersonID = ISNULL(@PrimaryContactPersonID, PrimaryContactPersonID),
            AlternateContactPersonID = ISNULL(@AlternateContactPersonID, AlternateContactPersonID),
            DeliveryMethodID = ISNULL(@DeliveryMethodID, DeliveryMethodID),
            DeliveryCityID = ISNULL(@DeliveryCityID, DeliveryCityID),
            PostalCityID = ISNULL(@PostalCityID, PostalCityID),
            PhoneNumber = ISNULL(@PhoneNumber, PhoneNumber),
            FaxNumber = ISNULL(@FaxNumber, FaxNumber),
            WebsiteURL = ISNULL(@WebsiteURL, WebsiteURL),
            PaymentDays = ISNULL(@PaymentDays, PaymentDays),
            DeliveryAddressLine1 = ISNULL(@DeliveryAddressLine1, DeliveryAddressLine1),
            DeliveryAddressLine2 = ISNULL(@DeliveryAddressLine2, DeliveryAddressLine2),
            DeliveryPostalCode = ISNULL(@DeliveryPostalCode, DeliveryPostalCode),
            PostalAddressLine1 = ISNULL(@PostalAddressLine1, PostalAddressLine1),
            PostalAddressLine2 = ISNULL(@PostalAddressLine2, PostalAddressLine2),
            PostalPostalCode = ISNULL(@PostalPostalCode, PostalPostalCode),
            DeliveryLocation = ISNULL(@DeliveryLocation, DeliveryLocation),
            LastEditedBy = 1
        WHERE CustomerID = @CustomerID;

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
CREATE OR ALTER PROCEDURE EliminarCliente
    @CustomerID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
        DELETE FROM syn_Clientes
        WHERE CustomerID = @CustomerID;
        COMMIT TRANSACTION;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
