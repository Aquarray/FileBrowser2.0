using FileBrowser;
using FileBrowser.DTOs;
using FileBrowser.Hubs;
using FileBrowser.Services;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<MongoDBService>();
builder.Services.AddSingleton<ConcurrentCacheDict>();
builder.Services.Configure<ApplicationConfig>(builder.Configuration.GetSection("Configs"));
builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDB"));
builder.Services.AddSingleton<ReadFolderService>();
builder.Services.AddSignalR().AddJsonProtocol();
builder.Services.AddSingleton<FolderItemHub>();

builder.Services.AddCors(opt => opt.AddPolicy("Cors", builder =>
    {
      builder
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
        .WithOrigins("http://localhost:8080"); //SignalR Web Client Url
    }));


var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("Cors");//Remove In Future

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");
app.MapHub<FolderItemHub>("/details");

app.Run();
