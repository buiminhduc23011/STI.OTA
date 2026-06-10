using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtaServer.Api.Data;
using OtaServer.Api.Models;

namespace OtaServer.Api.Controllers;

public class VersionsController : BaseApiController
{
    private readonly IWebHostEnvironment _environment;

    public VersionsController(OtaDbContext db, IConfiguration configuration, IWebHostEnvironment environment) 
        : base(db, configuration)
    {
        _environment = environment;
    }

    [HttpGet("/api/projects/{projectId}/apps/{appType}/versions")]
    public async Task<IActionResult> GetVersions(Guid projectId, string appType)
    {
        var projectExists = await Db.Projects.AnyAsync(p => p.Id == projectId);
        if (!projectExists) return NotFound(new { message = "Không tìm thấy dự án." });

        string cleanAppType = appType.Trim().ToLower();

        var versions = await Db.AppVersions
            .Where(v => v.ProjectId == projectId && v.AppType == cleanAppType)
            .OrderByDescending(v => v.VersionCode)
            .ToListAsync();

        return Ok(versions);
    }

    [HttpPost("/api/projects/{projectId}/apps/{appType}/versions")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UploadVersion(
        Guid projectId, 
        string appType,
        [FromForm] IFormFile file,
        [FromForm] string versionName,
        [FromForm] int versionCode,
        [FromForm] string changelog)
    {
        if (!await IsAuthorizedAsync()) return Unauthorized(new { message = "Mật khẩu quản trị không đúng." });

        var project = await Db.Projects.FindAsync(projectId);
        if (project == null) return NotFound(new { message = "Không tìm thấy dự án." });

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Vui lòng chọn tệp tin tải lên." });
        }

        if (string.IsNullOrWhiteSpace(versionName))
        {
            return BadRequest(new { message = "Tên phiên bản không được để trống." });
        }

        if (versionCode <= 0)
        {
            return BadRequest(new { message = "Mã phiên bản (Version Code) phải lớn hơn 0." });
        }

        string cleanAppType = appType.Trim().ToLower();

        // Kiểm tra mã phiên bản trùng lặp trong cùng một appType của project
        bool isVersionCodeExist = await Db.AppVersions
            .AnyAsync(v => v.ProjectId == projectId && v.AppType == cleanAppType && v.VersionCode == versionCode);

        if (isVersionCodeExist)
        {
            return BadRequest(new { message = $"Mã phiên bản {versionCode} đã tồn tại cho ứng dụng này." });
        }

        try
        {
            string webRoot = _environment.WebRootPath;
            if (string.IsNullOrEmpty(webRoot))
            {
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            string relativeFolder = Path.Combine("uploads", "projects", project.Code, cleanAppType);
            string uploadFolder = Path.Combine(webRoot, relativeFolder);

            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            string originalFileName = Path.GetFileName(file.FileName);
            string safeFileName = $"{versionCode}_{originalFileName.Replace(" ", "_")}";
            string physicalPath = Path.Combine(uploadFolder, safeFileName);

            // Ghi đè file nếu đã tồn tại cùng tên vật lý
            using (var stream = new FileStream(physicalPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Lưu đường dẫn tương đối (sẽ tự động ghép host hoặc Domain ở API check update)
            string relativePath = $"/uploads/projects/{project.Code}/{cleanAppType}/{safeFileName}";

            var appVersion = new AppVersion
            {
                ProjectId = projectId,
                AppType = cleanAppType,
                VersionName = versionName.Trim(),
                VersionCode = versionCode,
                Changelog = changelog?.Trim() ?? "Bản cập nhật mới.",
                FileName = originalFileName,
                FilePath = physicalPath,
                DownloadUrl = relativePath,
                IsActive = true
            };

            Db.AppVersions.Add(appVersion);
            await Db.SaveChangesAsync();

            return Ok(appVersion);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi tải file lên máy chủ: {ex.Message}" });
        }
    }

    [HttpPut("/api/versions/{id}/toggle")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        if (!await IsAuthorizedAsync()) return Unauthorized(new { message = "Mật khẩu quản trị không đúng." });

        var version = await Db.AppVersions.FindAsync(id);
        if (version == null) return NotFound(new { message = "Không tìm thấy phiên bản." });

        version.IsActive = !version.IsActive;
        await Db.SaveChangesAsync();

        return Ok(version);
    }

    [HttpDelete("/api/versions/{id}")]
    public async Task<IActionResult> DeleteVersion(Guid id)
    {
        if (!await IsAuthorizedAsync()) return Unauthorized(new { message = "Mật khẩu quản trị không đúng." });

        var version = await Db.AppVersions.FindAsync(id);
        if (version == null) return NotFound(new { message = "Không tìm thấy phiên bản." });

        // Xóa file trên ổ đĩa
        if (System.IO.File.Exists(version.FilePath))
        {
            try
            {
                System.IO.File.Delete(version.FilePath);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi xóa file vật lý: {ex.Message}");
            }
        }

        Db.AppVersions.Remove(version);
        await Db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa phiên bản thành công." });
    }
}
