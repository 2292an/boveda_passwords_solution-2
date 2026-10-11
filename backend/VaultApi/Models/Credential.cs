namespace VaultApi.Models;

public class Credential
{
    public int Id { get; set; }
    public string Service { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string CipherText { get; set; } = string.Empty;
    public string Nonce { get; set; } = string.Empty;
    public string AuthTag { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
