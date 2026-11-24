/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h } from 'vue';
import {
    CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY,
    CASH_OUT_REQUEST_ANALYTICS_CATEGORY,
    provideCashOutAnalytics,
    useCashOutAnalytics,
    type CashOutAnalyticsContext,
} from './useCashOutAnalytics';

const { addEvent } = vi.hoisted(() => ({ addEvent: vi.fn() }));

vi.mock('@integration-components/core/vue', () => ({
    useEventDispatcherContext: () => ({ addEvent }),
}));

// A component that sends an event, under a component that provides the context, if any
const sendEventUnder = (context: CashOutAnalyticsContext | undefined) => {
    const Child = defineComponent({
        setup() {
            useCashOutAnalytics().track('Clicked button', { label: 'Refresh' });
            return () => null;
        },
    });
    const app = createApp({
        setup() {
            if (context) provideCashOutAnalytics(context);
            return () => h(Child);
        },
    });
    app.mount(document.createElement('div'));
    app.unmount();
};

describe('useCashOutAnalytics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should send events with the category and subcategory of the part of the component they belong to', () => {
        sendEventUnder({ category: CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY, subCategory: 'Request' });

        expect(addEvent).toHaveBeenCalledWith('Clicked button', {
            category: CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY,
            subCategory: 'Request',
            label: 'Refresh',
        });
    });

    test('should send the events of the component providing the context with that context', () => {
        const app = createApp({
            setup() {
                provideCashOutAnalytics({ category: CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY, subCategory: 'Overview' }).track('Clicked button', {
                    label: 'Start instant CashOut',
                });
                return () => null;
            },
        });
        app.mount(document.createElement('div'));
        app.unmount();

        expect(addEvent).toHaveBeenCalledWith('Clicked button', {
            category: CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY,
            subCategory: 'Overview',
            label: 'Start instant CashOut',
        });
    });

    test('should send events as the request without a context', () => {
        sendEventUnder(undefined);

        expect(addEvent).toHaveBeenCalledWith('Clicked button', {
            category: CASH_OUT_REQUEST_ANALYTICS_CATEGORY,
            subCategory: 'Request',
            label: 'Refresh',
        });
    });

    describe('Sending', () => {
        const REQUEST = { category: CASH_OUT_REQUEST_ANALYTICS_CATEGORY, subCategory: 'Request' };
        // Runs the given use of the analytics in a component, without a context
        const withAnalytics = (use: (analytics: ReturnType<typeof useCashOutAnalytics>) => void) => {
            const app = createApp({
                setup() {
                    use(useCashOutAnalytics());
                    return () => null;
                },
            });
            app.mount(document.createElement('div'));
            app.unmount();
        };

        test('should tell a failed request with what went wrong', () => {
            withAnalytics(({ trackBackendError }) => trackBackendError('fees', { type: 'HTTP_ERROR', status: '500' } as never));

            expect(addEvent).toHaveBeenCalledWith('Encountered error', { ...REQUEST, returnType: 'backend', returnValue: '500', request: 'fees' });
        });

        test('should tell an error of the amount', () => {
            withAnalytics(({ trackValidationError }) => trackValidationError('excess'));

            expect(addEvent).toHaveBeenCalledWith('Encountered error', {
                ...REQUEST,
                returnType: 'validation',
                returnValue: 'excess',
                field: 'amount',
            });
        });

        test('should tell another option chosen in a dropdown of accounts, but not the selected one chosen again', () => {
            const options = [
                { label: 'Main', value: 'BA1' },
                { label: 'Savings', value: 'BA2' },
            ];
            const root = document.createElement('div');
            root.innerHTML = '<input role="combobox" />';

            withAnalytics(({ trackSelection }) => {
                trackSelection('Changed balance account', {
                    countProperty: 'balanceAccountCount',
                    nextValue: 'BA1',
                    options,
                    previousValue: 'BA1',
                    root,
                });
                trackSelection('Changed balance account', {
                    countProperty: 'balanceAccountCount',
                    nextValue: 'BA2',
                    options,
                    previousValue: 'BA1',
                    root,
                });
            });

            expect(addEvent.mock.calls).toEqual([['Changed balance account', { ...REQUEST, usedSearch: false, balanceAccountCount: '2-9' }]]);
        });

        // Checked when the types are, so a typo can't make up another event in Mixpanel
        test('should only send the known button labels and failed requests', () => {
            withAnalytics(({ track, trackBackendError }) => {
                track('Clicked button', { label: 'Cash out now' });
                // @ts-expect-error An unknown button label
                track('Clicked button', { label: 'Cash out' });
                // @ts-expect-error An unknown request
                trackBackendError('payouts', undefined);
                // @ts-expect-error Errors are sent through their own functions
                track('Encountered error', {});
            });

            expect(addEvent).toHaveBeenCalledWith('Clicked button', { ...REQUEST, label: 'Cash out now' });
        });

        test('should time the request from when it was first started', () => {
            vi.useFakeTimers();
            const seconds: (number | undefined)[] = [];
            const app = createApp({
                setup() {
                    const analytics = provideCashOutAnalytics({ category: CASH_OUT_REQUEST_ANALYTICS_CATEGORY, subCategory: 'Request' });
                    seconds.push(analytics.getSecondsSinceStart());
                    analytics.markStarted();
                    vi.advanceTimersByTime(10_000);
                    analytics.markStarted();
                    vi.advanceTimersByTime(5_400);
                    seconds.push(analytics.getSecondsSinceStart());
                    return () => null;
                },
            });
            app.mount(document.createElement('div'));
            app.unmount();
            vi.useRealTimers();

            expect(seconds).toEqual([undefined, 15]);
        });
    });
});
