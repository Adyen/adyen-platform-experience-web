import AxeBuilder from '@axe-core/playwright';
import { test, Page } from '@playwright/test';

interface AccessibilityConfig {
    exclude?: string;
    disabledRules?: string | string[];
}

/**
 * Utility class for performing visual and accessibility tests on a page.
 *
 * For typical use, call .expectToPass(), which executes both the visual and accessibility tests.
 */
export class AccessibilityTestUtility {
    /**
     * Initializes the `AccessibilityTestUtility` class.
     *
     * @param page - The Playwright `Page` instance.
     */
    constructor(public readonly page: Page) {}

    /**
     * Performs an accessibility scan and checks for violations.
     *
     * @param config - Optional configuration for the accessibility scan (e.g., exclusions, disabled rules).
     * @returns A promise that resolves when the scan is complete and validated.
     */
    async expectToBeAccessible(config?: AccessibilityConfig) {
        const accessibilityScanResults = await new AxeBuilder({ page: this.page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .exclude(config?.exclude ?? '')
            .disableRules(config?.disabledRules || ['document-title', 'landmark-one-main', 'page-has-heading-one', 'region'])
            .analyze();

        test.expect(accessibilityScanResults.violations).toEqual([]);
    }

    /**
     * Runs accessibility tests.
     *
     * @returns A promise that resolves when a11y tests are complete.
     */
    async expectToPass(config?: AccessibilityConfig) {
        await this.expectToBeAccessible(config);
    }
}
