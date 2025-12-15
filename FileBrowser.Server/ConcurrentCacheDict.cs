namespace FileBrowser;

using FileBrowser.Modals;
using MongoDB.Bson;
using System.Collections.Concurrent;


public class ConcurrentCacheDict
{
    public ConcurrentDictionary<ObjectId, FolderContent> DriveMap = new();

}