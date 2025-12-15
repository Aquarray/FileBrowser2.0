using System.Net;
using FileBrowser.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace FileBrowser.Controllers;

[ApiController]
[Route("/api/[controller]")]

public class streamController(ILogger<streamController> logger, ReadFolderService readFolderService) : Controller
{
    private readonly ILogger<streamController> _logger = logger;

    [HttpGet("{id}")]
    public async Task<ActionResult> Get(string id)
    {
        return File(await readFolderService.ReadFile(ObjectId.Parse(id)), "application/octet-stream", enableRangeProcessing:true);
    }
}