import { createContext, StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { BrowserRouter } from "react-router-dom";

export const SignalRContext = createContext({connection:null});
export const CurrentDirectory = createContext("/");
const HubConnection = new HubConnectionBuilder()
    .withUrl("/details")
    .build();


async function ConnectToHub(props) {
  if(HubConnection.state == "Disconnected") {
    try{  
      await HubConnection.start();
      console.log("SuccessFully Establised Connection with Hub : Connection ID = "+ HubConnection.connectionId);
      // props.setConnection(HubConnection);
      await TestSignal(props);
    }catch(e){
      console.log("Error while connecting to Hub. Reconnecting... : "+e);
      ReconnectHubIn(props,5);
    }
  }else{
    console.log("Hub Connection State : "+HubConnection.state);
  }
}

function ReconnectHubIn(props, seconds) {
  return setTimeout(async() => {
      await HubConnection.stop();
      props.setConnection(null);
      console.log("Reconnecting to Hub...");
      await ConnectToHub(props);
    }, seconds*1000);
}

async function TestSignal(props){
  HubConnection.off("ConnectionCheck");
  if(HubConnection.state == "Connected"){
    try{
      const timerId = ReconnectHubIn(props,5);
      HubConnection.on("ConnectionCheck", (reply)=>{
        clearTimeout(timerId);
        console.log("Received Test Signal Reply from Hub : "+reply);
        props.setConnection(HubConnection);
      });
      await HubConnection.invoke("Test");
    }catch(e){
      console.log("Error while sending Test Signal to Hub. Reconnecting..." + e);
      ReconnectHubIn(props,5);
    }
  }else{
    console.log("Hub Connection State : "+HubConnection.state);
  }
}

function SignalRProvider({children}) {
  const [Connection , setConnection] = useState(null);
  
  useEffect(() => {
    ConnectToHub({setConnection});
  }, []);
  return <SignalRContext.Provider value={{connection:Connection}}>{children}</SignalRContext.Provider>;
}

function CurrentDirectoryProvider({children}) {
  const Path = new URLSearchParams(window.location.search);
  let dir;
  if(Path.has("p")){dir = decodeURIComponent(Path.get("p"))}
  else dir = "/";
  if(!dir.startsWith("/")) dir = "/"+dir;
  return <CurrentDirectory.Provider value={dir}>{children}</CurrentDirectory.Provider>
}


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SignalRProvider>
        <App />
      </SignalRProvider>
    </BrowserRouter>
  </StrictMode>
);
