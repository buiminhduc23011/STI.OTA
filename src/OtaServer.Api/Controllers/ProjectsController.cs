using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtaServer.Api.Data;
using OtaServer.Api.Models;
using System.Text.RegularExpressions;

namespace OtaServer.Api.Controllers;

public class ProjectsController : BaseApiController
{
    public ProjectsController(OtaDbContext db, IConfiguration configuration) : base(db, configuration)
    {
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await Db.Projects
            .Select(p => new
            {
                p.Id,
                p.Code,
                p.Name,
                p.CreatedAt,
                DevicesCount = p.AllowedDevices.Count,
                VersionsCount = p.AppVersions.Count
            })
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var project = await Db.Projects
            .Include(p => p.AllowedDevices)
            .Include(p => p.AppVersions)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound(new { message = "Không tìm thấy dự án." });
        }

        return Ok(new
        {
            project.Id,
            project.Code,
            project.Name,
            project.CreatedAt,
            AllowedDevices = project.AllowedDevices.Select(d => new { d.Id, d.DeviceName, d.IsActive, d.LastCheckedAt }),
            AppVersions = project.AppVersions.Select(v => new
            {
                v.Id,
                v.AppType,
                v.VersionName,
                v.VersionCode,
                v.Changelog,
                v.FileName,
                v.DownloadUrl,
                v.IsActive,
                v.UploadedAt
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProjectDto dto)
    {
        if (!await IsAuthorizedAsync()) return Unauthorized(new { message = "Mật khẩu quản trị không đúng." });

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Tên dự án không được để trống." });
        }

        string code = string.IsNullOrWhiteSpace(dto.Code) 
            ? dto.Name : dto.Code;

        // Định dạng slug code: viết thường, không dấu/ký tự đặc biệt trừ gạch ngang và gạch dưới
        string safeCode = Regex.Replace(code.Trim().ToLower(), @"[^a-z0-9-_]", "-");
        safeCode = Regex.Replace(safeCode, @"-+", "-").Trim('-');

        if (await Db.Projects.AnyAsync(p => p.Code == safeCode))
        {
            return BadRequest(new { message = $"Mã dự án '{safeCode}' đã tồn tại." });
        }

        var project = new Project
        {
            Code = safeCode,
            Name = dto.Name.Trim()
        };

        Db.Projects.Add(project);
        await Db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProjectDto dto)
    {
        if (!await IsAuthorizedAsync()) return Unauthorized(new { message = "Mật khẩu quản trị không đúng." });

        var project = await Db.Projects.FindAsync(id);
        if (project == null) return NotFound(new { message = "Không tìm thấy dự án." });

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Tên dự án không được để trống." });
        }

        project.Name = dto.Name.Trim();
        await Db.SaveChangesAsync();

        return Ok(project);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!await IsAuthorizedAsync()) return Unauthorized(new { message = "Mật khẩu quản trị không đúng." });

        var project = await Db.Projects
            .Include(p => p.AppVersions)
            .FirstOrDefaultAsync(p => p.Id == id);
            
        if (project == null) return NotFound(new { message = "Không tìm thấy dự án." });

        // Xóa các file vật lý trên đĩa
        foreach (var version in project.AppVersions)
        {
            if (System.IO.File.Exists(version.FilePath))
            {
                try
                {
                    System.IO.File.Delete(version.FilePath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Lỗi khi xóa file {version.FilePath}: {ex.Message}");
                }
            }
        }

        Db.Projects.Remove(project);
        await Db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa dự án thành công." });
    }
}

public class ProjectDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
