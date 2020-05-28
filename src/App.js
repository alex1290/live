import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 80%;
  height: 80%;
  margin:auto;
`;

const Info = styled.p`
  padding: 0 5px;
`;

function App(props) {
  const [UUID, setUUID] = useState("");
  const [devices, setDevices] = useState([]);
  const [devicePeerID, setDevicePeerID] = useState();

  const [adminID, setAdminID] = useState("none");

  const [stream, setStream] = useState();

  const userVideo = useRef();
  const socket = useRef();

  useEffect(() => {
    socket.current = io.connect("http://" + props.ip + ":3003");


    socket.current.emit("type", "controller");

    socket.current.on("UUID", (id) => {
      setUUID(id);
    })

    socket.current.on("adminID", (id) => {
      setAdminID(id);
    })

    socket.current.on("deviceConnect", (list) => {
      setDevices(list);
    })



    // startCapture('Camera')
  }, []);

  const startCapture = source => {
    if (source === 'Camera') {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      })
    } else if (source === 'Desktop') {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(stream => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      })
    }
  }
  const stopCapture = () => {
    let tracks = userVideo.current.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    userVideo.current.srcObject = null;
    setStream(undefined);
  }

  function deviceReload(id) {
    socket.current.emit("deviceReload", id);
  }

  function callPeer(id) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });
    setDevicePeerID(id);
    peer.on("signal", data => {
      socket.current.emit("callDevice", { deviceId: id, signalData: data, adminPeerID: peer._id });
    })

    socket.current.on("connectToDevice", signal => {
      peer.signal(signal);
    })

  }

  let UserVideo;
  if (stream) {
    UserVideo = (
      <Video playsInline muted ref={userVideo} autoPlay />
    );
  }

  return (
    <Container>
      <Row>
        <Info>Update Ip Address : <button onClick={() => socket.current.emit('addr')}>Update</button></Info>
      </Row>
      <Row>
        <Info>User Info : UUID = {UUID}</Info>
        <Info>Admin ID : {adminID}</Info>
      </Row>
      <Row>
        <Info>Capture Source :
          {
            stream
              ?
              <button onClick={() => stopCapture()}>Stop Capture</button>
              : <>
                <button onClick={() => startCapture("Camera")}>Camera</button>
                <button onClick={() => startCapture("Desktop")}>Desktop</button>
              </>
          }
        </Info>
      </Row>
      {
        stream &&
        <Row>
          <Info>Device List :  {devices.map((id, n) => {
            return (
              <button key={n} onClick={() => callPeer(id)}>Call {id}</button>
            );
          })}
          </Info>
        </Row>
      }
      <Row>{devicePeerID}</Row>
      <Row>{devicePeerID && <button onClick={() => deviceReload(devicePeerID)}>Device Reload</button>}</Row>
      <Row>
        {UserVideo}
      </Row>
    </Container>
  );
}

export default App;