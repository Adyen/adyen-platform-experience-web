import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import { getEnvironment } from '../../../envs/getEnvs';

const { playground } = getEnvironment(process.env.CI ? 'demo' : 'mocked');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: '../tests',
    timeout: 20 * 1000,
    globalTimeout: 10 * 60 * 1000, // 10 minutes
    expect: {
        timeout: 5000,
    },
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only. Playwright will tell us if a test is flaky */
    retries: process.env.CI ? 2 : 0,

    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,

    reporter: 'html',
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 1000,
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: `http://${playground.host}:${playground.port}`,

        trace: 'on-first-retry',
        headless: !!process.env.CI,
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'local-chrome',
            use: {
                // Use the pre-installed browser already on the machine
                channel: 'chrome',
                launchOptions: {
                    args: process.env.PWDEBUG ? ['--auto-open-devtools-for-tabs'] : [],
                },
            },
        },
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: {
                    args: process.env.PWDEBUG ? ['--auto-open-devtools-for-tabs'] : [],
                },
            },
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                launchOptions: {
                    args: process.env.PWDEBUG ? ['--devtools'] : [],
                },
            },
        },
    ],
    /* Run your local dev server before starting the tests */
    webServer: {
        command: process.env.CI ? 'npm run demo:serve' : 'npm run start:mocked',
        port: playground.port,
        reuseExistingServer: !process.env.CI,
    },
};

export default config;
