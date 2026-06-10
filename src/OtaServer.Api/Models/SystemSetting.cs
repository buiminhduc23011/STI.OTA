using System.ComponentModel.DataAnnotations;

namespace OtaServer.Api.Models;

public class SystemSetting
{
    [Key]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty; // e.g. "BaseUrl", "AdminPassword"
    
    [MaxLength(1000)]
    public string Value { get; set; } = string.Empty;
}
