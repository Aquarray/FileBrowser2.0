using FileBrowser.DTOs;

namespace FileBrowser.Interfaces;

public interface IFolderItemHubClient
{
    Task GetFolderItem(ResultContent FolderItem);
    Task ConnectionCheck(string reply);

    Task StreamMessage(string msg);
}