const express = require('express');
const fs = require('fs')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3003;

const updateAddr = () =>
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        let data = `{ "ip": "${add}" }`
        fs.writeFile('./src/config/ip.json', data, (err) => {
            if (err) {
                fs.mkdir('./src/config', err => {
                    if (err) throw err
                    updateAddr();
                });
            } else {
                console.log('The file has been updated!\nyour addr : ' + add);
            }
        });
    });

updateAddr();

let id = 0;

let controllerConnect = [];
let adminID = "none";
let deviceConnect = [];
let onlive = null;


function getClientIp(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0]
    }
    ip = ip.substr(ip.lastIndexOf(':') + 1, ip.length);
    console.log("ip:" + ip);
    return ip;
};

app.get('/', (req, res) => {

    res.send(`your IP ${getClientIp(req)}`)
})


io.on('connection', (socket) => {
    const init = () => {
        io.emit("controllerConnect", controllerConnect);
        io.emit("deviceConnect", deviceConnect);
        io.emit("adminID", adminID);
    }

    socket.on('addr', () => updateAddr());

    socket.on('type', type => {
        id++;
        // send UUID
        socket.emit("UUID", socket.id);



        init();
        console.log(`new user: id = ${socket.id} type = ${type} `);
        if (type === 'controller') {
            let userId = socket.id;
            controllerConnect.push(userId);

            // send have controller or not
            io.emit("controllerConnect", controllerConnect);
            adminID = controllerConnect[0];
            io.emit("adminID", adminID);

            socket.on("deviceReload", deviceId => {
                if (io.sockets.connected[deviceId]) {
                    io.to(deviceId).emit('reload');
                }
            })

            socket.on('callDevice', data => {
                let { deviceId, signalData, adminPeerID } = data;
                console.log(`controller ID : ${userId} try to call device ID : ${deviceId}, peerID is ${adminPeerID}`);
                if (io.sockets.connected[deviceId]) {
                    io.to(deviceId).emit('adminSignal', { signalData, adminPeerID, adminID });
                }
            });

            socket.on('disconnect', (test) => {
                console.log(userId);

                // controller leave
                controllerConnect = controllerConnect.filter(i => i !== userId);
                adminID = controllerConnect[0]
                io.emit("adminID", adminID);
                io.emit("controllerConnect", controllerConnect);
                console.log(`controller id : ${userId} leave, now connecting id = ${String(controllerConnect)}`);
            });
        } else if (type === 'device') {
            let userId = socket.id;
            deviceConnect.push(userId);


            socket.on('devicePeerID', devicePeerID => {
                console.log(`be called by device ID : ${userId}, peerID is ${devicePeerID}`);
                if (io.sockets.connected[adminID]) {
                    io.to(adminID).emit('devicePeerID', devicePeerID);
                }
            });
            // send deviceConnect to controller
            socket.on("acceptCall", signal => {
                io.to(adminID).emit('connectToDevice', signal)
            });

            io.emit("deviceConnect", deviceConnect);
            socket.on('disconnect', () => {
                deviceConnect = deviceConnect.filter(i => i !== userId);
                io.emit("deviceConnect", deviceConnect);
                console.log(`device id : ${userId} leave, now connecting id = ${String(deviceConnect)}`);
            });
        } else {

        }
    })


});



server.listen(port, () => {
    console.log('server listening on ' + port);
});