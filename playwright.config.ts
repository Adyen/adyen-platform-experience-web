import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import { getEnvironment } from './envs/getEnvs';

const { playground } = getEnvironment(process.env.CI ? 'demo' : 'mocked');

const baseUrl = `http://${playground.host}:${playground.port}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: './tests',
    timeout: 30 * 1000,
    globalTimeout: 10 * 60 * 1000, // 10 minutes
    expect: {
        timeout: 7000,
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
        actionTimeout: 5000,
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: baseUrl,

        trace: 'on-first-retry',
        headless: !!process.env.CI,
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'local-chrome',
            testDir: 'tests/integration',
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
            testDir: 'tests/integration',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: {
                    args: process.env.PWDEBUG ? ['--auto-open-devtools-for-tabs'] : [],
                },
            },
        },
        {
            name: 'firefox',
            testDir: 'tests/integration',
            use: {
                ...devices['Desktop Firefox'],
                launchOptions: {
                    args: process.env.PWDEBUG ? ['--devtools'] : [],
                },
            },
        },
        {
            name: 'local-chrome-e2e',
            testDir: 'tests/e2e',
            use: {
                // Use the pre-installed browser already on the machine
                channel: 'chrome',
                launchOptions: {
                    args: process.env.PWDEBUG ? ['--auto-open-devtools-for-tabs'] : [],
                },
            },
        },
        {
            name: 'contract',
            testDir: 'tests/contract',
            use: {
                ignoreHTTPSErrors: true,
            },
        },
    ],
    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run storybook:demo',
        reuseExistingServer: !process.env.CI,
        url: process.env.CI ? undefined : baseUrl,
        port: process.env.CI ? playground.port : undefined,
    },
};

export default config;
