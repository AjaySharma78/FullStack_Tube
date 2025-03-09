import { server, io } from "./app.js";
import config from "./env/config.js";
import ACTIONS from "./Actions.js";

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
  
  server.listen(config.socketPort, () => {
    console.log("socket Server running on port " + config.socketPort);
  });

  export { io };