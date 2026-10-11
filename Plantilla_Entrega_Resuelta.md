# PLANTILLA DE ENTREGA RESUELTA
## Actividad asincrónica - Clase 04

> Sustituya únicamente los campos marcados como **[COMPLETAR]** y agregue sus capturas reales.

## A. Identificación del equipo

| Dato | Información |
|---|---|
| Número o nombre del equipo | **[COMPLETAR]** |
| Integrantes | **[COMPLETAR]** |
| Nombre de la aplicación | Bóveda Segura de Contraseñas |
| Fecha de entrega | **[COMPLETAR]** |
| Código fuente (Link GitHub) | **[COMPLETAR después de subir el proyecto]** |

## B. Tecnología y fuente de datos

| Elemento | Selección del equipo |
|---|---|
| Lenguaje / framework | Backend: C# con ASP.NET Core 8 Web API. Frontend: React + TypeScript + Vite. |
| Sistema operativo de demostración | Windows 10/11 o Linux con Docker Desktop/Engine, DBeaver, .NET 8 y Node.js. |
| Fuente de datos | Microsoft SQL Server 2022 ejecutado en un contenedor Docker. |
| Ubicación de los datos persistentes | Base `VaultDb`, tablas `dbo.Credentials` y `dbo.VaultSettings`, persistidas en el volumen Docker `vault_sql_data`. |

## C. Método de cifrado seleccionado

| Elemento | Descripción |
|---|---|
| Algoritmo o método | AES-256-GCM para cifrar y autenticar cada contraseña almacenada. La clave AES se deriva desde la contraseña maestra mediante PBKDF2-HMAC-SHA256 con 600,000 iteraciones. |
| Librería utilizada | `System.Security.Cryptography` de .NET para AES-GCM, PBKDF2 y generación criptográfica aleatoria; `BCrypt.Net-Next` para validar la contraseña maestra mediante hash bcrypt. |
| Cómo participa la contraseña maestra | La contraseña maestra se valida contra un hash bcrypt. Además, junto con un salt aleatorio almacenado, alimenta PBKDF2 para obtener una clave de 256 bits. Esa clave cifra y descifra las contraseñas de la bóveda. La contraseña maestra nunca se almacena directamente. |
| Datos auxiliares utilizados | `KdfSalt` aleatorio de 32 bytes para PBKDF2, `Nonce` aleatorio de 12 bytes por credencial y `AuthTag` de 16 bytes generado por AES-GCM. Salt, nonce y tag no necesitan ser secretos, pero sí deben conservarse correctamente. |

### Justificación breve
Se eligió AES-256-GCM porque permite recuperar el secreto original y, además de confidencialidad, ofrece autenticación de los datos. Se utiliza PBKDF2 para transformar la contraseña maestra en una clave criptográfica de tamaño adecuado y bcrypt para verificar la contraseña maestra sin persistirla en texto plano.

## D. Arquitectura o flujo de la solución

```text
                     CONFIGURACIÓN INICIAL
Contraseña maestra ───────────────┬──────────────────────────────┐
                                  │                              │
                                  v                              v
                         bcrypt(password)                  PBKDF2-SHA256
                                  │                        + KdfSalt
                                  v                              │
                     MasterPasswordHash                        v
                           SQL Server                    Clave AES-256

                       GUARDADO DE CREDENCIAL
Servicio + Usuario + Contraseña ficticia + Contraseña maestra
                                  │
                                  v
                      Backend ASP.NET Core
                                  │
                  valida contraseña maestra con bcrypt
                                  │
                                  v
                   deriva clave mediante PBKDF2
                                  │
                                  v
             AES-256-GCM + Nonce aleatorio de 12 bytes
                                  │
                 ┌────────────────┼────────────────┐
                 v                v                v
             CipherText         Nonce           AuthTag
                 └────────────────┼────────────────┘
                                  v
                         SQL Server / VaultDb

                       RECUPERACIÓN DEL SECRETO
Usuario selecciona credencial + escribe contraseña maestra
                                  │
                                  v
                       validación bcrypt
                                  │
                          correcta / incorrecta
                           │              │
                           v              v
                     PBKDF2 + AES-GCM   HTTP 401
                           │
                           v
                  Contraseña recuperada
```

## E. Evidencia de almacenamiento cifrado

| Dato | Información |
|---|---|
| Contraseña ficticia original utilizada | `Correo#Demo2026` |
| Valor observado en la fuente de datos | **[PEGAR aquí el CipherText Base64 obtenido realmente en DBeaver]** |
| ¿Se encuentra en texto plano? | No |

**Explicación:** el texto almacenado en `CipherText` debe ser diferente de `Correo#Demo2026`. También se almacenan `Nonce` y `AuthTag`, necesarios para AES-GCM.

## F. Captura de la fuente de datos

**[PEGAR AQUÍ captura real de DBeaver ejecutando:]**

