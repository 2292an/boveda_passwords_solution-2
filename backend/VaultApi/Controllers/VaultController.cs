using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultApi.Data;
using VaultApi.DTOs;
using VaultApi.Models;
using VaultApi.Services;

namespace VaultApi.Controllers;

[ApiController]
[Route("api/vault")]
public class VaultController(VaultDbContext db, CryptoService crypto) : ControllerBase
{
    [HttpGet("status")]
    public async Task<IActionResult> Status()
    {
        var configured = await db.VaultSettings.AnyAsync(v => v.Id == 1);
        return Ok(new { configured });
    }

    [HttpPost("setup")]
    public async Task<IActionResult> Setup([FromBody] SetupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.MasterPassword) || request.MasterPassword.Length < 10)
            return BadRequest(new { message = "La contraseña maestra debe tener al menos 10 caracteres." });

        if (await db.VaultSettings.AnyAsync())
            return Conflict(new { message = "La bóveda ya fue configurada." });

        var settings = new VaultSettings
        {
            Id = 1,
            MasterPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.MasterPassword, workFactor: 12),
            KdfSalt = crypto.GenerateSaltBase64(),
            CreatedAtUtc = DateTime.UtcNow
        };

        db.VaultSettings.Add(settings);
        await db.SaveChangesAsync();
        return Ok(new { message = "Bóveda configurada correctamente." });
    }
}
