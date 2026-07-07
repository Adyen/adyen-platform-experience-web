import { expect, test, type Page } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';

const STORY_ID = 'mocked-disputes-dispute-management--chargeback-lost';

type DownloadRevokeTestState = {
    createdUrls: string[];
    linkClicks: { download: string; href: string }[];
    revokedUrls: string[];
    runScheduledRevokes: () => void;
    scheduledDelays: number[];
};

type WindowWithDownloadRevokeTest = Window & {
    __downloadRevokeTest?: DownloadRevokeTestState;
};

async function installDownloadRevokeInstrumentation(page: Page) {
    await page.addInitScript(() => {
        const scheduledCallbacks: (() => void)[] = [];
        const state: DownloadRevokeTestState = {
            createdUrls: [],
            linkClicks: [],
            revokedUrls: [],
            runScheduledRevokes: () => {
                scheduledCallbacks.splice(0).forEach(callback => callback());
            },
            scheduledDelays: [],
        };
        (window as WindowWithDownloadRevokeTest).__downloadRevokeTest = state;

        const originalCreateObjectURL = URL.createObjectURL.bind(URL);
        const originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);
        const originalSetTimeout = window.setTimeout.bind(window);
        const originalAnchorClick = HTMLAnchorElement.prototype.click;

        URL.createObjectURL = (object: Blob | MediaSource) => {
            const url = originalCreateObjectURL(object);
            state.createdUrls.push(url);
            return url;
        };

        URL.revokeObjectURL = (url: string) => {
            state.revokedUrls.push(url);
            originalRevokeObjectURL(url);
        };

        window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
            if (typeof handler === 'function' && String(handler).includes('revokeObjectURL')) {
                const revokeHandler = handler as (...callbackArgs: unknown[]) => void;
                state.scheduledDelays.push(timeout ?? 0);
                scheduledCallbacks.push(() => revokeHandler(...args));
                return state.scheduledDelays.length;
            }
            return originalSetTimeout(handler, timeout, ...args);
        }) as typeof window.setTimeout;

        HTMLAnchorElement.prototype.click = function click(this: HTMLAnchorElement) {
            if (this.download) {
                state.linkClicks.push({ download: this.download, href: this.href });
                return;
            }
            originalAnchorClick.call(this);
        };
    });
}

test.describe('Download evidence', () => {
    test('should defer revoking the object URL until after the download click', async ({ page }) => {
        await installDownloadRevokeInstrumentation(page);
        await goToStory(page, { id: STORY_ID });

        await page.getByRole('button', { name: 'Download evidence' }).first().click();

        await page.waitForFunction(() => {
            const state = (window as WindowWithDownloadRevokeTest).__downloadRevokeTest;
            return !!state?.linkClicks.length && (!!state.scheduledDelays.length || !!state.revokedUrls.length);
        });

        const stateBeforeScheduledRevoke = await page.evaluate(() => (window as WindowWithDownloadRevokeTest).__downloadRevokeTest);
        expect(stateBeforeScheduledRevoke?.linkClicks).toHaveLength(1);
        expect(stateBeforeScheduledRevoke?.scheduledDelays).toEqual([100]);
        expect(stateBeforeScheduledRevoke?.revokedUrls).toEqual([]);

        await page.evaluate(() => (window as WindowWithDownloadRevokeTest).__downloadRevokeTest?.runScheduledRevokes());

        const stateAfterScheduledRevoke = await page.evaluate(() => (window as WindowWithDownloadRevokeTest).__downloadRevokeTest);
        expect(stateAfterScheduledRevoke?.revokedUrls).toEqual(stateAfterScheduledRevoke?.createdUrls);
    });
});
