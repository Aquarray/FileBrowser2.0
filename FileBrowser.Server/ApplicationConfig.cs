namespace FileBrowser;


public class ApplicationConfig
{
    public required String RootPath {get; set;}

    public int StreamChunkSize {get; set;} = 1024*1024;

    public ApplicationConfig()
    {
        if(RootPath!= null) RootPath = RootPath.TrimEnd('/');
    }
}