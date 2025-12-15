import { Suspense, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimate } from "motion/react";
import "./App.css";
import { useLocation, useNavigate } from "react-router-dom";
import { createContext } from "react";
import { FolderItem } from "./Componenets/FileItemCard";
import { SignalRContext } from "./main";
import { RefreshCw } from "lucide-react";
import { MediaImg } from "./Componenets/FileItemCard";
import { Download } from "lucide-react";

export const ExpandFileData = createContext(null);

export function ConvertUrlToPath(url) {
  const Path = new URLSearchParams(url);
  let dir;
  if (Path.has("p")) {
    dir = decodeURIComponent(Path.get("p"));
  } else dir = "/";
  if (!dir.startsWith("/")) dir = "/" + dir;
  return dir;
}

function BreadCrumbs() {
  // const Path = useContext(CurrentDirectory);
  const navigate = useNavigate();
  const Path = useLocation();

  const ConvertToLinks = useMemo(() => {
    const Links = [{ name: "/", href: "%2F" }];
    const folders = ConvertUrlToPath(Path.search).split("/");
    let lastFolder = "";
    folders.forEach((x) => {
      if (x != "") {
        lastFolder += "/" + x;
        Links.push({ name: x, href: lastFolder });
      }
    });
    return Links;
  }, [Path]);
  return (
    <div className="text-xl text-white font-semibold w-full overflow-x-auto">
      {ConvertToLinks.map((x, i, arr) => {
        const isLast = i === arr.length - 1;
        return (
          <div key={i} className="overflow-hidden inline-block ml-2">
            <motion.div
              initial={{ x: isLast ? "-100%" : "0%" }}
              animate={{ x: "0%", transition: { duration: isLast ? 0.3 : 0 } }}
              className="hover:underline inline-block cursor-pointer"
              onClick={() => {
                navigate("/?p=" + encodeURIComponent(x.href), {
                  replace: true,
                });
              }}
            >
              {x.name}
            </motion.div>
            {!isLast && <span className="ml-2">{">"}</span>}
          </div>
        );
      })}
    </div>
  );
}

function SearchBar() {
  return (
    <div>
      <input
        className="bg-[#d3e4ff] rounded-md p-0.5 pl-2 text-black mt-3 md:mt-0 w-full md:w-auto"
        placeholder="Search"
      />
    </div>
  );
}

function ReloadButton(props) {
  const signalR = useContext(SignalRContext);
  const loc = useLocation();
  const rescan = () => {
    signalR.connection.invoke("RescanFolder", ConvertUrlToPath(loc.search));
  };
  return (
    <motion.button
      className="p-1 justify-center rounded-lg mt-auto mb-auto rotate-360"
      onClick={rescan}
      initial={{rotate:"0deg"}}
      whileHover={{rotate:"45deg", transition:{dur:1, type:"spring"}}}
      whileTap={{rotate:"720deg", transition:{duration:1}}}
    >
      <RefreshCw strokeWidth={2.75} className="h-min" />
    </motion.button>
  );
}

function CalculateIdealPosition({ x, y, w, h }) {
  const margin = 16;
  const window_w = window.innerWidth;
  const window_h = window.innerHeight;
  const finalwidth = Math.min(w * 2, window_w - margin * 2);
  const finalheight = Math.min(h * 1.3, window_h - margin * 2);
  let finalx = x;
  let finaly = y;
  if (x + finalwidth > window_w - margin)
    finalx = window_w - finalwidth - margin;
  if (finalx < margin) finalx = margin;

  if (y + finalheight > window_h - margin)
    finaly = window_h - finalheight - margin;
  if (finaly < margin) finaly = margin;
  return { x: finalx, y: finaly };
}

export function CalculateSize(bytes) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = 2 < 0 ? 0 : 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function FastDownload(props) {
  const signalR = useContext(SignalRContext);
  const progress = useRef(0);
  const [ButtonScope, animate] = useAnimate();

  const calculateProgress = (chunkId, MaxChunkSize) => {
    return (chunkId + 1 / Math.ceil(props.file.size / MaxChunkSize)) * 100;
  };

  const logProgress = async () => {
    console.log("Progress: ", progress.current);
  };

  const startDonwload = async () => {};

  return (
    <motion.button
      ref={ButtonScope}
      initial={{
        background:
          "linear-gradient(to right, #038a73 0%, #038a73 50%, #E0E0E0 50%, #E0E0E0 100%)",
        backgroundSize: "200% 100%",
        backgroundPosition: "0% 0",
      }}
      onClick={(e) => {
        e.stopPropagation();
        startDonwload();
      }}
      className="basis-1/2 text-white p-2 m-2 rounded-lg w-full shadow-md"
    >
      Fast Download
    </motion.button>
  );
}

