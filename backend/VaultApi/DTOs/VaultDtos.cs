namespace VaultApi.DTOs;

public record SetupRequest(string MasterPassword);
public record MasterPasswordRequest(string MasterPassword);
public record CreateCredentialRequest(
    string Service,
    string Username,
    string Password,
    string MasterPassword
);
public record CredentialListItem(int Id, string Service, string Username, DateTime CreatedAtUtc);
public record RevealResponse(string Password);
