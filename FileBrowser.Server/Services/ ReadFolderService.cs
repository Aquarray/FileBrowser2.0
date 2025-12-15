using System.Runtime.CompilerServices;
using FileBrowser.Modals;
using Microsoft.Extensions.Options;
using MongoDB.Bson;

namespace FileBrowser.Services;


public class  ReadFolderService(IOptions<ApplicationConfig> options,MongoDBService mongoService ,ConcurrentCacheDict _MemoryDB)
{

     public async IAsyncEnumerable<FolderContent> ScanFolder(string path,[EnumeratorCancellation] CancellationToken cancellationToken=default)
    {
        if(!path.StartsWith('/')) path= "/"+path;
        var dirInfo = new DirectoryInfo(options.Value.RootPath + path);
        if (!dirInfo.Exists) yield break;
        ObjectId directory = await mongoService.GetFolderId(path);
        if(directory == ObjectId.Empty)
        {
            directory = ObjectId.GenerateNewId();
            var iteself = new FolderContent()
            {
                Id=directory,
                Name = dirInfo.Name,
                IsFolder = true,
                Size = dirInfo.GetFileSystemInfos().Length,
                CreatedAt = dirInfo.CreationTimeUtc,
                MediaType = MediaTypeEnum.FOLDER,
                FullPath= path,
                ParentFolder = ""
            };
            _MemoryDB.DriveMap.TryAdd(directory,iteself);
            await mongoService.AddContents(iteself);
        }
        if(await mongoService.HasFolderScanned(directory))
        {
            await foreach(var item in mongoService.GetContents(directory))
            {
                if(cancellationToken.IsCancellationRequested) yield break;
                yield return item;
            }
            yield break;
        }
        foreach (var item in dirInfo.EnumerateFileSystemInfos())
        {
            if(cancellationToken.IsCancellationRequested) yield break;
            var ItemID = ObjectId.GenerateNewId();
            var content = new FolderContent()
            {
                Id=ItemID,
                Name=item.Name,
                CreatedAt =item.CreationTimeUtc,
                FullPath=path + (path.EndsWith('/') ? "" : "/" )+item.Name,
            };
            if(item is FileInfo file)
            {
                content.IsFolder = false;
                content.Size = file.Length;
                content.MediaType = GetContentType(file.Extension);
                content.ParentFolder = path;
            }else if(item is DirectoryInfo dir)
            {
                content.IsFolder = true;
                content.Size = new DirectoryInfo(dir.FullName).GetFileSystemInfos().Length;//Change with Effcient
                content.MediaType = MediaTypeEnum.FOLDER;
                content.ParentFolder = path;
            }
            _MemoryDB.DriveMap.TryAdd(ItemID, content);
            await mongoService.AddContents(content);
            yield return content;
        }
    }

    public async Task<ObjectId> GetId(string path)
    {
        if(!path.StartsWith("/")) path= "/"+path;
        return await mongoService.GetFolderId(path);
    }

    public async Task<string> GetPath(ObjectId id)
    {
        var item = await mongoService.GetContentDetails(id);
        return item.FullPath;
    }

    public async Task ReScan(string path)
    {
        await mongoService.ClearFolder(path);
    }

    public async Task<FileStream> ReadFile(ObjectId fileId)
    {
        String fullPath = options.Value.RootPath + await mongoService.GetFilePath(fileId);
        var file = new FileStream(fullPath, FileMode.Open, FileAccess.Read ,FileShare.Read, options.Value.StreamChunkSize, FileOptions.Asynchronous);
        return file;
    }

    public async Task<long> GetContentLength(ObjectId id)
    {
        return (await mongoService.GetContentDetails(id)).Size;
    }

    public MediaTypeEnum GetContentType(string ext)
    {
       return ext.Trim().TrimStart('.').ToLowerInvariant() switch
        {
            // Documents
            "txt" or "log" or "md" or "ini" => MediaTypeEnum.TEXT_PLAIN,
            "rtf" => MediaTypeEnum.TEXT_RICH,
            "pdf" => MediaTypeEnum.PDF,
            "doc" or "docx" or "odt" or "pages" => MediaTypeEnum.WORD_DOC,
            "xls" or "xlsx" or "csv" or "ods" or "numbers" => MediaTypeEnum.SPREADSHEET,
            "ppt" or "pptx" or "odp" or "key" => MediaTypeEnum.PRESENTATION,
            "epub" or "mobi" or "azw3" => MediaTypeEnum.EBOOK,

            // Images
            "jpg" or "jpeg" or "png" or "gif" or "bmp" or "webp" or "tiff" or "ico" => MediaTypeEnum.IMAGE,
            "svg" or "ai" or "eps" => MediaTypeEnum.IMAGE_VECTOR,
            "psd" or "psb" => MediaTypeEnum.IMAGE_PHOTOSHOP,
            "cr2" or "nef" or "arw" or "dng" => MediaTypeEnum.IMAGE_RAW,

            // Audio & Video
            "mp3" or "wav" or "aac" or "ogg" or "flac" or "m4a" => MediaTypeEnum.AUDIO,
            "mp4" or "avi" or "mov" or "wmv" or "mkv" or "webm" or "flv" => MediaTypeEnum.VIDEO,
            "srt" or "sub" or "vtt" => MediaTypeEnum.SUBTITLE,

            // Archives
            "zip" or "rar" or "7z" or "tar" or "gz" => MediaTypeEnum.ARCHIVE,
            "iso" or "img" or "dmg" => MediaTypeEnum.DISK_IMAGE,

            // Code
            "html" or "htm" or "css" or "js" or "ts" or "php" => MediaTypeEnum.CODE_WEB,
            "c" or "cpp" or "cs" or "java" or "py" or "go" or "rs" => MediaTypeEnum.CODE_SOURCE,
            "json" or "xml" or "yaml" or "toml" or "config" => MediaTypeEnum.CONFIG,

            // System / Misc
            "exe" or "bat" or "sh" or "app" => MediaTypeEnum.EXECUTABLE,
            "msi" or "apk" or "deb" or "pkg" => MediaTypeEnum.INSTALLER,
            "lnk" or "url" => MediaTypeEnum.SHORTCUT,
            
            // Data & Design
            "sql" or "db" or "sqlite" or "mdb" => MediaTypeEnum.DATABASE,
            "ttf" or "otf" or "woff" or "woff2" => MediaTypeEnum.FONT,
            "obj" or "fbx" or "stl" or "blend" => MediaTypeEnum.MODEL_3D,
            "dwg" or "dxf" => MediaTypeEnum.CAD,

            _ => MediaTypeEnum.UNKNOWN
        };

    }


}