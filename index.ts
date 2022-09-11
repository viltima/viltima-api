import http from "http";
import { makeApp } from "./app/app";
import { socketSetup } from "./app/socketio/socket";
import { connectDB } from "./app/utils/helpers";

const PORT: number = 8080;

import Logger from "./app/utils/logger";
const logger = new Logger();

connectDB();
makeApp()
  .then((app) => {
    const server = http.createServer(app);
    socketSetup(server);
    return server.listen(PORT);
  })
  .then(() => logger.info(`Server is running at http://localhost:${PORT}`))
  .catch((error) => logger.error(error));
