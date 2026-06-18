#!/usr/bin/env tsx
/**
 * Orchestrates a full pre-release integration test:
 *
 * 1. Start a local Verdaccio registry (in-memory)
 * 2. Build the SDK and publish it to Verdaccio
 * 3. Install the published package in integration-demo
 * 4. Run type-checking, build, and Playwright render tests
 * 5. Teardown Verdaccio and restore the original state
 */
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createServer } from 'node:net';

const DEMO_DIR = resolve(import.meta.dirname, '..');
const ROOT = resolve(DEMO_DIR, '../..');
const DEMO_PKG_PATH = resolve(DEMO_DIR, 'package.json');
const DEMO_PKG_BACKUP_PATH = resolve(DEMO_DIR, 'package.json.bak');
const PKG_NAME = '@adyen/adyen-platform-experience-web';

// ── Utilities ──────────────────────────────────────────────────────────────────

function run(argv: string[], cwd: string, label: string) {
    const [executable, ...args] = argv;
    console.log(`\n▸ [${label}] ${argv.join(' ')}`);
    execFileSync(executable!, args, { cwd, stdio: 'inherit' });
}

function getAvailablePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = createServer();
        server.listen(0, () => {
            const address = server.address();
            if (address && typeof address === 'object') {
                const port = address.port;
                server.close(() => resolve(port));
            } else {
                reject(new Error('Could not determine port'));
            }
        });
        server.on('error', reject);
    });
}

function waitForServer(url: string, timeoutMs = 30_000): Promise<void> {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        let settled = false;
        const check = () => {
            if (settled) return;
            fetch(url)
                .then(res => {
                    if (settled) return;
                    if (res.ok) {
                        settled = true;
                        resolve();
                    } else if (Date.now() - start > timeoutMs) {
                        settled = true;
                        reject(new Error(`Timeout waiting for ${url}`));
                    } else {
                        setTimeout(check, 300);
                    }
                })
                .catch(() => {
                    if (settled) return;
                    if (Date.now() - start > timeoutMs) {
                        settled = true;
                        reject(new Error(`Timeout waiting for ${url}`));
                    } else {
                        setTimeout(check, 300);
                    }
                });
        };
        check();
    });
}

// ── Verdaccio config ───────────────────────────────────────────────────────────

function writeVerdaccioConfig(configPath: string, port: number) {
    const config = `
storage: ./storage
uplinks: {}
packages:
  '${PKG_NAME}':
    access: $all
    publish: $all
  '**':
    access: $all
    publish: $all
log: { type: stdout, format: pretty, level: warn }
listen: 0.0.0.0:${port}
max_body_size: 100mb
`;
    mkdirSync(dirname(configPath), { recursive: true });
    writeFileSync(configPath, config);
}

// ── Main ───────────────────────────────────────────────────────────────────────

let verdaccioProcess: ChildProcess | null = null;
let verdaccioTmpDir: string | null = null;
let cleanedUp = false;

function cleanup() {
    if (cleanedUp) return;
    cleanedUp = true;
    console.log('\n▸ [cleanup] Restoring original state...');

    // Restore package.json
    if (existsSync(DEMO_PKG_BACKUP_PATH)) {
        copyFileSync(DEMO_PKG_BACKUP_PATH, DEMO_PKG_PATH);
        rmSync(DEMO_PKG_BACKUP_PATH);
        console.log('  ✓ Restored package.json');
    }

    // Restore or remove .npmrc
    const demoNpmrcPath = resolve(DEMO_DIR, '.npmrc');
    const demoNpmrcBackup = resolve(DEMO_DIR, '.npmrc.bak');
    if (existsSync(demoNpmrcBackup)) {
        copyFileSync(demoNpmrcBackup, demoNpmrcPath);
        rmSync(demoNpmrcBackup);
        console.log('  ✓ Restored .npmrc');
    } else if (existsSync(demoNpmrcPath)) {
        rmSync(demoNpmrcPath);
        console.log('  ✓ Removed temporary .npmrc');
    }

    // Kill Verdaccio
    if (verdaccioProcess) {
        verdaccioProcess.kill('SIGTERM');
        console.log('  ✓ Stopped Verdaccio');
    }

    // Clean up temp dir
    if (verdaccioTmpDir && existsSync(verdaccioTmpDir)) {
        try {
            rmSync(verdaccioTmpDir, { recursive: true, force: true });
            console.log('  ✓ Removed temp dir');
        } catch (err) {
            console.warn('  ⚠ Failed to remove temp dir (non-fatal):', err);
        }
    }

    // Reinstall to restore workspace links
    try {
        run(['pnpm', 'install', '--no-frozen-lockfile'], ROOT, 'cleanup');
    } catch {
        console.warn('  ⚠ pnpm install during cleanup failed (non-fatal)');
    }
}

