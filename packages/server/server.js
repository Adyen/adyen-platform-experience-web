import { resolve } from 'path';
import { readFileSync } from 'fs';
import http from 'http';
import https from 'https';
import express from 'express';
import { app } from './index';

const certsPath = resolve(__dirname, 'certs');
const certOptions = {
    // Using local mocked certs
    key: readFileSync(resolve(certsPath, 'key.pem')),
    cert: readFileSync(resolve(certsPath, 'cert.pem')),
};

export const startServer = ({ expressInstance = express(), httpPort, httpsPort = httpPort + 1 }) => {
    console.log('appss', app);
    const appInstance = app(expressInstance);

    const httpServer = http.createServer(appInstance).listen(httpPort, () => {
        console.log(`The HTTP server is running on port ${httpPort}`);
    });

    const httpsServer = https.createServer(certOptions, appInstance).listen(httpsPort, () => {
        console.log(`The HTTPS server is running on port ${httpsPort}`);
    });

    return { httpServer, httpsServer };
};
