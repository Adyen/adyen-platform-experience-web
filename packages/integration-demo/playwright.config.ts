import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envDir = path.resolve(__dirname, '../../envs');
const env = loadEnv('development', envDir, '');
const port = Number(env.DEMO_PORT ?? 3031);

export default defineConfig({
    testDir: './tests',
    timeout: 60_000,
    expect: {
        timeout: 15_000,
    },
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: `http://localhost:${port}`,
        actionTimeout: 10_000,
        trace: 'on-first-retry',
        headless: !!process.env.CI,
    },
    projects: [
        {
            name: 'integration-demo',
            use: {
                channel: 'chrome',
                launchOptions: {
                    args: process.env.CI ? ['--headless=new'] : [],
                },
            },
        },
    ],
    webServer: {
        command: 'pnpm run demo:dev',
        port,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
    },
});
