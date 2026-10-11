using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using VaultApi.Data;
using VaultApi.DTOs;
using VaultApi.Models;
using VaultApi.Services;

namespace VaultApi.Controllers;

[ApiController]
[Route("api/credentials")]
public class CredentialsController(VaultDbContext db, CryptoService crypto) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CredentialListItem>>> GetAll()
    {
        var items = await db.Credentials
            .AsNoTracking()
            .OrderByDescending(c => c.Id)
            .Select(c => new CredentialListItem(c.Id, c.Service, c.Username, c.CreatedAtUtc))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCredentialRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Service) ||
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Servicio, usuario y contraseña son obligatorios." });

        var settings = await db.VaultSettings.SingleOrDefaultAsync(v => v.Id == 1);
        if (settings is null)
            return BadRequest(new { message = "Primero configure la contraseña maestra." });

        if (!BCrypt.Net.BCrypt.Verify(request.MasterPassword, settings.MasterPasswordHash))
            return Unauthorized(new { message = "Contraseña maestra incorrecta." });

        var encrypted = crypto.Encrypt(request.Password, request.MasterPassword, settings.KdfSalt);

        var credential = new Credential
        {
            Service = request.Service.Trim(),
            Username = request.Username.Trim(),
            CipherText = encrypted.CipherText,
            Nonce = encrypted.Nonce,
            AuthTag = encrypted.AuthTag,
            CreatedAtUtc = DateTime.UtcNow
        };

        db.Credentials.Add(credential);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = credential.Id }, new { credential.Id });
    }

    [HttpPost("{id:int}/reveal")]
    public async Task<IActionResult> Reveal(int id, [FromBody] MasterPasswordRequest request)
    {
        var settings = await db.VaultSettings.SingleOrDefaultAsync(v => v.Id == 1);
        if (settings is null)
            return BadRequest(new { message = "La bóveda no está configurada." });

        if (!BCrypt.Net.BCrypt.Verify(request.MasterPassword, settings.MasterPasswordHash))
            return Unauthorized(new { message = "Contraseña maestra incorrecta." });

        var credential = await db.Credentials.FindAsync(id);
        if (credential is null)
            return NotFound(new { message = "Credencial no encontrada." });

        try
        {
            var plaintext = crypto.Decrypt(
                credential.CipherText,
                credential.Nonce,
                credential.AuthTag,
                request.MasterPassword,
                settings.KdfSalt
            );

            return Ok(new RevealResponse(plaintext));
        }
        catch (CryptographicException)
        {
            return Unauthorized(new { message = "No fue posible descifrar el secreto." });
        }
    }
}
