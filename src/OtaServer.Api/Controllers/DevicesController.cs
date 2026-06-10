using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtaServer.Api.Data;
using OtaServer.Api.Models;

namespace OtaServer.Api.Controllers;

public class DevicesController : BaseApiController
{
    public DevicesController(OtaDbContext db, IConfiguration configuration) : base(db, configuration)
    {
    }

    [HttpGet("/api/projects/{projectId}/devices")]
    public async Task<IActionResult> GetDevicesByProject(Guid projectId)
    {
        var projectExists = await Db.Projects.AnyAsync(p => p.Id == projectId);
        if (!projectExists) return NotFound(new { message = "Không tìm thấy dự án." });

        var devices = await Db.AllowedDevices
            .Where(d => d.ProjectId == projectId)
            .OrderBy(d => d.DeviceName)
            .ToListAsync();

        return Ok(devices);
    }

    [HttpPost("/api/projects/{projectId}/devices")]
    public async Task<IActionResult> AddDevice(Guid projectId, [FromBody] DeviceDto dto)
    {
        if (!await IsAuthorizedAsync()) return Unauthorized(new { message = "Mật khẩu quản trị không đúng." });

        var project = await Db.Projects.FindAsync(projectId);
        if (project == null) return NotFound(new { message = "Không tìm thấy dự án." });

        if (string.IsNullOrWhiteSpace(dto.DeviceName))
        {
            return BadRequest(new { message = "Tên thiết bị không được để trống." });
        }

        string safeDeviceName = dto.DeviceName.Trim().ToLower();

        if (await Db.AllowedDevices.AnyAsync(d => d.ProjectId == projectId && d.DeviceName == safeDeviceName))
        {
            return BadRequest(new { message = $"Thiết bị '{dto.DeviceName}' đã được thêm vào dự án." });
        }

        var device = new AllowedDevice
        {
            ProjectId = projectId,
            DeviceName = safeDeviceName,
            IsActive = true
        };

        Db.AllowedDevices.Add(device);
        await Db.SaveChangesAsync();

        return Ok(device);
    }

    [HttpPut("/api/devices/{id}/toggle")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        if (!await IsAuthorizedAsync()) return Unauthorized(new { message = "Mật khẩu quản trị không đúng." });

        var device = await Db.AllowedDevices.FindAsync(id);
        if (device == null) return NotFound(new { message = "Không tìm thấy thiết bị." });

        device.IsActive = !device.IsActive;
        await Db.SaveChangesAsync();

        return Ok(device);
    }

    [HttpDelete("/api/devices/{id}")]
    public async Task<IActionResult> DeleteDevice(Guid id)
    {
        if (!await IsAuthorizedAsync()) return Unauthorized(new { message = "Mật khẩu quản trị không đúng." });

        var device = await Db.AllowedDevices.FindAsync(id);
        if (device == null) return NotFound(new { message = "Không tìm thấy thiết bị." });

        Db.AllowedDevices.Remove(device);
        await Db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa thiết bị thành công." });
    }
}

public class DeviceDto
{
    public string DeviceName { get; set; } = string.Empty;
}
