using System.ComponentModel.DataAnnotations;

namespace OtaServer.Api.Models;

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string Code { get; set; } = string.Empty; // e.g., "mes-sti", slugified
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty; // e.g., "STI MES System"
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<AllowedDevice> AllowedDevices { get; set; } = new List<AllowedDevice>();
    public ICollection<AppVersion> AppVersions { get; set; } = new List<AppVersion>();
}
