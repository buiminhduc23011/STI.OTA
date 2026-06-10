using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtaServer.Api.Data;

namespace OtaServer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OtaController : ControllerBase
{
    private readonly OtaDbContext _db;
    private readonly IConfiguration _configuration;

    public OtaController(OtaDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    [HttpGet("check")]
    public async Task<IActionResult> CheckUpdate(
        [FromQuery] string project, 
        [FromQuery] string? device, 
        [FromQuery] string app, 
        [FromQuery] string? version)
    {
        if (string.IsNullOrWhiteSpace(project) || string.IsNullOrWhiteSpace(app))
        {
            return BadRequest(new { success = false, message = "Thiếu tham số project hoặc app." });
        }

        string cleanProject = project.Trim().ToLower();
        string cleanApp = app.Trim().ToLower();

        // 1. Kiểm tra dự án
        var proj = await _db.Projects
            .Include(p => p.AllowedDevices)
            .FirstOrDefaultAsync(p => p.Code == cleanProject);

        if (proj == null)
        {
            return NotFound(new { success = false, message = $"Không tìm thấy dự án '{project}'." });
        }

        // 2. Cập nhật LastCheckedAt nếu thiết bị được truyền lên và tồn tại
        if (!string.IsNullOrWhiteSpace(device))
        {
            string cleanDevice = device.Trim().ToLower();
            var allowedDevice = proj.AllowedDevices
                .FirstOrDefault(d => d.DeviceName == cleanDevice);

            if (allowedDevice != null)
            {
                allowedDevice.LastCheckedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        // 3. Lấy phiên bản active mới nhất của loại app này
        var latestVersion = await _db.AppVersions
            .Where(v => v.ProjectId == proj.Id && v.AppType == cleanApp && v.IsActive)
            .OrderByDescending(v => v.VersionCode)
            .FirstOrDefaultAsync();

        if (latestVersion == null)
        {
            return Ok(new
            {
                success = true,
                updateAvailable = false,
                message = "Chưa có phiên bản nào được kích hoạt cho loại ứng dụng này."
            });
        }

        int clientVersionCode = 0;
        bool shouldCompare = true;

        if (string.IsNullOrWhiteSpace(version) || version.Trim().ToLower() == "latest")
        {
            shouldCompare = false;
        }
        else if (int.TryParse(version, out int parsed))
        {
            clientVersionCode = parsed;
        }

        if (!shouldCompare || latestVersion.VersionCode > clientVersionCode)
        {
            // Xây dựng download URL: ưu tiên đọc từ OtaSettings:BaseUrl trong appsettings.json
            string baseUrl = _configuration["OtaSettings:BaseUrl"] ?? "";
            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                string scheme = Request.Headers["X-Forwarded-Proto"].FirstOrDefault() ?? Request.Scheme;
                string host = Request.Headers["X-Forwarded-Host"].FirstOrDefault() ?? Request.Host.ToString();
                baseUrl = $"{scheme}://{host}".TrimEnd('/');
            }
            else
            {
                baseUrl = baseUrl.TrimEnd('/');
            }
            
            string relativePath = latestVersion.DownloadUrl.StartsWith('/') ? latestVersion.DownloadUrl : "/" + latestVersion.DownloadUrl;
            string downloadUrl = baseUrl + relativePath;

            return Ok(new
            {
                success = true,
                updateAvailable = true,
                versionCode = latestVersion.VersionCode,
                versionName = latestVersion.VersionName,
                changelog = latestVersion.Changelog,
                downloadUrl = downloadUrl,
                uploadedAt = latestVersion.UploadedAt
            });
        }

        return Ok(new
        {
            success = true,
            updateAvailable = false,
            message = "Ứng dụng đang ở phiên bản mới nhất."
        });
    }
}
