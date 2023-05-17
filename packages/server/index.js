import mockedRoutes from './mock-server/src/routes';
import testRoutes from './test-server/src/routes';
import express from 'express';

const defaultPort = 8082;

export const app = (expressInstance, options = []) => {
    const app = expressInstance || express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((_, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    const routes = process.env.MOCKED_MODE ? mockedRoutes : mockedRoutes;

    app.use(routes);

    if (options.listen) {
        const port = process.env.PORT || defaultPort;
        app.listen(port, () => console.log(`Listening on localhost:${port}`));
    }

    app.use((err, req, res) => {
        console.trace(req?.path + ':', err.stack);
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        });
    });

    return app;
};
