using System.ComponentModel.DataAnnotations;

namespace OtaServer.Api.Models;

public class AllowedDevice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ProjectId { get; set; }
    
    [Required]
    [MaxLength(150)]
    public string DeviceName { get; set; } = string.Empty; // e.g., "agv-01"
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastCheckedAt { get; set; }

    // Navigation properties
    public Project? Project { get; set; }
}
