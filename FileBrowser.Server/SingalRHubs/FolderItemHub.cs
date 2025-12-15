using FileBrowser.Interfaces;
using FileBrowser.Services;
using Microsoft.AspNetCore.SignalR;

namespace FileBrowser.Hubs;

public class FolderItemHub (ReadFolderService readFolderService): Hub<IFolderItemHubClient>
{
    public async Task GetFolderItems(string path)
    {
        if(!path.StartsWith("/")) path= "/"+path;
        var folderConetent =  readFolderService.ScanFolder(path);
        await Clients.Client(Context.ConnectionId).StreamMessage("start");
        await foreach (var item in folderConetent)
        {
            await Clients.Client(Context.ConnectionId).GetFolderItem(new DTOs.ResultContent()
            {
                Id=item.Id.ToString(),
                IsFolder=item.IsFolder,
                Name=item.Name,
                Size=item.Size,
                CreatedAt=item.CreatedAt,
                MediaType=item.MediaType
            });
        }
        await Clients.Client(Context.ConnectionId).StreamMessage("stop");
    }

    public async Task Test()
    {
        await Clients.Client(Context.ConnectionId).ConnectionCheck($"Hey! {Context.ConnectionId}");
    }

    public async Task RescanFolder(string path)
    {
        await readFolderService.ReScan(path);
        await GetFolderItems(path);
    }

}