import { inject, provide, type InjectionKey } from 'vue';
import { useEventDispatcherContext } from '@integration-components/core/vue';
import type { AdyenPlatformExperienceError } from '@integration-components/core';
import type { AdditionalEventProperties, MixpanelProperty } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { getCountBucket, getErrorReturnValue } from '@integration-components/cashOut/domain';
import { isSearchable } from '../utils/isSearchable';
import { wasSearched } from '../utils/wasSearched';

export const CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY = 'CashOut overview component';
export const CASH_OUT_REQUEST_ANALYTICS_CATEGORY = 'CashOut request component';

type Properties = Record<string, MixpanelProperty>;

/** The buttons whose clicks are told, so a typo can't make up another event in Mixpanel. */
export type CashOutButtonLabel = 'Start instant CashOut' | 'Cash out now' | 'Close' | 'Refresh' | 'Contact support';

/** The requests whose failures are told. */
export type CashOutFailedRequest = 'balanceAccounts' | 'eligibility' | 'fees' | 'instruct';

/** The events sent with `track`; landings and errors have their own ways of being sent. */
type CashOutTrackedEvents = {
    'Clicked button': Properties & { label: CashOutButtonLabel; step?: 'form' | 'result' };
    'Completed cashOut': Properties;
    'Changed amount': Properties;
    'Changed balance account': Properties;
    'Changed bank account': Properties;
};

export type CashOutAnalyticsContext = {
    category: typeof CASH_OUT_OVERVIEW_ANALYTICS_CATEGORY | typeof CASH_OUT_REQUEST_ANALYTICS_CATEGORY;
    subCategory: 'Overview' | 'Request';
    /** When the request was started, as `Date.now()`, so a completed cashOut tells how long it took. */
    startedAt?: number;
};

const CASH_OUT_ANALYTICS_CONTEXT_KEY: InjectionKey<CashOutAnalyticsContext> = Symbol('cashOutAnalyticsContext');

const createCashOutAnalytics = (context: CashOutAnalyticsContext) => {
    const userEvents = useEventDispatcherContext();

    /** The properties of an event of this part of the component; amounts and identifiers are never among them. */
    const getProperties = (properties: Properties = {}): AdditionalEventProperties => ({
        category: context.category,
        subCategory: context.subCategory,
        ...properties,
    });

    const send = (event: string, properties: Properties) => userEvents.addEvent?.(event, getProperties(properties));

    const track = <Event extends keyof CashOutTrackedEvents>(event: Event, properties: CashOutTrackedEvents[Event]) => send(event, properties);

    /** A request that failed, with what went wrong as precisely as its error tells it. */
    const trackBackendError = (request: CashOutFailedRequest, error: AdyenPlatformExperienceError | undefined) =>
        send('Encountered error', { returnType: 'backend', returnValue: getErrorReturnValue(error), request });

    /** An error the amount field starts showing, or one of the amount the form finds. */
    const trackValidationError = (returnValue: string) => send('Encountered error', { returnType: 'validation', returnValue, field: 'amount' });

    /**
     * Another option chosen in a dropdown of accounts, with how many there are and whether it was searched for. The selected option
     * chosen again is not told.
     */
    const trackSelection = (
        event: 'Changed balance account' | 'Changed bank account',
        { countProperty, nextValue, options, previousValue, root }: SelectionChange
    ) => {
        if (nextValue === previousValue) return;
        const previousLabel = options.find(option => option.value === previousValue)?.label;
        track(event, {
            usedSearch: isSearchable(options) && wasSearched(root, previousLabel),
            [countProperty]: getCountBucket(options.length),
        });
    };

    /** Starts timing the request, once. */
    const markStarted = () => {
        context.startedAt ??= Date.now();
    };

    /** How long ago the request was started, in whole seconds, if it was. */
    const getSecondsSinceStart = () => (context.startedAt === undefined ? undefined : Math.round((Date.now() - context.startedAt) / 1000));

    return { getProperties, getSecondsSinceStart, markStarted, track, trackBackendError, trackSelection, trackValidationError };
};

export type CashOutAnalytics = ReturnType<typeof createCashOutAnalytics>;

type SelectionChange = {
    countProperty: 'balanceAccountCount' | 'bankAccountCount';
    nextValue: string;
    options: { label: string; value: string }[];
    previousValue: string | undefined;
    root: Element | null | undefined;
};

/**
 * Tells the components under it which component, and which part of it, their events belong to: the request in the modal of the overview
 * belongs to the overview, while the standalone request is a component of its own. Returns what the providing component sends its own
 * events with, as it can't inject what it provides.
 */
export const provideCashOutAnalytics = (context: CashOutAnalyticsContext) => {
    provide(CASH_OUT_ANALYTICS_CONTEXT_KEY, context);
    return createCashOutAnalytics(context);
};

export const useCashOutAnalytics = () =>
    createCashOutAnalytics(
        inject<CashOutAnalyticsContext>(CASH_OUT_ANALYTICS_CONTEXT_KEY, {
            category: CASH_OUT_REQUEST_ANALYTICS_CATEGORY,
            subCategory: 'Request',
        })
    );
