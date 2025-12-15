import { useContext, useState, useRef, useEffect } from "react";
import { CalculateSize, ExpandFileData } from "../App";
import { useAnimate, motion } from "motion/react";
import { ConvertUrlToPath } from "../App";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Folder, HardDrive, CornerUpRight, FileText, FileSpreadsheet, 
  MonitorPlay, BookOpen, Image, Camera, PenTool, Layers, 
  FileAudio, FileVideo, Captions, FileArchive, Disc, 
  FileCode, FileCog, Terminal, Package, Database, 
  Type, Box, DraftingCompass, FileQuestion
} from 'lucide-react';

export const MediaIconMap = {
  FOLDER: Folder,
  DRIVE: HardDrive,
  SHORTCUT: CornerUpRight,

  TEXT_PLAIN: FileText,
  TEXT_RICH: FileText,
  PDF: FileText,
  WORD_DOC: FileText,
  SPREADSHEET: FileSpreadsheet,
  PRESENTATION: MonitorPlay,
  EBOOK: BookOpen,

  IMAGE: Image,
  IMAGE_RAW: Camera,
  IMAGE_VECTOR: PenTool,
  IMAGE_PHOTOSHOP: Layers,

  AUDIO: FileAudio,
  VIDEO: FileVideo,
  SUBTITLE: Captions,

  ARCHIVE: FileArchive,
  DISK_IMAGE: Disc,

  CODE_SOURCE: FileCode,
  CODE_WEB: FileCode,
  CONFIG: FileCog,

  EXECUTABLE: Terminal,
  INSTALLER: Package,

  DATABASE: Database,
  FONT: Type,
  MODEL_3D: Box,
  CAD: DraftingCompass,

  UNKNOWN: FileQuestion
};

export function MediaImg({type, styling}) {
  const IconComp = MediaIconMap[type] || MediaIconMap['UNKNOWN'];
  return <IconComp className={styling}/>
}

export function FolderItem({
  FileName,
  FileSize,
  FileCreationDate,
  FileMediaType,
  IsFolder,
  FileId
}) {
  const [showSize, changeSizeView] = useState(false);
  const [AnimScope, animate] = useAnimate();
  const MainContentRef = useRef(null);
  const ExtrasRef = useRef(null);
  const backdrop = useContext(ExpandFileData);
  const Loc = useLocation();
  const navigate = useNavigate();

  if(IsFolder === false) FileSize = CalculateSize(FileSize);
  else FileSize = FileSize + " Items";

  const showMoreDetailsFunction = async ()=>{
    if(IsFolder){
      const Path = ConvertUrlToPath(Loc.search);
      if(!window.location.href.includes("=")){
        navigate("/?p=" + encodeURIComponent(Path+FileName), {replace:true});
        return;
      }
      navigate("/?p="+encodeURIComponent(Path+(Path.endsWith("/") ? "" : "/"))+FileName, {replace:true});
      return;
    }
    const box = AnimScope.current.getBoundingClientRect();
    backdrop.setPopedItemLoc({x:Math.ceil(box.x), y:Math.ceil(box.y),w:Math.ceil(box.width),h:Math.ceil(box.height), fileId: FileId});
    backdrop.showPopupBack(true);
  };

  const playAnimation = async () => {
    animate(
      MainContentRef.current,
      {
        backgroundColor: "#ffffff",
        boxShadow:
          "0 0 0 1px #b2dfdb,0 25px 50px -12px rgba(0, 0, 0, 0.25),0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        borderRadius: "0.5rem",
      },
      { duration: 0.5, delay:0.05 }
    );
    animate(".FileName", { backgroundColor: '#ffffff'}, { duration: 0.5, delay: 0.05 });
    animate(ExtrasRef.current, {
      y: ["0%", "-100%", "150%", "150%", "0%"],
      opacity: [1, 0, 0, 0, 1]
    }, {
      times: [0, 0.5, 0.51, 0.52, 1],
      duration: 1,
      ease: 'easeInOut'
    });
    setTimeout(() => {
      changeSizeView(true);
    }, 500);
  };

  const resetAnimation = async () => {
    animate(
      MainContentRef.current,
      {
        backgroundColor: "#a8fffb",
        boxShadow: "none",
        borderRadius: "1.5rem",
      },
      { duration: 0.5, delay: 0.05 }
    );
    animate(".FileName", { backgroundColor: '#a8fffb' }, { duration: 0.5, delay: 0.05 });
    animate(ExtrasRef.current, {
      y: ["0%", "-100%", "150%", "150%", "0%"],
      opacity: [1, 0, 0, 0, 1]
    }, {
      times: [0, 0.5, 0.51, 0.52, 1],
      duration: 1,
      ease: 'easeInOut'
    });
    setTimeout(() => {
      changeSizeView(false);
    }, 500);
  };

  return (
    <motion.div
      ref={AnimScope}
      className={`relative group text-[#004d40] flex md:basis-48 w-full md:w-max md:flex-col h-auto cursor-pointer z-10`}
      whileHover={{
        scale: 1.05,
        translateY: "-0.25rem",
        transition: { dur: 0.3 },
      }}
      onTap={showMoreDetailsFunction}
      onHoverStart={playAnimation}
      onHoverEnd={resetAnimation}
      initial={{opacity:0, scale:0,zIndex:10}}
      whileTap={{scale:[1,0.9,1], transition:{duration:[0,0.5,0.5], ease:'easeInOut'}}}
      animate={{opacity:100,scale:1, transition:{duration:1, ease:'easeInOut', type:'spring'}}}
    >
      {IsFolder===true && (
        <>
          <div
            className="absolute top-2 left-2 w-full h-full -z-10
        bg-[#00ffe5] rounded-3xl opacity-60 group-hover:bg-[#00ffe5] group-hover:rounded-lg"
          />
          <div
            className="absolute top-[0.25rem] left-[0.25rem] w-full h-full -z-10
      bg-[#4db6ac] rounded-3xl opacity-60 group-hover:bg-[#27d3c2] group-hover:rounded-lg"
          />
        </>
      )}
      <motion.div
        ref={MainContentRef}
        initial={{borderRadius:'1.5rem'}}
        className="Card-Bg relative z-10 w-full h-full
      flex flex-row md:flex-col
      bg-[#a8fffb] rounded-3xl p-4
      group-hover:ring-1 group-hover:ring-[#b2dfdb]
      shadow-md shadow-[#038a7338]"
      >
        <motion.div className="aspect-square">
          <MediaImg type={FileMediaType} styling={"aspect-square w-full h-full"}/>
        </motion.div>
        <motion.div
        initial={{backgroundColor:'#a8fffb'}}
          className={`FileName z-10 font-extrabold text-wrap mt-2 break-all flex-1 text-xl line-clamp-3 items-center ml-3 md:ml-0 bg-[#a8fffb]`}
        >
          {FileName}
        </motion.div>
        <motion.div
          initial={{translateY:0, opacity:100}}
          ref={ExtrasRef}
          className={`mt-1 text-sm hidden md:inline-block text-center group-hover:mt-0 overflow-hidden h-auto`}
        >
          {showSize ? FileSize : FileMediaType.charAt(0) + FileMediaType.substring(1).toLocaleLowerCase()}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}