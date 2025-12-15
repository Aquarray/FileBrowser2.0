using FileBrowser.DTOs;
using FileBrowser.Modals;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace FileBrowser.Services;

public class MongoDBService
{

    private readonly IMongoCollection<FolderContent> _Contents;
    public MongoDBService(IOptions<MongoDBSettings> mongodbConfig)
    {
        MongoClient client = new MongoClient(mongodbConfig.Value.ConnectionURI);
        IMongoDatabase database = client.GetDatabase(mongodbConfig.Value.DatabaseName);
        _Contents = database.GetCollection<FolderContent>(mongodbConfig.Value.CollectionName);
    }


    public async Task AddContents(FolderContent folderContent)
    {
        var Item = await GetFolderId(folderContent.FullPath);
        if(Item == ObjectId.Empty) await _Contents.InsertOneAsync(folderContent);
        else
        {
            await _Contents.UpdateOneAsync(
                    Builders<FolderContent>.Filter.Eq(g=>g.Id, Item)
                    ,Builders<FolderContent>.Update.Set("ParentFolder", folderContent.ParentFolder) );
        }
    }

    public async IAsyncEnumerable<FolderContent> GetContents(ObjectId parentID)
    {
        var Folder = await (await _Contents.FindAsync(g=> g.Id == parentID)).SingleOrDefaultAsync();
        var Items = await _Contents.FindAsync(g=> g.ParentFolder == Folder.FullPath);
        await foreach(var item in Items.ToAsyncEnumerable())
        {
            yield return item;
        }
    }

    public async Task<string> GetFilePath(ObjectId fileId)
    {
        var Item = await (await _Contents.FindAsync(Builders<FolderContent>.Filter.Eq(x=>x.Id, fileId)))
            .SingleOrDefaultAsync() ?? throw new NullReferenceException("Can't Find Item with Object Id : " + fileId);
        return Item.FullPath;
    }

    public async Task<FolderContent> GetContentDetails(ObjectId contentID)
    {
        var Item = await (await _Contents.FindAsync(Builders<FolderContent>.Filter.Eq(x=>x.Id, contentID)))
            .SingleOrDefaultAsync() ?? throw new NullReferenceException("Can't Find Item with Object Id : " + contentID);
        return Item;
    }
    public async Task<FolderContent?> GetContentDetailsFromPath(string path)
    {
        var Item = await (await _Contents.FindAsync(Builders<FolderContent>.Filter.Eq(x=>x.FullPath, path)))
            .SingleOrDefaultAsync();
        return Item;
    }

    public async Task<ObjectId> GetFolderId(string path)
    {
        var Folder = await (await _Contents.FindAsync(g=>g.IsFolder && g.FullPath==path)).FirstOrDefaultAsync();
        if(Folder==null) return ObjectId.Empty;
        else return Folder.Id;
    }

    public async Task<bool> HasFolderScanned(ObjectId id)
    {
        var Folder = await GetContentDetails(id);
        var ItemsCount = await _Contents.CountDocumentsAsync(Builders<FolderContent>.Filter.Eq(g=>g.ParentFolder, Folder.FullPath));
        if(Folder.Size == ItemsCount) return true;
        else return false;
    }

    public async Task<ObjectId> GetFfileId(string path)
    {
        var Folder = await (await _Contents.FindAsync(g=>!g.IsFolder && g.FullPath==path)).FirstOrDefaultAsync();
        if(Folder==null) return ObjectId.Empty;
        else return Folder.Id;
    }

    public async Task ClearFolder(string path)
    {
        await _Contents.DeleteManyAsync(Builders<FolderContent>.Filter.Eq(g=>g.ParentFolder, path));
    }

}