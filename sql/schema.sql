IF DB_ID('VaultDb') IS NULL
BEGIN
    CREATE DATABASE VaultDb;
END;
GO

USE VaultDb;
GO

IF OBJECT_ID('dbo.VaultSettings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.VaultSettings (
        Id INT NOT NULL PRIMARY KEY,
        MasterPasswordHash NVARCHAR(200) NOT NULL,
        KdfSalt NVARCHAR(100) NOT NULL,
        CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT CK_VaultSettings_OnlyOne CHECK (Id = 1)
    );
END;
GO

IF OBJECT_ID('dbo.Credentials', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Credentials (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Service NVARCHAR(120) NOT NULL,
        Username NVARCHAR(160) NOT NULL,
        CipherText NVARCHAR(MAX) NOT NULL,
        Nonce NVARCHAR(100) NOT NULL,
        AuthTag NVARCHAR(100) NOT NULL,
        CreatedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;
GO
