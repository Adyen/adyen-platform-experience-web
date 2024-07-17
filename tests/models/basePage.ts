import type { Locator, Page } from '@playwright/test';

export abstract class BasePage {
    public readonly page: Page;
    public readonly rootElement: Locator;
    public path: string;
    public goto: () => Promise<void>;

    protected constructor(page: Page, rootElementSelector: string, path: string) {
        this.page = page;
        this.rootElement = page.locator(rootElementSelector);
        this.path = path;
        this.goto = async () => {
            await this.page.goto(`/src/pages/${this.path}/`);
        };
    }
}
