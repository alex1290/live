import React, { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";
import Peer from "simple-peer";


const Live = props => {
    const [UUID, setUUID] = useState("");
    const [adminID, setAdminID] = useState("none");
    const [adminPeerID, setAdminPeerID] = useState();

    const [adminSignal, setAdminSignal] = useState();

    const [stream, setStream] = useState();

    const adminVideo = useRef();
    const socket = useRef();



    useEffect(() => {
        socket.current = io.connect("http://" + props.ip + ":3003");

        socket.current.on("adminSignal", (data) => {
            setAdminSignal(data.signalData);
            setAdminPeerID(data.adminPeerID);
            // socket.current.emit("devicePeerID", peer._id);

        })

        socket.current.emit("type", "device");

        socket.current.on("UUID", id => {
            setUUID(id);
        });

        socket.current.on("adminID", id => {
            setAdminID(id);
        });

        socket.current.on("reload", () => {
            window.location.reload();
        });


    }, []);

    useEffect(() => {
        if (adminSignal) {
            acceptCall(adminSignal)
        }
    }, [adminSignal])

    function acceptCall(data) {
        // let { signalData, from } = data
        const peer = new Peer({
            initiator: false,
            trickle: false
        });
        peer.on("stream", stream => {
            console.log(AdminVideo);

            adminVideo.current.srcObject = stream;
        });

        peer.on("signal", signal => {
            socket.current.emit("acceptCall", signal)
        })


        peer.signal(data);
    }

    let AdminVideo;
    if (adminSignal) {
        let style = {
            width: "100vw",
            height: "100vh",
            position: "fixed",
            top: "0",
            left: "0",
            background:"#000"
        }
        AdminVideo = (
            <video style={style} playsInline muted ref={adminVideo} autoPlay />
        );
    }

    return (
        <div>
            <p>User Info : UUID = {UUID} </p>
            <p>Admin ID : {adminID}</p>
            <p>Admin Peer ID : {adminPeerID}</p>
            {AdminVideo}
        </div>
    )
}

export default Live;