```sql
USE VaultDb;
SELECT Id, Service, Username, CipherText, Nonce, AuthTag, CreatedAtUtc
FROM dbo.Credentials;
```

La captura debe mostrar claramente que la contraseña original no está presente en texto plano.

## G. Pruebas realizadas

| Prueba | Resultado obtenido | Evidencia |
|---|---|---|
| Registro de credencial | La aplicación permitió registrar una credencial ficticia y confirmó el almacenamiento. | **[Captura 1]** |
| Inspección del valor cifrado | En DBeaver, `CipherText` mostró un valor Base64 distinto a la contraseña original. | **[Captura 2]** |
| Descifrado con contraseña maestra correcta | Al ingresar `Maestra-Demo-2026!`, la aplicación recuperó correctamente el secreto seleccionado. | **[Captura 3]** |
| Intento con contraseña maestra incorrecta | Al ingresar `Incorrecta-123!`, la API respondió con rechazo y el secreto no se mostró. | **[Captura 4]** |
| Cierre y reapertura de la aplicación | Después de cerrar y volver a ejecutar frontend/backend, las entradas continuaron disponibles porque permanecieron en SQL Server. | **[Captura 5]** |

## H. Explicación del proceso criptográfico

Cuando el usuario configura la bóveda, la contraseña maestra no se almacena directamente. La aplicación genera un hash bcrypt que se utiliza para validarla posteriormente y también crea un salt criptográficamente aleatorio. Cuando se registra una credencial, la contraseña maestra se valida primero con bcrypt. Después se combina con el salt mediante PBKDF2-HMAC-SHA256, con 600,000 iteraciones, para derivar una clave de 256 bits. Esa clave se utiliza con AES-256-GCM para cifrar la contraseña de la credencial. Para cada registro se crea un nonce aleatorio de 12 bytes y AES-GCM genera un tag de autenticación de 16 bytes. SQL Server conserva únicamente el texto cifrado, el nonce y el tag, nunca la contraseña original. Para recuperar el secreto, se repite la derivación de la clave con la contraseña maestra correcta y se ejecuta AES-GCM en modo de descifrado. Si la contraseña maestra es incorrecta, la validación bcrypt falla y el backend rechaza la operación. El hash protege la verificación de la contraseña maestra, mientras que el cifrado reversible permite recuperar los secretos almacenados.

## I. Limitaciones y mejoras

1. En una versión de producción se utilizaría HTTPS obligatoriamente, administración segura de secretos, controles de sesión y una política de bloqueo o retardos ante intentos repetidos de contraseña maestra para reducir ataques de fuerza bruta.
2. Se implementaría rotación de la contraseña maestra y de claves, respaldos cifrados, auditoría sin registrar secretos, control de acceso por usuario y un servicio especializado de administración de claves, por ejemplo un HSM o KMS.

## J. Conclusión del equipo

La actividad permitió comprobar que ocultar visualmente una contraseña no equivale a protegerla. Al inspeccionar directamente SQL Server observamos que una contraseña almacenada en texto plano sería legible para cualquier persona con acceso a la base de datos. Con AES-256-GCM, en cambio, la fuente persistente conserva un valor cifrado que no revela el secreto original. También comprobamos que el cifrado necesita información auxiliar, como nonce, tag y salt, y que estos valores cumplen funciones distintas. La contraseña maestra permite derivar la clave necesaria para recuperar el secreto, pero no se almacena directamente. Finalmente, entendimos la diferencia entre hashing, que se utiliza para verificación, y cifrado reversible, que se necesita cuando el valor original debe recuperarse.

## K. Referencias consultadas

1. Microsoft Learn. `AesGcm` Class — `System.Security.Cryptography`. https://learn.microsoft.com/dotnet/api/system.security.cryptography.aesgcm
2. Microsoft Learn. `Rfc2898DeriveBytes.Pbkdf2` — PBKDF2 en .NET. https://learn.microsoft.com/dotnet/api/system.security.cryptography.rfc2898derivebytes.pbkdf2
3. NIST SP 800-38D. *Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC*. https://csrc.nist.gov/publications/detail/sp/800-38d/final
4. BCrypt.Net-Next. Repositorio y documentación. https://github.com/BcryptNet/bcrypt.net
5. Microsoft SQL Server 2022 Linux containers. https://learn.microsoft.com/sql/linux/quickstart-install-connect-docker

## Lista de verificación antes de entregar

- [ ] La aplicación puede ejecutarse en Windows o Linux.
- [ ] Se almacenaron al menos cinco credenciales ficticias.
- [ ] Las contraseñas persistidas no aparecen en texto plano.
- [ ] El equipo puede mostrar directamente la fuente de datos.
- [ ] La contraseña maestra correcta permite recuperar un secreto.
- [ ] Una contraseña maestra incorrecta no permite recuperar el secreto.
- [ ] Los datos sobreviven al cierre y reapertura de la aplicación.
- [ ] Se explicó el método de cifrado elegido.
- [ ] Se incluyeron las evidencias y referencias requeridas.
