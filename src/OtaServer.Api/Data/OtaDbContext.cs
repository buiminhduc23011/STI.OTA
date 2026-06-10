using Microsoft.EntityFrameworkCore;
using OtaServer.Api.Models;

namespace OtaServer.Api.Data;

public class OtaDbContext : DbContext
{
    public OtaDbContext(DbContextOptions<OtaDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<AllowedDevice> AllowedDevices { get; set; } = null!;
    public DbSet<AppVersion> AppVersions { get; set; } = null!;
    public DbSet<SystemSetting> SystemSettings { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure unique index for Project Code
        modelBuilder.Entity<Project>()
            .HasIndex(p => p.Code)
            .IsUnique();

        // Configure unique index for Device Name per Project
        modelBuilder.Entity<AllowedDevice>()
            .HasIndex(d => new { d.ProjectId, d.DeviceName })
            .IsUnique();

        // Configure relationships
        modelBuilder.Entity<AllowedDevice>()
            .HasOne(d => d.Project)
            .WithMany(p => p.AllowedDevices)
            .HasForeignKey(d => d.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AppVersion>()
            .HasOne(v => v.Project)
            .WithMany(p => p.AppVersions)
            .HasForeignKey(v => v.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
