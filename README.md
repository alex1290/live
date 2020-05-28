# P2P Live 

Use Node.js, socket.io, p2p, react.
Let you stream you picture to client in LAN


## Step :

1. ```npm run server```
run the server on port 3001 and generate your ip config 

2. ```npm start```
run the web on 3000
Controller path : /
Client path : /live

3. Controller choose the capture source on the web (desktop / camera)

4. If any Client is online, server will show the Client ID on both side.

5. Controller click the the button include the target Client ID, then server will stream your picture to Client.