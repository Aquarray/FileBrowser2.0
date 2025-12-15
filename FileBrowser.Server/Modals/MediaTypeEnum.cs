using System.Text.Json.Serialization;

namespace FileBrowser.Modals;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MediaTypeEnum
{
    FOLDER,
    DRIVE,
    SHORTCUT,
    TEXT_PLAIN,
    TEXT_RICH,
    PDF,
    WORD_DOC,
    SPREADSHEET,
    PRESENTATION,
    EBOOK,
    IMAGE,
    IMAGE_RAW,
    IMAGE_VECTOR,
    IMAGE_PHOTOSHOP,
    AUDIO,
    VIDEO,
    SUBTITLE,
    ARCHIVE,
    DISK_IMAGE,
    CODE_SOURCE,
    CODE_WEB,
    CONFIG,
    EXECUTABLE,
    INSTALLER,
    DATABASE,
    FONT,
    MODEL_3D,
    CAD,
    UNKNOWN
}
