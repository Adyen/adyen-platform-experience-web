const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });
const mockedRoutes = require('./mock-server/src/routes');
const testRoutes = require('./test-server/src/routes');
const express = require('express');

const defaultPort = 3030;

module.exports = (app = express(), options = []) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((_, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    const routes = process.env.MOCKED_MODE ? mockedRoutes : testRoutes;

    app.use(routes);

    if (options.listen) {
        const port = process.env.PORT || defaultPort;
        app.listen(port, () => console.log(`Listening on localhost:${port}`));
    }

    return app;
};
