import { effectScope, ref } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Localization from '@integration-components/core/Localization';
import { useArrivalTime } from './useArrivalTime';

// The text shows the key with its count, which picks the plural form.
const MOCKED_I18N = {
    get: (key: string, options?: { values?: Record<string, unknown>; count?: number }) =>
        options?.count === undefined ? key : `${key} ${JSON.stringify(options.values)} count=${options.count}`,
};

const core: { getCdnConfig?: ReturnType<typeof vi.fn>; i18n: unknown } = { i18n: MOCKED_I18N };

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: () => core,
}));

const renderArrivalTime = (currency = ref<string | undefined>('EUR')) => {
    const scope = effectScope();
    const arrivalTime = scope.run(() => useArrivalTime(currency))!;
    return { arrivalTime, currency, stop: () => scope.stop() };
};

describe('useArrivalTime', () => {
    beforeEach(() => {
        // A new fetcher for every test, because the arrival times are loaded once per fetcher.
        core.getCdnConfig = vi.fn();
        core.i18n = MOCKED_I18N;
    });

    test('should tell the arrival time the CDN has for the currency', async () => {
        core.getCdnConfig!.mockResolvedValue({ defaultDuration: 'PT30M', durationByCurrency: { EUR: 'PT2H' } });
        const { arrivalTime, stop } = renderArrivalTime();

        await vi.waitFor(() => expect(arrivalTime.value).toBe('cashOut.common.arrivalTime.withinHours {"count":2} count=2'));

        stop();
    });

    test('should tell a duration under a minute as less than a minute', async () => {
        core.getCdnConfig!.mockResolvedValue({ defaultDuration: 'PT30M', durationByCurrency: { EUR: 'PT30S' } });
        const { arrivalTime, stop } = renderArrivalTime();

        await vi.waitFor(() => expect(arrivalTime.value).toBe('cashOut.common.arrivalTime.lessThanAMinute'));

        stop();
    });

    // So the text never waits for the CDN.
    test('should tell the bundled arrival time until the CDN answers', () => {
        core.getCdnConfig!.mockReturnValue(new Promise(() => {}));
        const { arrivalTime, stop } = renderArrivalTime();

        expect(arrivalTime.value).toBe('cashOut.common.arrivalTime.withinMinutes {"count":5} count=5');

        stop();
    });

    test('should tell the arrival time of the currency once it changes', async () => {
        core.getCdnConfig!.mockResolvedValue({ defaultDuration: 'PT30M', durationByCurrency: { EUR: 'PT2H' } });
        const { arrivalTime, currency, stop } = renderArrivalTime();
        await vi.waitFor(() => expect(arrivalTime.value).toContain('withinHours'));

        currency.value = 'SEK';

        expect(arrivalTime.value).toBe('cashOut.common.arrivalTime.withinMinutes {"count":30} count=30');

        stop();
    });

    test('should keep the bundled arrival times when the CDN fails', async () => {
        core.getCdnConfig!.mockRejectedValue(new Error('Network error'));
        const { arrivalTime, stop } = renderArrivalTime();

        await new Promise(resolve => setTimeout(resolve));

        expect(arrivalTime.value).toBe('cashOut.common.arrivalTime.withinMinutes {"count":5} count=5');

        stop();
    });

    test('should tell the bundled arrival time without a CDN', () => {
        delete core.getCdnConfig;
        const { arrivalTime, stop } = renderArrivalTime(ref('USD'));

        expect(arrivalTime.value).toBe('cashOut.common.arrivalTime.withinMinutes {"count":5} count=5');

        stop();
    });

    // The request and its success screen both show the arrival time.
    test('should load the arrival times once for the components of a page', async () => {
        core.getCdnConfig!.mockResolvedValue({ defaultDuration: 'PT30M', durationByCurrency: { EUR: 'PT2H' } });
        const { stop: stopRequest } = renderArrivalTime();
        const { arrivalTime: successScreenArrivalTime, stop: stopSuccessScreen } = renderArrivalTime();

        await vi.waitFor(() => expect(successScreenArrivalTime.value).toContain('withinHours'));

        expect(core.getCdnConfig).toHaveBeenCalledOnce();
        stopRequest();
        stopSuccessScreen();
    });

    // With the real translations: the phrase of each unit, its singular and plural forms, and the sentences that take it.
    describe('Texts', () => {
        const { i18n } = new Localization();
        const arrivalTimeFor = async (duration: string) => {
            core.getCdnConfig!.mockResolvedValue({ defaultDuration: 'PT30M', durationByCurrency: { EUR: duration } });
            const { arrivalTime, stop } = renderArrivalTime();
            await new Promise(resolve => setTimeout(resolve));
            const text = arrivalTime.value;
            stop();
            return text;
        };

        beforeEach(() => {
            core.i18n = i18n;
        });

        test.each([
            ['PT30S', 'in less than a minute'],
            ['PT1M', 'within 1 minute'],
            ['PT5M', 'within 5 minutes'],
            ['PT1H', 'within 1 hour'],
            ['PT2H', 'within 2 hours'],
            ['P1D', 'within 1 day'],
            ['P3D', 'within 3 days'],
        ])('should tell %s as "%s"', async (duration, text) => {
            expect(await arrivalTimeFor(duration)).toBe(text);
        });

        test.each([
            ['PT5M', 'Your money usually arrives within 5 minutes. Some transfers may take longer.'],
            ['PT1M', 'Your money usually arrives within 1 minute. Some transfers may take longer.'],
            ['PT30S', 'Your money usually arrives in less than a minute. Some transfers may take longer.'],
        ])('should fit %s into the summary', async (duration, text) => {
            const arrivalTime = await arrivalTimeFor(duration);

            expect(i18n.get('cashOut.request.summary.description', { values: { arrivalTime } })).toBe(text);
        });

        test.each([
            ['PT5M', 'You can expect your money to be in your account within 5 minutes. Some transfers may take longer.'],
            ['PT2H', 'You can expect your money to be in your account within 2 hours. Some transfers may take longer.'],
            ['PT30S', 'You can expect your money to be in your account in less than a minute. Some transfers may take longer.'],
        ])('should fit %s into the success screen', async (duration, text) => {
            const arrivalTime = await arrivalTimeFor(duration);

            expect(i18n.get('cashOut.request.success.description', { values: { arrivalTime } })).toBe(text);
        });
    });
});
