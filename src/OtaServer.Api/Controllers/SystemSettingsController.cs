using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtaServer.Api.Data;
using OtaServer.Api.Models;

namespace OtaServer.Api.Controllers;

public class SystemSettingsController : BaseApiController
{
    public SystemSettingsController(OtaDbContext db, IConfiguration configuration) : base(db, configuration)
    {
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var baseUrlSetting = await Db.SystemSettings.FirstOrDefaultAsync(s => s.Key == "BaseUrl");
        var adminPasswordSetting = await Db.SystemSettings.FirstOrDefaultAsync(s => s.Key == "AdminPassword");

        string baseUrl = baseUrlSetting?.Value ?? Configuration["OtaSettings:BaseUrl"] ?? "http://localhost:5000";
        string adminPassword = adminPasswordSetting?.Value ?? Configuration["OtaSettings:AdminPassword"] ?? "09052016";

        return Ok(new
        {
            BaseUrl = baseUrl,
            AdminPassword = adminPassword
        });
    }

    [HttpPost]
    public async Task<IActionResult> SaveSettings([FromBody] SettingsDto dto)
    {
        if (!await IsAuthorizedAsync()) return Unauthorized(new { message = "Mật khẩu quản trị không đúng." });

        bool hasChanges = false;

        if (!string.IsNullOrWhiteSpace(dto.BaseUrl))
        {
            var baseUrlSetting = await Db.SystemSettings.FirstOrDefaultAsync(s => s.Key == "BaseUrl");
            if (baseUrlSetting == null)
            {
                baseUrlSetting = new SystemSetting { Key = "BaseUrl", Value = dto.BaseUrl.Trim() };
                Db.SystemSettings.Add(baseUrlSetting);
            }
            else
            {
                baseUrlSetting.Value = dto.BaseUrl.Trim();
            }
            hasChanges = true;
        }

        if (!string.IsNullOrWhiteSpace(dto.AdminPassword))
        {
            var adminPasswordSetting = await Db.SystemSettings.FirstOrDefaultAsync(s => s.Key == "AdminPassword");
            if (adminPasswordSetting == null)
            {
                adminPasswordSetting = new SystemSetting { Key = "AdminPassword", Value = dto.AdminPassword.Trim() };
                Db.SystemSettings.Add(adminPasswordSetting);
            }
            else
            {
                adminPasswordSetting.Value = dto.AdminPassword.Trim();
            }
            hasChanges = true;
        }

        if (hasChanges)
        {
            await Db.SaveChangesAsync();
        }
        
        return Ok(new { message = "Cập nhật cấu hình thành công!" });
    }
}

public class SettingsDto
{
    public string? BaseUrl { get; set; }
    public string? AdminPassword { get; set; }
}
