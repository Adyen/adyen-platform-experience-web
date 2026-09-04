import { ref } from 'vue';
import { useConfigContext, useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import type { IMissingActionType } from '@integration-components/types';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { GRANT_ACTION_CONFIGS, sharedCapitalOverviewAnalyticsEventProperties } from '../../../../domain/src/CapitalOverview/constants';

const getTopWindowHref = () => window.top?.location.href || window.location.href;

const redirectTopWindow = (url: string) => {
    if (window.top) {
        window.top.location.href = url;
    } else {
        window.location.href = url;
    }
};

export const useHostedAction = () => {
    const { i18n } = useCoreContext();
    const config = useConfigContext();
    const userEvents = useEventDispatcherContext();
    const loadingAction = ref<IMissingActionType>();
    const error = ref<Error>();

    const redirectToHostedAction = async (actionType: IMissingActionType) => {
        const endpoint = actionType === 'AnaCredit' ? config.endpoints.anaCreditActionDetails : config.endpoints.signToSActionDetails;

        if (!endpoint) {
            loadingAction.value = undefined;
            return;
        }

        loadingAction.value = actionType;
        error.value = undefined;

        try {
            const response = await endpoint(EMPTY_OBJECT, {
                query: { locale: i18n.locale, redirectUrl: getTopWindowHref() },
            });

            if (response.url) {
                redirectTopWindow(response.url);
            } else {
                loadingAction.value = undefined;
            }
        } catch (requestError) {
            error.value = requestError as Error;
            loadingAction.value = undefined;
        }
    };

    const handleActionClick = (actionType: IMissingActionType) => {
        try {
            void redirectToHostedAction(actionType);
        } finally {
            userEvents.addEvent?.('Clicked link', {
                ...sharedCapitalOverviewAnalyticsEventProperties,
                subCategory: 'Missing action',
                label: GRANT_ACTION_CONFIGS[actionType].eventLabel,
            });
        }
    };

    return { error, handleActionClick, loadingAction } as const;
};
