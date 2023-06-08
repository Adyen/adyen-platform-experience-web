import { startServer } from './server';

const cliArgs = process.argv.slice(2);
const port = parseInt(cliArgs[0]);

if (!port || Number.isNaN(port)) {
    console.error('You must provide a valid port for the mock server to run on.');
    process.exit(1);
}
// Starts the http server which starts the Express app
startServer({
    httpPort: port,
});
