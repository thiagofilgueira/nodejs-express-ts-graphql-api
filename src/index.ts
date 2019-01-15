import * as http from 'http';

import app from './app';
import db from './models';
import { normalizePort, onError, onListening } from "./utils/utils";

const server = http.createServer(app);
const PORT = normalizePort(process.env.port || 3000);

db.sequelize.sync()
    .then(() => {
        
        server.listen(PORT);
        server.on('error', onError(PORT));
        server.on('listening', onListening(PORT));
        
    });

