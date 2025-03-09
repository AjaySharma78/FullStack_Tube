import mongoConnection from "./db/config.js";
import { server, io } from "./app.js";
import config from "./env/config.js";
import ACTIONS from "./Actions.js";

mongoConnection();

io.on('connection', (socket) => {

  console.log("New client connected");

    socket.on('disconnecting', () => {
        console.log("Server: Client disconnecting detected!");
        socket.emit(ACTIONS.DISCONNECTED);
    });

    socket.on('disconnect', () => {
        console.log("Server: client disconnected");
    });
});

server.listen(config.port, () => {
  console.log(" Server running on port " + config.port);
});


export { io };