using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtaServer.Api.Data;

namespace OtaServer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    protected readonly OtaDbContext Db;
    protected readonly IConfiguration Configuration;

    public BaseApiController(OtaDbContext db, IConfiguration configuration)
    {
        Db = db;
        Configuration = configuration;
    }

    protected async Task<bool> IsAuthorizedAsync()
    {
        if (!Request.Headers.TryGetValue("X-Admin-Password", out var passwordHeader))
        {
            return false;
        }

        string clientPassword = passwordHeader.ToString();

        // Lấy từ database
        var adminPasswordSetting = await Db.SystemSettings
            .FirstOrDefaultAsync(s => s.Key == "AdminPassword");
        
        string dbPassword = adminPasswordSetting?.Value ?? string.Empty;

        if (string.IsNullOrEmpty(dbPassword))
        {
            // Fallback sang appsettings
            dbPassword = Configuration["OtaSettings:AdminPassword"] ?? "09052016";
        }

        return clientPassword == dbPassword;
    }
}
