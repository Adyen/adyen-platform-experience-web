import { pages } from '../../../playground/pages';
import keys from '../../../lib/src/core/Localization/translations/en-US.json';
import { Page } from '@playwright/test';

type PageId = (typeof pages)[number]['id'];
export const getPagePath = (id: PageId) => pages.find(page => page.id === id)?.id ?? '';

export const getTranslatedKey = (key: keyof typeof keys) => keys[key] ?? '';

export const mockGETRoute = async <T>({ page, response, route }: { page: Page; response: T; route: string }) => {
    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
    await page.route(`*/**${normalizedRoute}/*`, async route => {
        await route.fulfill({ json: response });
    });
};
