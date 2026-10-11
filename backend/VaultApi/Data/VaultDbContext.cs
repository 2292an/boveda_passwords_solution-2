using Microsoft.EntityFrameworkCore;
using VaultApi.Models;

namespace VaultApi.Data;

public class VaultDbContext(DbContextOptions<VaultDbContext> options) : DbContext(options)
{
    public DbSet<Credential> Credentials => Set<Credential>();
    public DbSet<VaultSettings> VaultSettings => Set<VaultSettings>();
}
