USE WideWorldImporters;
GO

/*
============================================
  PROCEDIMIENTO: ObtenerClientes
  Obtiene una lista de clientes con sus categorías y métodos de entrega.
============================================
*/
CREATE OR ALTER PROCEDURE ObtenerClientes
    @NombreBusqueda NVARCHAR(100) = NULL,
    @CategoriaBusqueda NVARCHAR(100) = NULL,
    @MetodoEntregaBusqueda NVARCHAR(100) = NULL
AS
BEGIN
    SELECT
        c.CustomerID,
        c.CustomerName AS NombreCliente,
        cc.CustomerCategoryName AS Categoria,
        dm.DeliveryMethodName AS MetodoEntrega
    FROM syn_Clientes AS c
    INNER JOIN syn_CategoriasCliente AS cc
        ON c.CustomerCategoryID = cc.CustomerCategoryID
    INNER JOIN syn_MetodosEntrega AS dm
        ON c.DeliveryMethodID = dm.DeliveryMethodID
    WHERE
        (
            NULLIF(LTRIM(RTRIM(@NombreBusqueda)), '') IS NULL
            OR c.CustomerName LIKE '%' + LTRIM(RTRIM(@NombreBusqueda)) + '%'
        )
        AND (
            NULLIF(LTRIM(RTRIM(@CategoriaBusqueda)), '') IS NULL
            OR cc.CustomerCategoryName LIKE '%' + LTRIM(RTRIM(@CategoriaBusqueda)) + '%'
        )
        AND (
            NULLIF(LTRIM(RTRIM(@MetodoEntregaBusqueda)), '') IS NULL
            OR dm.DeliveryMethodName LIKE '%' + LTRIM(RTRIM(@MetodoEntregaBusqueda)) + '%'
        )
    ORDER BY c.CustomerName ASC;
END;
GO

/*
============================================
  PROCEDIMIENTO: ObtenerOpcionesFormularioCliente
  Devuelve los catálogos usados por los selectores del formulario.
============================================
*/
CREATE OR ALTER PROCEDURE ObtenerOpcionesFormularioCliente
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CustomerCategoryID, CustomerCategoryName
    FROM syn_CategoriasCliente
    ORDER BY CustomerCategoryName;

    SELECT BuyingGroupID, BuyingGroupName
    FROM syn_GruposCompra
    ORDER BY BuyingGroupName;

    SELECT PersonID, FullName
    FROM syn_Personas
    ORDER BY FullName;

    SELECT DeliveryMethodID, DeliveryMethodName
    FROM syn_MetodosEntrega
    ORDER BY DeliveryMethodName;

    SELECT CityID, CityName
    FROM syn_Ciudades
    ORDER BY CityName;

    SELECT CustomerID, CustomerName
    FROM syn_Clientes
    ORDER BY CustomerName;
END;
GO

/*
============================================
  PROCEDIMIENTO: ObtenerDetalleCliente
  Obtiene el detalle completo de un cliente específico.
============================================
*/
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
        c.CreditLimit,
        c.StandardDiscountPercentage,
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

    INNER JOIN syn_CategoriasCliente AS cc
        ON c.CustomerCategoryID = cc.CustomerCategoryID

    LEFT JOIN syn_GruposCompra AS bg -- Se hace LEFT JOIN para incluir clientes sin grupo de compra
        ON c.BuyingGroupID = bg.BuyingGroupID

    INNER JOIN syn_Personas AS contactoPrimario
        ON c.PrimaryContactPersonID = contactoPrimario.PersonID

    LEFT JOIN syn_Personas AS contactoAlternativo -- Se hace LEFT JOIN para incluir clientes sin contacto alternativo
        ON c.AlternateContactPersonID = contactoAlternativo.PersonID

    INNER JOIN syn_Clientes AS clienteFacturacion
        ON c.BillToCustomerID = clienteFacturacion.CustomerID

    INNER JOIN syn_MetodosEntrega AS dm
        ON c.DeliveryMethodID = dm.DeliveryMethodID

    INNER JOIN syn_Ciudades AS ciudadEntrega
        ON c.DeliveryCityID = ciudadEntrega.CityID

    WHERE c.CustomerID = @CustomerID;
END;
GO

