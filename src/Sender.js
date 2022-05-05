import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
function Sender({ roomId, handle_createRoom, socket }) {
  const [fileName, setFileName] = useState("");

  // const [reciverId, setReciverId] = useState(null);
  const [progress, setProgress] = useState(null);
  const reciverId = useRef();
  const meta = useRef();
  useEffect(() => {
    socket.on("init", (uid) => {
      reciverId.current = uid;
      console.log("uiddd lelooo", uid);
      document.querySelector(".join-screen").classList.remove("active");
      document.querySelector(".fs-screen").classList.add("active");
    });
    socket.on("fs-share", () => {
      console.log("shareree");
      let chunk = meta.current.buffer.slice(
        0,
        meta.current.metadata.buffer_size
      );
      meta.current.buffer = meta.current.buffer.slice(
        meta.current.metadata.buffer_size,
        meta.current.buffer.length
      );
      console.log("mere buffer", meta.current.buffer);
      setProgress(
        Math.trunc(
          ((meta.current.metadata.total_buffer_size -
            meta.current.buffer.length) /
            meta.current.metadata.total_buffer_size) *
            100
        )
      );
      if (chunk.length !== 0) {
        socket.emit("file-raw", {
          uid: reciverId.current,
          buffer: chunk,
        });
      }
    });
  }, []);
  console.log("meta", meta);

  const handle_Files = (e) => {
    let file = e.target.files[0];
    console.log("handle file chal gya", e.target.files[0]);
    if (!file) return;
    setFileName(file.name);
    let reader = new FileReader();
    reader.onload = function (e) {
      let buffer = new Uint8Array(reader.result);
      console.log(buffer);
      socket.emit("file-meta", {
        uid: reciverId.current,
        metadata: {
          filename: file.name,
          total_buffer_size: buffer.length,
          buffer_size: 1024,
        },
      });
      shareFile(
        {
          filename: file.name,
          total_buffer_size: buffer.length,
          buffer_size: 1024,
        },
        buffer
      );
    };

    reader.readAsArrayBuffer(file);
  };
  const shareFile = (metadata, buffer) => {
    console.log("metadata_size", metadata.buffer_size);
    meta.current = { metadata, buffer };
    // socket.emit("file-meta", {
    //   uid: reciverId.current,
    //   metadata: metadata,
    // });
  };
  console.log("progress", progress);
  return (
    <div>
      <div className="screen join-screen active">
        <div className="form">
          <h2>Share your files securely</h2>
          <div className="form-input">
            <button id="sender-start-con-btn" onClick={handle_createRoom}>
              Create room
            </button>
          </div>
          <div className="form-input" id="join-id">
            <p>{roomId}</p>
          </div>
        </div>
      </div>
      <div className="screen fs-screen ">
        <div className="file-input">
          <label htmlFor="file-input">
            Click here to select files for sharing
          </label>
          <input type="file" onChange={handle_Files} id="file-input" />
          <div className="title">Shared files:</div>
        </div>
        <div className="files-list">
          <div className="item">
            <div className="progress">{`${progress}%`}</div>
            <div className="fileName">{fileName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sender;

// let chunk = buffer.slice(0, metadata.buffer_size);
// buffer = buffer.slice(metadata.buffer_size, buffer.length);
// progress_node.innerText =
//   Math.trunc(
//     ((metadata.total_buffer_size - buffer.length) /
//       metadata.total_buffer_size) *
//       100
//   ) + "%";
// if (chunk.length != 0) {
//   socket.emit("file-raw", {
//     uid: reciverId,
//     buffer: chunk,
//   });
// }
