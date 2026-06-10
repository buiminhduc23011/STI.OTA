using System.ComponentModel.DataAnnotations;

namespace OtaServer.Api.Models;

public class AppVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ProjectId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string AppType { get; set; } = string.Empty; // android, windows, iot, agv, etc.
    
    [Required]
    [MaxLength(100)]
    public string VersionName { get; set; } = string.Empty; // e.g., "1.0.2"
    
    public int VersionCode { get; set; } // e.g., 102
    
    public string Changelog { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty; // original file name e.g., "mes-release.apk"
    
    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty; // physical local path on server
    
    [Required]
    [MaxLength(500)]
    public string DownloadUrl { get; set; } = string.Empty; // generated/saved download link
    
    public bool IsActive { get; set; } = true;
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Project? Project { get; set; }
}
