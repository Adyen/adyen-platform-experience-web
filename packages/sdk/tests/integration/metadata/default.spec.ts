import { expect, test, type Page } from '@playwright/test';
import { goToStory } from '@integration-components/testing/playwright/utils';
import packageJson from '../../../../../package.json' with { type: 'json' };

const STORY_ID = 'sdk-metadata--default';

/** The SDK version being built, injected into the bundle. */
const EXPECTED_SDK_VERSION = packageJson.version;

/** The window key under which the SDK exposes its metadata. */
const METADATA_WINDOW_KEY = 'AdyenPlatformExperienceMetadata';

/** Window shape that allows assigning the metadata key. */
type WritableMetadataWindow = { [key in typeof METADATA_WINDOW_KEY]?: unknown };

/** Loads the harness story, which evaluates the SDK entry. */
const loadHarnessStory = async (page: Page) => {
    await goToStory(page, { id: STORY_ID });
    await expect(page.getByTestId('sdk-harness')).toBeVisible();
};

test.describe('SDK metadata', () => {
    test('should expose the metadata on the window object with the SDK version', async ({ page }) => {
        await loadHarnessStory(page);

        const { enumerable, version } = await page.evaluate(
            ([key]) => {
                const metadata = window[key];
                const descriptor = Object.getOwnPropertyDescriptor(window, key) ?? {};
                return { ...descriptor, version: metadata?.version };
            },
            [METADATA_WINDOW_KEY] as const
        );

        expect(enumerable).toBe(true);
        expect(version).toBe(EXPECTED_SDK_VERSION);
    });

    test('should keep the exposed properties completely immutable', async ({ page }) => {
        await loadHarnessStory(page);

        const modifiedVersion = `${EXPECTED_SDK_VERSION}-modified`;

        const contract = await page.evaluate(
            ([key, modifiedVersion]) => {
                const metadata = window[key];
                const windowDescriptor = Object.getOwnPropertyDescriptor(window, key) ?? {};

                if (!metadata) {
                    // A missing metadata (broken exposure) must fail the assertions, not crash the evaluation.
                    return { metadata, windowDescriptor, versionDescriptor: {}, versionUnchanged: false };
                }

                const versionDescriptor = Object.getOwnPropertyDescriptor(metadata, 'version') ?? {};
                const version = metadata.version;

                // Sloppy-mode writes on non-writable properties silently fail
                (window as WritableMetadataWindow)[key] = { version: modifiedVersion };
                (metadata as { version: string }).version = modifiedVersion;

                return {
                    metadata,
                    windowDescriptor,
                    versionDescriptor,
                    versionUnchanged: metadata.version === version,
                };
            },
            [METADATA_WINDOW_KEY, modifiedVersion] as const
        );

        expect(contract.windowDescriptor).toEqual({ writable: false, configurable: false, enumerable: true, value: contract.metadata });
        expect(contract.versionDescriptor).toEqual({ writable: false, configurable: false, enumerable: true, value: contract.metadata.version });
        expect(contract.versionUnchanged).toBe(true);
    });

    test('should prevent deletion of the exposed properties', async ({ page }) => {
        await loadHarnessStory(page);

        const contract = await page.evaluate(
            ([key]) => {
                const metadata = window[key];
                const version = metadata?.version;

                // Sloppy-mode deletes on non-configurable properties silently fail
                delete (metadata as { version?: string })?.version;
                delete (window as WritableMetadataWindow)[key];

                return {
                    // The metadata guards keep missing metadata from passing vacuously as undefined === undefined.
                    metadataStillExposed: metadata !== undefined && window[key] === metadata,
                    versionStillPresent: metadata !== undefined && metadata.version === version,
                };
            },
            [METADATA_WINDOW_KEY] as const
        );

        expect(contract.metadataStillExposed).toBe(true);
        expect(contract.versionStillPresent).toBe(true);
    });

    test('should not overwrite metadata preset by the host page', async ({ page }) => {
        // Sentinel proving the SDK never clobbers a value the host page set before the SDK was loaded.
        // Derived from the real version so it can never accidentally equal it, which would let a
        // clobbering SDK pass this test undetected.
        const presetVersion = `${EXPECTED_SDK_VERSION}-preset`;

        await page.addInitScript(
            ([key, version]) => {
                (window as WritableMetadataWindow)[key] = { version };
            },
            [METADATA_WINDOW_KEY, presetVersion] as const
        );

        await loadHarnessStory(page);

        const { version, writable } = await page.evaluate(
            ([key]) => {
                const metadata = window[key];
                const descriptor = Object.getOwnPropertyDescriptor(window, key) ?? {};
                return { ...descriptor, version: metadata?.version };
            },
            [METADATA_WINDOW_KEY] as const
        );

        expect(version).toBe(presetVersion);
        expect(writable).toBe(true);
    });
});
