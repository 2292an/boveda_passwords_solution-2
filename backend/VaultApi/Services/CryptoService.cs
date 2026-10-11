using System.Security.Cryptography;
using System.Text;

namespace VaultApi.Services;

public sealed class CryptoService
{
    private const int KeySize = 32;       // 256 bits
    private const int NonceSize = 12;     // recommended for GCM
    private const int TagSize = 16;       // 128-bit authentication tag
    private const int Pbkdf2Iterations = 600_000;

    public string GenerateSaltBase64()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
    }

    public (string CipherText, string Nonce, string AuthTag) Encrypt(
        string plaintext,
        string masterPassword,
        string saltBase64)
    {
        var key = DeriveKey(masterPassword, saltBase64);
        var nonce = RandomNumberGenerator.GetBytes(NonceSize);
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var cipherBytes = new byte[plaintextBytes.Length];
        var tag = new byte[TagSize];

        using var aes = new AesGcm(key, TagSize);
        aes.Encrypt(nonce, plaintextBytes, cipherBytes, tag);
        CryptographicOperations.ZeroMemory(key);

        return (
            Convert.ToBase64String(cipherBytes),
            Convert.ToBase64String(nonce),
            Convert.ToBase64String(tag)
        );
    }

    public string Decrypt(
        string cipherTextBase64,
        string nonceBase64,
        string tagBase64,
        string masterPassword,
        string saltBase64)
    {
        var key = DeriveKey(masterPassword, saltBase64);
        var cipherBytes = Convert.FromBase64String(cipherTextBase64);
        var nonce = Convert.FromBase64String(nonceBase64);
        var tag = Convert.FromBase64String(tagBase64);
        var plaintextBytes = new byte[cipherBytes.Length];

        using var aes = new AesGcm(key, TagSize);
        aes.Decrypt(nonce, cipherBytes, tag, plaintextBytes);
        CryptographicOperations.ZeroMemory(key);

        return Encoding.UTF8.GetString(plaintextBytes);
    }

    private static byte[] DeriveKey(string masterPassword, string saltBase64)
    {
        return Rfc2898DeriveBytes.Pbkdf2(
            masterPassword,
            Convert.FromBase64String(saltBase64),
            Pbkdf2Iterations,
            HashAlgorithmName.SHA256,
            KeySize
        );
    }
}