async function main() {
    const steps = ['typecheck', 'build', 'render'];

    // Parse flags
    const skipRender = process.argv.includes('--skip-render');
    const noBuild = process.argv.includes('--no-build');
    if (skipRender) {
        const idx = steps.indexOf('render');
        if (idx !== -1) steps.splice(idx, 1);
        console.log('⚠ Skipping render tests (--skip-render)');
    }

    let exitCode = 0;

    try {
        // ── 1. Build SDK ───────────────────────────────────────────────────
        if (noBuild) {
            console.log('\n▸ [build-sdk] Skipping build (--no-build)');
        } else {
            run(['pnpm', 'run', 'build'], ROOT, 'build-sdk');
        }

        // ── 2. Start Verdaccio ─────────────────────────────────────────────
        const port = await getAvailablePort();
        const registryUrl = `http://localhost:${port}`;

        verdaccioTmpDir = resolve(DEMO_DIR, '.verdaccio-tmp');
        const configPath = resolve(verdaccioTmpDir, 'config.yaml');
        writeVerdaccioConfig(configPath, port);

        console.log(`\n▸ [verdaccio] Starting on port ${port}...`);

        const verdaccioBin = resolve(ROOT, 'node_modules/.bin/verdaccio');
        verdaccioProcess = spawn(verdaccioBin, ['--config', configPath], {
            cwd: verdaccioTmpDir,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        verdaccioProcess.stdout?.on('data', (data: Buffer) => {
            const msg = data.toString().trim();
            if (msg) console.log(`  [verdaccio] ${msg}`);
        });

        verdaccioProcess.stderr?.on('data', (data: Buffer) => {
            const msg = data.toString().trim();
            if (msg) console.error(`  [verdaccio] ${msg}`);
        });

        await waitForServer(`${registryUrl}/-/ping`);
        console.log(`  ✓ Verdaccio ready at ${registryUrl}`);

        // ── 3. Publish to Verdaccio ────────────────────────────────────────
        // Verdaccio requires auth — write a temporary .npmrc with a dummy token
        const npmrcPath = resolve(verdaccioTmpDir!, '.npmrc');
        writeFileSync(npmrcPath, `//localhost:${port}/:_authToken=dummy-token\n`);
        run(['npm', 'publish', '--registry', registryUrl, '--no-git-checks', '--userconfig', npmrcPath], ROOT, 'publish');

        // ── 4. Install from Verdaccio in integration-demo ─────────────────
        // Backup package.json
        copyFileSync(DEMO_PKG_PATH, DEMO_PKG_BACKUP_PATH);

        // Update the dependency to use the latest version from Verdaccio
        const demoPkg = JSON.parse(readFileSync(DEMO_PKG_PATH, 'utf-8'));
        const rootPkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'));
        const sdkVersion = rootPkg.version;

        demoPkg.dependencies[PKG_NAME] = sdkVersion;
        writeFileSync(DEMO_PKG_PATH, JSON.stringify(demoPkg, null, 4) + '\n');

        // Write a temporary .npmrc that scopes only @adyen packages to Verdaccio
        const demoNpmrcPath = resolve(DEMO_DIR, '.npmrc');
        const demoNpmrcBackup = resolve(DEMO_DIR, '.npmrc.bak');
        if (existsSync(demoNpmrcPath)) {
            copyFileSync(demoNpmrcPath, demoNpmrcBackup);
        }
        writeFileSync(demoNpmrcPath, `@adyen:registry=${registryUrl}\n//localhost:${port}/:_authToken=dummy-token\n`);

        run(['pnpm', 'install', '--no-frozen-lockfile', '--filter', '@integration-components/integration-demo'], ROOT, 'install');

        // ── 5. Run tests ──────────────────────────────────────────────────
        if (steps.includes('typecheck')) {
            run(['pnpm', 'run', 'test:typecheck'], DEMO_DIR, 'typecheck');
        }

        if (steps.includes('build')) {
            run(['pnpm', 'run', 'test:build'], DEMO_DIR, 'build');
        }

        if (steps.includes('render')) {
            run(['pnpm', 'run', 'test:render'], DEMO_DIR, 'render');
        }

        console.log('\n✅ All integration-demo pre-release tests passed!');
    } catch (error) {
        console.error('\n❌ Integration-demo pre-release tests failed');
        console.error(error);
        exitCode = 1;
    } finally {
        cleanup();
    }

    process.exit(exitCode);
}

// Handle unexpected exits
process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
});
process.on('SIGTERM', () => {
    cleanup();
    process.exit(143);
});

main();
