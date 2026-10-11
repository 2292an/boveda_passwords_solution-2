using Microsoft.EntityFrameworkCore;
using VaultApi.Data;
using VaultApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<VaultDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("VaultDb")));
builder.Services.AddScoped<CryptoService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactDev", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("ReactDev");
app.MapControllers();
app.Run();
