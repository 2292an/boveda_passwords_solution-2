namespace VaultApi.Models;

public class VaultSettings
{
    public int Id { get; set; }
    public string MasterPasswordHash { get; set; } = string.Empty;
    public string KdfSalt { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
