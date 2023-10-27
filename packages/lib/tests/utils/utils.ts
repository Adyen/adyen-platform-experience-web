import { pages } from '../../../playground/pages';
import keys from '../../../lib/src/core/Localization/translations/en-US.json';
import { BrowserContext, Page } from '@playwright/test';
import { resolve } from 'node:path';

type PageId = (typeof pages)[number]['id'];
export const getPagePath = (id: PageId) => pages.find(page => page.id === id)?.id ?? '';

export const getTranslatedKey = (key: keyof typeof keys) => keys[key] ?? '';

export const mockGETRoute = async <T>({ response, route: path, context }: { response: T; route: string; context: BrowserContext }) => {
    const normalizedRoute = path.startsWith('/') ? `**/*${path}/**` : `**/*/${path}/**`;
    await context.route(normalizedRoute, async route => {
        await route.fulfill({ json: response });
    });
};

export const scriptToAddDefaultID = async (page: Page, id: string) => {
    await page.addInitScript(id => {
        Object.assign(window, { defaultID: id });
    }, id);
};

export const scriptToAddInitialConfig = async (context: BrowserContext, scriptPath: string) => {
    await context.addInitScript({ path: scriptPath });
};

export const noop = () => {};

export const asyncNoop = async () => {};
