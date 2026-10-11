# Guía paso a paso para completar y demostrar la tarea

## Fase 0 — Instalar herramientas
Necesita:
- Docker Desktop (Windows) o Docker Engine (Linux)
- DBeaver Community
- .NET 8 SDK
- Node.js 20+ y npm
- Git

## Fase 1 — SQL Server en Docker
1. Abra una terminal en la carpeta raíz del proyecto.
2. Ejecute:
   ```bash
   docker compose up -d
   ```
3. Verifique:
   ```bash
   docker ps
   ```
4. Debe aparecer el contenedor `vault-sqlserver`.

## Fase 2 — Conectar DBeaver y crear la base
1. DBeaver → New Database Connection → SQL Server.
2. Host: `localhost`.
3. Port: `1433`.
4. User: `sa`.
5. Password: `VaultDemo_2026!`.
6. Marque Trust server certificate si el driver lo solicita.
7. Test Connection.
8. Abra SQL Editor y ejecute `sql/schema.sql`.
9. Refresque el árbol de bases y confirme `VaultDb`.

## Fase 3 — Backend
1. Abra terminal:
   ```bash
   cd backend/VaultApi
   dotnet restore
   dotnet run --urls http://localhost:5000
   ```
2. Déjela abierta.

## Fase 4 — Frontend
1. Abra una segunda terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Abra `http://localhost:5173`.

## Fase 5 — Configurar la bóveda
1. En la primera pantalla escriba:
   `Maestra-Demo-2026!`
2. Pulse **Configurar bóveda**.
3. La base guardará un hash bcrypt y un salt, no la contraseña maestra original.

### Evidencia opcional
En DBeaver:
```sql
USE VaultDb;
SELECT * FROM dbo.VaultSettings;
```
Tome captura mostrando `MasterPasswordHash` y `KdfSalt`.

## Fase 6 — Registrar cinco credenciales ficticias
Utilice siempre la contraseña maestra `Maestra-Demo-2026!` al guardar.

1. Correo Demo | ana.demo | `Correo#Demo2026`
2. GitLab Demo | dev.demo | `GitLab!Test55`
3. Banco Ficticio | cliente.001 | `Banco$Falso88`
4. Nube Demo | nube.demo | `Cloud-Demo-77!`
5. Universidad Demo | estudiante.demo | `AulaVirtual#42`

## Fase 7 — Prueba 1: guardado
Después de cada registro la interfaz debe indicar que la credencial fue almacenada cifrada.
Tome una captura de la lista con las contraseñas ocultas.

## Fase 8 — Prueba 2: inspección directa
En DBeaver ejecute:
```sql
USE VaultDb;
SELECT Id, Service, Username, CipherText, Nonce, AuthTag, CreatedAtUtc
FROM dbo.Credentials;
```

Compruebe, por ejemplo, que `Correo#Demo2026` NO aparece en `CipherText`.
Tome la captura principal solicitada.

## Fase 9 — Prueba 3: descifrado correcto
1. Mantenga `Maestra-Demo-2026!` en el campo de contraseña maestra del formulario.
2. En la fila “Correo Demo”, pulse **Descifrar**.
3. Debe aparecer `Correo#Demo2026`.
4. Tome captura.

## Fase 10 — Prueba 4: contraseña maestra incorrecta
1. Cambie el campo de contraseña maestra por `Incorrecta-123!`.
2. Pulse **Descifrar** sobre cualquier fila.
3. Debe mostrarse `Contraseña maestra incorrecta.` y NO debe revelarse el secreto.
4. Tome captura.

## Fase 11 — Prueba 5: persistencia
1. Detenga backend y frontend con Ctrl+C.
2. Vuelva a ejecutar backend y frontend.
3. Recargue `http://localhost:5173`.
4. Las cinco credenciales deben seguir listadas.
5. En DBeaver siguen presentes porque el contenedor usa el volumen `vault_sql_data`.
6. Tome captura.

## Fase 12 — Preparar GitHub
Desde la raíz:
```bash
git init
git add .
git commit -m "Implementa bóveda segura de contraseñas"
git branch -M main
git remote add origin URL_DE_SU_REPOSITORIO
git push -u origin main
```
Luego copie el enlace en la sección A de `Plantilla_Entrega_Resuelta.md`.

## Fase 13 — Qué explicar en clase
En máximo cinco bloques:
1. Stack: Docker + SQL Server + DBeaver + ASP.NET Core + React.
2. AES-256-GCM para cifrado reversible; bcrypt para validación de maestra; PBKDF2 para derivar clave.
3. Mostrar DBeaver y probar que `CipherText` no contiene la contraseña original.
4. Descifrar con la maestra correcta y fallar con una incorrecta.
5. Explicar limitaciones: HTTPS, KMS/HSM, rotación de claves, control de intentos y auditoría.