function DirectDownload(props) {
  const [ButtonScope, animate] = useAnimate();
  const startDonwload = async () => {
    var a = document.createElement("a");
    a.href = "/api/stream/" + props.id;
    a.download = props.fileName;
    a.click();
  };
  return (
    <motion.button
      ref={ButtonScope}
      initial={{
        background:
          "linear-gradient(to right, #038a73 0%, #038a73 50%, #E0E0E0 50%, #E0E0E0 100%)",
        backgroundSize: "200% 100%",
        backgroundPosition: "0% 0",
      }}
      onClick={(e) => {
        e.stopPropagation();
        startDonwload();
      }}
      className=" text-white p-2 m-2 rounded-lg w-full shadow-md flex flex-row gap-2 justify-center"
    >
      <Download className="mt-auto mb-auto" size={"1em"} />
      Direct Download
    </motion.button>
  );
}

function ContentWaiting(props) {
  return (
    <div className="w-full h-full justify-center flex items-center">
      <motion.div
        initial={{borderRadius:'50%', opacity:"0%", width:0, height:0}}
        animate={{borderRadius:['50%', null, '1.5rem','1rem','1.5rem',null,null ,'50%',null]
            , opacity:["100%",null,null,null,null,null,null,null,null]
            , width:["1rem","5rem", null ,"15rem",null,"20rem","10rem",null,"0%"]
            , height:["1rem","5rem", null ,"20rem",null,"15rem","10rem",null,"0%"]
            , rotate:[null,"360deg","360deg", null,null, null, "720deg",null,null]
            , transition:{times:[0,0.2,0.25,0.4,0.55,0.65,0.7,0.75,0.8,1], duration:5,ease:"easeInOut" , repeat: Infinity, repeatDelay:0.2}}}
        className="bg-[#52f7ef]">
      </motion.div>
    </div>
  );
}

function EmptyFolder(params) {
  return (
    <div className="w-full h-full flex justify-center items-center text-black flex-col">
      <img src="/emptyFolderByVecteezy.jpg" className="max-h-[20vh] mb-5"/>
      Nothing is here...
    </div>
  );
}

