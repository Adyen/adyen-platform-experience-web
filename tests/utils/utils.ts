import { pages } from '../../playground/pages';
import keys from '../../src/translations/en-US.json' assert { type: 'json' };
import { BrowserContext, Page } from '@playwright/test';

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

const MONTHS_WITH_30_DAYS = [3, 5, 8, 10] as const;

const _clampTimestamp = (min: number, max: number, date: Date | number | string) => new Date(Math.max(Math.min(new Date(date).getTime(), max), min));
const _getTimestamp = (date: Date, fallback: number) => (Number.isFinite(date.getTime()) ? date.getTime() : fallback);

type ApplyDateFilterOptions = {
    earliestDate?: (now: number) => Date;
    latestDate?: (now: number) => Date;
};

export const applyDateFilter = (page: Page, options?: ApplyDateFilterOptions) => {
    const { earliestDate, latestDate } = options || {};
    const _minTimestamp = (now: Date) => _getTimestamp(new Date(earliestDate?.(now.getTime())!), -Infinity);
    const _maxTimestamp = (now: Date) => _getTimestamp(new Date(latestDate?.(now.getTime())!), Infinity);

    return async (from: Date | number | string = Date(), to: Date | number | string = from) => {
        const applyButton = page.getByLabel(getTranslatedKey('apply'));
        const previousMonthButton = page.getByLabel(getTranslatedKey('calendar.previousMonth'));
        const now = new Date();

        let maxTimestamp = _maxTimestamp(now);
        let minTimestamp = _minTimestamp(now);
        if (minTimestamp > maxTimestamp) [minTimestamp, maxTimestamp] = [maxTimestamp, minTimestamp];

        let fromDate = _clampTimestamp(minTimestamp, maxTimestamp, from);
        let toDate = _clampTimestamp(minTimestamp, maxTimestamp, to);
        if (fromDate > toDate) [fromDate, toDate] = [toDate, fromDate];

        const firstMonthDay = (await page.locator(`[data-within-month='1'] [datetime]`).all())[0]!;
        const firstVisibleDate = new Date((await firstMonthDay.getAttribute('datetime'))!);
        const rangeDates = [fromDate, toDate, firstVisibleDate];

        for (let i = 1; i >= 0; i--) await firstMonthDay.click();

        for (let i = 1; i >= 0; i--) {
            const date = rangeDates[i]!;
            const origin = rangeDates[i + 1]!;
            const originDate = origin.getDate();
            const originMonth = origin.getMonth();

            const diff = (origin.getFullYear() - date.getFullYear()) * 12 + (originMonth - date.getMonth());
            const years = Math.floor(diff / 12);
            let months = diff % 12;

            if (months) {
                const nearestShorterMonth = originDate === 31 ? MONTHS_WITH_30_DAYS.findLast(month => month < originMonth) ?? 1 : 1;
                if (originDate >= 30 && originMonth - months <= nearestShorterMonth) months++;
            } else if (years && originMonth === 1 && originDate === 29) months++;

            for (let i = 0; i < years; i++) await previousMonthButton.click({ modifiers: ['Shift'] });
            for (let i = 0; i < months; i++) await previousMonthButton.click();

            const firstDayCursorPosition = Number(await page.locator(`[data-first-month-day='1']`).getAttribute('data-cursor-position'));
            const dayOfMonth = page.locator(`[data-cursor-position='${firstDayCursorPosition + date.getDate() - 1}']`);

            for (let j = i; j >= 0; j--) await dayOfMonth.click();
        }

        await applyButton.click();
    };
};
