using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FileBrowser.Modals;


public class FolderContent()
{
    [BsonId]
    public ObjectId Id {get; set;}
    public String Name {get; set;} = String.Empty;
    public bool IsFolder {get; set;}
    public long Size {get; set;}
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt {get; set;}
    public MediaTypeEnum MediaType {get; set;}
    public String FullPath {get; set;} = String.Empty;
    public string ParentFolder {get; set;} = String.Empty;
}