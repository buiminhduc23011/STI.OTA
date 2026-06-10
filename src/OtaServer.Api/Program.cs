using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using OtaServer.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add DbContext
builder.Services.AddDbContext<OtaDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Auto migration
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<OtaDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Enable CORS
app.UseCors("AllowAll");

// Serve React SPA Static Files from wwwroot
// Thêm MIME types cho file mobile app (.apk, .ipa) vì ASP.NET không có sẵn
var mimeProvider = new FileExtensionContentTypeProvider();
mimeProvider.Mappings[".apk"] = "application/vnd.android.package-archive";
mimeProvider.Mappings[".ipa"] = "application/octet-stream";

app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = mimeProvider,
    ServeUnknownFileTypes = true,  // Fallback: serve bất kỳ file nào nếu không biết MIME
    DefaultContentType = "application/octet-stream"
});

app.UseHttpsRedirection();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Fallback to React index.html for SPA routing
app.MapFallbackToFile("index.html");

app.Run();
