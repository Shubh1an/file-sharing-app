import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Route, Routes } from "react-router-dom";
import Sender from "./Sender";
import Reciver from "./Reciver";

function App() {
  const [roomId, setRoomId] = useState(null);
  const [reciverId, setReciverId] = useState(null);
  let fileshare = {};
  const socket = io.connect("https://1e42-103-15-67-125.ngrok.io");
  console.log(roomId);
  function generateID() {
    return `${Math.trunc(Math.random() * 999)} -${Math.trunc(
      Math.random() * 999
    )} -${Math.trunc(Math.random() * 999)}`;
  }
  const handle_createRoom = () => {
    let joinId = generateID();
    setRoomId(joinId);
    socket.emit("sender-join", { uid: joinId });
  };
  useEffect(() => {
    // socket.on("init", (uid) => {
    //   setReciverId(uid);
    //   console.log("uiddd lelooo", uid);
    //   document.querySelector(".join-screen").classList.remove("active");
    //   document.querySelector(".fs-screen").classList.add("active");
    // });
  }, []);
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <Sender
              reciverId={reciverId}
              roomId={roomId}
              socket={socket}
              handle_createRoom={handle_createRoom}
            />
          }
        />
        <Route
          path="reciver"
          element={<Reciver socket={socket} senderId={roomId} />}
        />
      </Routes>
    </div>
  );
}

export default App;
