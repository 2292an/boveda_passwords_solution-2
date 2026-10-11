# Bóveda Segura de Contraseñas

Solución académica para la actividad “Bóveda segura de contraseñas cifradas”.

## Stack
- SQL Server 2022 en Docker
- DBeaver para inspección de la base de datos
- ASP.NET Core 10 Web API (C#)
- React + TypeScript + Vite
- AES-256-GCM para cifrado reversible de secretos
- PBKDF2-SHA256 (600,000 iteraciones) para derivar la clave AES desde la contraseña maestra
- bcrypt (work factor 12) para validar la contraseña maestra sin almacenarla en texto plano

## 1. Levantar SQL Server
```bash
docker compose up -d
```

Credenciales de laboratorio:
- Host: localhost
- Puerto: 1433
- Usuario: sa
- Contraseña: VaultDemo_2026!

> Esta contraseña es solo para la instancia SQL de laboratorio, no es la contraseña maestra de la bóveda.

## 2. Crear la base con DBeaver
1. Crear conexión SQL Server a localhost:1433.
2. Autenticarse con `sa` / `VaultDemo_2026!`.
3. Abrir SQL Editor.
4. Ejecutar `sql/schema.sql` completo.
5. Refrescar y verificar `VaultDb` con tablas `Credentials` y `VaultSettings`.

## 3. Backend C#
Requiere .NET 10 SDK.

```bash
cd backend/VaultApi
dotnet restore
dotnet run --urls http://localhost:5000
```

## 4. Frontend React
```bash
cd frontend
npm install
npm run dev
```
Abrir http://localhost:5173

## 5. Contraseña maestra sugerida para la demostración
`Maestra-Demo-2026!`

No usar contraseñas reales.

## 6. Cinco credenciales ficticias sugeridas
| Servicio | Usuario | Contraseña |
|---|---|---|
| Correo Demo | ana.demo | Correo#Demo2026 |
| GitLab Demo | dev.demo | GitLab!Test55 |
| Banco Ficticio | cliente.001 | Banco$Falso88 |
| Nube Demo | nube.demo | Cloud-Demo-77! |
| Universidad Demo | estudiante.demo | AulaVirtual#42 |

## 7. Inspección en DBeaver
Ejecutar:
```sql
USE VaultDb;
SELECT Id, Service, Username, CipherText, Nonce, AuthTag, CreatedAtUtc
FROM dbo.Credentials;
```

El campo `CipherText` no debe coincidir con la contraseña ficticia original.

Para comprobar que la contraseña maestra tampoco está en texto plano:
```sql
SELECT Id, MasterPasswordHash, KdfSalt, CreatedAtUtc
FROM dbo.VaultSettings;
```

## 8. Pruebas obligatorias
1. Registrar una credencial: debe confirmarse el guardado.
2. Abrir DBeaver: `CipherText` no coincide con la contraseña original.
3. Descifrado correcto: escribir `Maestra-Demo-2026!` y pulsar Descifrar.
4. Contraseña incorrecta: usar `Incorrecta-123!`; debe rechazarse.
5. Persistencia: cerrar frontend/backend, volver a ejecutar y comprobar que las entradas siguen en SQL Server.

## 9. Evidencias sugeridas
- Captura de DBeaver con `CipherText`, `Nonce` y `AuthTag` visibles.
- Captura del frontend mostrando una entrada antes de descifrar.
- Captura del secreto recuperado con la contraseña maestra correcta.
- Captura del error al usar contraseña maestra incorrecta.
- Captura tras reiniciar la aplicación donde las credenciales siguen disponibles.
