import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import download from "downloadjs";
function Reciver({ socket, senderId }) {
  let sendrId = useRef();
  const [fileName, setFileName] = useState(null);
  const [progress, setProgress] = useState(null);

  let fileShare = {};
  useEffect(() => {
    socket.on("fs-meta", (metadata) => {
      console.log("fs-meta", metadata);
      fileShare.metadata = metadata;
      fileShare.transmitted = 0;
      fileShare.buffer = [];
      setFileName(metadata.metadata.filename);
      socket.emit("fs-start", {
        uid: sendrId.current,
      });
    });
    socket.on("fs-share", function (buffer) {
      // console.log(fileTypeFromBuffer(buffer));
      console.log("heeloo", buffer);
      fileShare.buffer.push(buffer);
      fileShare.transmitted += buffer.byteLength;
      console.log("NAN", fileShare.transmitted, fileShare.metadata.metadata);
      setProgress(
        Math.trunc(
          (fileShare.transmitted /
            fileShare.metadata.metadata.total_buffer_size) *
            100
        )
      );

      if (
        fileShare.transmitted ==
        fileShare.metadata.metadata.total_buffer_size * 2
      ) {
        download(
          new Blob(fileShare.buffer),
          fileShare.metadata.metadata.filename
        );
      }
      if (
        fileShare.transmitted == fileShare.metadata.metadata.total_buffer_size
      ) {
        console.log("DOWN");
        download(
          new Blob(fileShare.buffer),
          fileShare.metadata.metadata.filename
        );
        // download(
        //   new Blob(fileShare.buffer),
        //   fileShare.metadata.metadata.fileName,
        //   "image/jpg"
        // );
        fileShare = {};
      } else {
        console.log("else");
        socket.emit("fs-start", {
          uid: sendrId.current,
        });
      }
    });
  }, [socket]);

  function generateID() {
    return `${Math.trunc(Math.random() * 999)} -${Math.trunc(
      Math.random() * 999
    )} -${Math.trunc(Math.random() * 999)}`;
  }

  const handleChange = (e) => {
    sendrId.current = e.target.value;
  };

  const handle_createRoom = () => {
    if (sendrId.length === 0) return;

    let joinId = generateID();

    socket.emit("reciver-join", { uid: joinId, sender_uid: sendrId.current });
    document.querySelector(".join-screen").classList.remove("active");
    document.querySelector(".fs-screen").classList.add("active");
  };

  return (
    <div>
      <div className="screen join-screen active">
        <div className="form">
          <h2>Share your files securely</h2>
          <div className="form-input">
            <label htmlFor="join-id">Join ID</label>
            <input onChange={handleChange} type="text" id="join-id" />
          </div>
          <div className="form-input">
            <button onClick={handle_createRoom} id="receiver-start-con-btn">
              Connect
            </button>
          </div>
        </div>
      </div>
      <div className="screen fs-screen">
        <div className="files-list">
          <div className="title">Shared files:</div>
          <div className="item">
            <div className="progress2">{`${progress}%`} </div>
            <div
              className="filename"
              onClick={() => {
                console.log("hello");
                download(
                  new Blob(fileShare.buffer),
                  fileShare.metadata.metadata.fileName,
                  {
                    type: "image/jpg",
                  }
                );
              }}
            >
              {fileName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reciver;
