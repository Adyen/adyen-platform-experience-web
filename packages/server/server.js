import http from 'http';
import express from 'express';
import { app } from './index';

export const startServer = ({ expressInstance = express(), httpPort, httpsPort = httpPort + 1 }) => {
    const appInstance = app(expressInstance);

    const httpServer = http.createServer(appInstance).listen(httpPort, () => {
        console.log(`The HTTP server is running on ports ${httpPort}`);
    });

    return { httpServer };
};