/*
==========================================
    PROCEDIMIENTO: CrearCliente
    Inserta un nuevo cliente en la base de datos.
==========================================
*/
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
    @Longitud FLOAT = NULL,
    @CreditLimit DECIMAL(18, 2) = NULL,
    @StandardDiscountPercentage DECIMAL(18, 3) = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DeliveryLocation GEOGRAPHY = NULL;
    DECLARE @NuevoCustomerID INT;

    IF @Latitud IS NOT NULL AND @Longitud IS NOT NULL
        SET @DeliveryLocation = geography::Point(@Latitud, @Longitud, 4326);
        -- 4326 es el Spatial Reference Identifier para WGS 84, que es un sistema de coordenadas geográficas comúnmente utilizado.

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
            @CreditLimit,
            CAST(GETDATE() AS DATE),
            ISNULL(@StandardDiscountPercentage, 0),
            0, -- No se envía el estado de cuenta por defecto
            0, -- No está en retención de crédito por defecto
            ISNULL(@PaymentDays, 7),
            ISNULL(@PhoneNumber, 'N/A'),
            ISNULL(@FaxNumber, 'N/A'),
            ISNULL(@WebsiteURL, 'N/A'),
            ISNULL(@DeliveryAddressLine1, 'N/A'),
            @DeliveryAddressLine2,
            ISNULL(@DeliveryPostalCode, 'N/A'),
            @DeliveryLocation,
            ISNULL(@PostalAddressLine1, 'N/A'),
            @PostalAddressLine2,
            ISNULL(@PostalPostalCode, 'N/A'),
            1 -- El ID del usuario que realiza la inserción (en este caso, 1 para el administrador)
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

/*
==========================================
    PROCEDIMIENTO: ActualizarCliente
    Actualiza la información de un cliente existente en la base de datos.
==========================================
*/
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
    @Longitud FLOAT = NULL,
    @CreditLimit DECIMAL(18, 2) = NULL,
    @StandardDiscountPercentage DECIMAL(18, 3) = NULL,
    @ActualizarCreditLimit BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DeliveryLocation GEOGRAPHY = NULL;
    IF @Latitud IS NOT NULL AND @Longitud IS NOT NULL
        SET @DeliveryLocation = geography::Point(@Latitud, @Longitud, 4326);

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE syn_Clientes
        SET CustomerName = LTRIM(RTRIM(@CustomerName)),
            BillToCustomerID = ISNULL(@BillToCustomerID, BillToCustomerID),
            CustomerCategoryID = ISNULL(@CustomerCategoryID, CustomerCategoryID),
            BuyingGroupID = ISNULL(@BuyingGroupID, BuyingGroupID),
            PrimaryContactPersonID = ISNULL(@PrimaryContactPersonID, PrimaryContactPersonID),
            AlternateContactPersonID = ISNULL(@AlternateContactPersonID, AlternateContactPersonID),
            DeliveryMethodID = ISNULL(@DeliveryMethodID, DeliveryMethodID),
            DeliveryCityID = ISNULL(@DeliveryCityID, DeliveryCityID),
            PostalCityID = ISNULL(@PostalCityID, PostalCityID),
            PhoneNumber = ISNULL(LTRIM(RTRIM(@PhoneNumber)), PhoneNumber),
            FaxNumber = ISNULL(LTRIM(RTRIM(@FaxNumber)), FaxNumber),
            WebsiteURL = ISNULL(LTRIM(RTRIM(@WebsiteURL)), WebsiteURL),
            PaymentDays = ISNULL(@PaymentDays, PaymentDays),
            DeliveryAddressLine1 = ISNULL(LTRIM(RTRIM(@DeliveryAddressLine1)), DeliveryAddressLine1),
            DeliveryAddressLine2 = ISNULL(LTRIM(RTRIM(@DeliveryAddressLine2)), DeliveryAddressLine2),
            DeliveryPostalCode = ISNULL(LTRIM(RTRIM(@DeliveryPostalCode)), DeliveryPostalCode),
            PostalAddressLine1 = ISNULL(LTRIM(RTRIM(@PostalAddressLine1)), PostalAddressLine1),
            PostalAddressLine2 = ISNULL(LTRIM(RTRIM(@PostalAddressLine2)), PostalAddressLine2),
            PostalPostalCode = ISNULL(LTRIM(RTRIM(@PostalPostalCode)), PostalPostalCode),
            CreditLimit = CASE
                WHEN @ActualizarCreditLimit = 1 THEN @CreditLimit
                ELSE CreditLimit
            END,
            StandardDiscountPercentage = ISNULL(
                @StandardDiscountPercentage,
                StandardDiscountPercentage
            ),
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

/*
==========================================
    PROCEDIMIENTO: EliminarCliente
    Elimina un cliente de la base de datos.
==========================================
*/
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
