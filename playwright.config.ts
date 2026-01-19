import type { PlaywrightTestConfig } from '@playwright/test';
import { getEnvironment } from './envs/getEnvs';

// Always run tests in 'development' mode
const { app } = getEnvironment('development');

const baseUrl = `http://${app.host}:${app.port}`;

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
        timezoneId: 'UTC',
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
                    args: process.env.CI ? ['--headless=new'] : process.env.PWDEBUG ? ['--auto-open-devtools-for-tabs'] : [],
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
                    args: process.env.CI ? ['--headless=new'] : process.env.PWDEBUG ? ['--auto-open-devtools-for-tabs'] : [],
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
        command: 'pnpm run storybook:static',
        reuseExistingServer: !process.env.CI,
        url: process.env.CI ? undefined : baseUrl,
        port: process.env.CI ? app.port : undefined,
    },
};

export default config;
