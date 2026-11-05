import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './cli';

const MIN_NODE_MAJOR = 20;

if (Number(process.versions.node.split('.')[0]) < MIN_NODE_MAJOR) {
    process.stderr.write(`This command needs Node.js ${MIN_NODE_MAJOR} or later; you're running ${process.versions.node}.\n`);
    process.exit(1);
}

const cliDir = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(readFileSync(join(cliDir, '..', '..', 'package.json'), 'utf8'));

process.exitCode = await run(process.argv.slice(2), {
    cwd: process.cwd(),
    skillsRoot: join(cliDir, '..', 'skills'),
    version,
    stdout: process.stdout,
    stderr: process.stderr,
    stdin: process.stdin,
    isTTY: Boolean(process.stdin.isTTY && process.stdout.isTTY),
});