function App() {
  const signalR = useContext(SignalRContext);
  const Path = useLocation();
  const FileItemCache = useRef([]);
  const [FileItem, setFileItem] = useState([]);
  const [PopUpBack, showPopupBack] = useState(false);
  const [PopedItemLocation, setPopedItemLoc] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    fileId: null,
  });
  const [PopupItem, animatePopUpItem] = useAnimate();
  const [isFolderEmpty, setFolderEmpty] = useState(false);

  
  useEffect(() => {
    if (FileItemCache.current.length % 10 == 0) {
      setFileItem((p) => [...p, ...FileItemCache.current]);
    }
  }, [FileItemCache.current]);

  useEffect(() => {
    // const tid = setInterval(() => {
    //   if (currentIndex < folderItems.length) {
    //     changeFileslist((prev) => [...prev, folderItems[currentIndex]]);
    //     setCurrentIndex((p) => p + 1);
    //   }
    // }, 100);
    // return () => {
    //   clearInterval(tid);
    // };
    const fetchData = async () => {
      if (signalR.connection != null) {
        signalR.connection.off("GetFolderItem");
        signalR.connection.off("StreamMessage");
        signalR.connection.on("GetFolderItem", (data) => {
          FileItemCache.current.push(data);
          // changeFileslist((prev) => [...prev, data]);
        });
        signalR.connection.on("StreamMessage", (data) => {
          if (data == "start") {
            setFileItem([]);
            FileItemCache.current = [];
          } else if (data == "stop") {
            // changeFileslist((prev)=> prev.sort((a,b)=> {
            //   if((a.isFolder && b.isFolder)||(!a.isFolder && !b.isFolder)){
            //     a.name.localeCompare(b.name);
            //   }
            //   else if(!b.isFolder) return -1;
            //   else if(!a.isFolder) return 1;
            // }))
            if(FileItemCache.current.length == 0){
              setFolderEmpty(true);
            }else{
              setFolderEmpty(false);
              FileItemCache.current.sort((a, b) => {
                if ((a.isFolder && b.isFolder) || (!a.isFolder && !b.isFolder)) {
                  return a.name.localeCompare(b.name);
                } else if (!b.isFolder) return -1;
                else if (!a.isFolder) return 1;
              });
              setFileItem((p) => [...p, ...FileItemCache.current]);
            }
          }
        });
        await signalR.connection.invoke(
          "GetFolderItems",
          ConvertUrlToPath(Path.search)
        );
      }
    };
    fetchData();
  }, [signalR.connection, Path]);
  const RemovePopUp = () => {
    animatePopUpItem(
      PopupItem.current,
      {
        width: PopedItemLocation.w,
        height: PopedItemLocation.h,
        left: PopedItemLocation.x,
        top: PopedItemLocation.y,
        borderRadius: "1.5rem",
        opacity: 0,
      },
      { duration: 0.5 }
    );
    setTimeout(() => {
      showPopupBack(false);
      setPopedItemLoc({
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        fileId: null,
      });
    }, 500);
  };

  useEffect(() => {
    if (PopedItemLocation.fileId)
      setPopedItemLoc((prev) => ({
        data: FileItem.find((p) => p.id === prev.fileId),
        ...prev,
      }));
  }, [PopedItemLocation.fileId]);

  
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {PopUpBack && (
        <motion.div
          className="PopBackDrop absolute bg-[#0000005d] w-full h-full z-30 backdrop-blur-md"
          initial={{
            backgroundColor: "#00000000",
            backdropFilter: "blur(0px)",
          }}
          animate={{
            backgroundColor: "#0000005d",
            backdropFilter: "blur(12px)",
            transition: { duration: 0.5 },
          }}
          whileTap={{
            backgroundColor: "#00000000",
            backdropFilter: "blur(0px)",
            transition: { duration: 0.5 },
          }}
          onClick={RemovePopUp}
        >
          <motion.div
            ref={PopupItem}
            style={{
              left: CalculateIdealPosition(PopedItemLocation).x,
              top: CalculateIdealPosition(PopedItemLocation).y,
            }}
            initial={{
              width: PopedItemLocation.w,
              height: PopedItemLocation.h,
              left: PopedItemLocation.x,
              top: PopedItemLocation.y,
              opacity: 1,
            }}
            animate={{
              width: PopedItemLocation.w * 2,
              height: "auto",
              left: CalculateIdealPosition(PopedItemLocation).x,
              top: CalculateIdealPosition(PopedItemLocation).y,
              transition: { duration: 0.8, ease: "circOut", type: "spring" },
            }}
            className={`fixed group text-[#004d40] flex md:flex-col cursor-pointer z-40 overflow-hidden`}
            onClick={(e)=>{e.preventDefault();e.stopPropagation();}}
          >
            <motion.div
              className="relative
                  flex flex-row md:flex-col
                  bg-white rounded-lg p-4
                  ring-1 ring-[#b2dfdb]
                  shadow-lg/20 shadow-[#038a7338]"
              style={{ width: PopedItemLocation.w * 2 }}
            >
              <motion.div className="flex flex-row shadow-lg p-3 pb-0 rounded-lg ring-1 ring-[#038a73]">
                {PopedItemLocation.data && (
                  <MediaImg
                    type={PopedItemLocation.data.mediaType}
                    styling="basis-1/3 pb-3 max-h-max mt-auto mb-auto w-full h-full"
                  />
                )}
                {/*Use Media Type */}
                <div className="basis-2/3 flex flex-col">
                  <motion.div
                    style={{ textOverflow: "unset" }}
                    className={`FileName font-extrabold text-wrap mt-2 break-all h-full text-2xl items-center ml-3 overflow-y-auto line-clamp-3`}
                  >
                    {PopedItemLocation.data && PopedItemLocation.data.name}
                  </motion.div>
                  <p
                    className={`mt-1 text-[#626e6c] text-lg font-semibold text-end hidden md:block overflow-hidden min-h-min`}
                  >
                    {PopedItemLocation.data && PopedItemLocation.data.mediaType}
                  </p>
                </div>
              </motion.div>
              <div className="EDetails flex text-md mt-4">
                <div className="basis-1/2 font-semibold pl-4">
                  Created At:
                  <div className="relative left-1/4 font-normal">
                    {PopedItemLocation.data &&
                      new Date(PopedItemLocation.data.createdAt)
                        .toLocaleString()
                        .split(",")
                        .map((x, i) => {
                          return <div key={i}>{x}</div>;
                        })}
                  </div>
                </div>
                <div className="relative basis-1/2 font-semibold text-end right-1/4">
                  Size:
                  <div className="relative left-1/4 font-normal">
                    {PopedItemLocation.data &&
                      (PopedItemLocation.data.isFolder
                        ? PopedItemLocation.data.size + " Items"
                        : CalculateSize(PopedItemLocation.data.size))}
                  </div>
                </div>
              </div>
              <div className="flex justify-around mt-3 font-bold text-lg">
                {/* {PopedItemLocation.data && (<FastDownload file={PopedItemLocation.data}/>)} */}
                {PopedItemLocation.data && (
                  <DirectDownload
                    fileName={PopedItemLocation.data.name}
                    id={PopedItemLocation.fileId}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      <header className="sticky z-20 w-full h-auto bg-[#00695c] p-4 pl-6 pr-6 shadow-lg/25 flex flex-col md:flex-row">
        <BreadCrumbs />
        <ReloadButton />
      </header>
      {/* grid grid-cols-[repeat(auto-fill,minmax(10vw,1fr))] */}
      <ExpandFileData.Provider value={{ showPopupBack, setPopedItemLoc }}>
        {
          FileItem.length>0 ? (<motion.div className="relative Container flex flex-wrap md:gap-4 h-min  bg-white p-4 justify-start gap-y-4 overflow-y-auto overflow-x-hidden">
          {FileItem.map((file) => (
            <FolderItem
              key={file.id}
              FileName={file.name}
              FileSize={file.size}
              FileCreationDate={file.createdAt}
              FileMediaType={file.mediaType}
              IsFolder={file.isFolder}
              FileId={file.id}
            />
          ))}
        </motion.div>) : (isFolderEmpty ? <EmptyFolder/> : <ContentWaiting/>)
        }
      </ExpandFileData.Provider>
    </div>
  );
}

export default App;
