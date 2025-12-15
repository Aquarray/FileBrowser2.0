using FileBrowser.Modals;

namespace FileBrowser.DTOs;

public class ResultContent
{
    public required string Id {get; set;}
    public required string Name {get; set;}
    public required bool IsFolder {get; set;}
    public required long Size {get; set;}
    public required DateTime CreatedAt {get; set;}
    public MediaTypeEnum? MediaType {get; set;}
}