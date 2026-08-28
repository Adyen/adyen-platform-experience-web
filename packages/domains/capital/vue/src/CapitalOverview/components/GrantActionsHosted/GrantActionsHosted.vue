<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoAlert, BentoButton } from '@adyen/bento-vue3';
import { useTimezoneAwareDateFormatting } from '@integration-components/composables-vue';
import { useConfigContext, useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import type { IMissingAction, IMissingActionType } from '@integration-components/types';
import { EMPTY_OBJECT, DATE_FORMAT_MISSING_ACTION } from '@integration-components/utils';
import { GRANT_ACTION_CONFIGS, sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import styles from './GrantActionsHosted.module.scss';

const props = defineProps<{
    className?: string;
    expirationDate?: string;
    missingActions: IMissingAction[];
}>();

const { i18n, refreshComponent } = useCoreContext();
const config = useConfigContext();
const userEvents = useEventDispatcherContext();
const { dateFormat } = useTimezoneAwareDateFormatting();
const loadingAction = ref<IMissingActionType>();
const error = ref<Error>();

const formattedExpirationDate = computed(() => (props.expirationDate ? dateFormat(props.expirationDate, DATE_FORMAT_MISSING_ACTION) : undefined));
const alertTitle = computed(() => {
    const key =
        props.missingActions.length > 1 ? 'capital.overview.grants.item.alerts.actionNeededMany' : 'capital.overview.grants.item.alerts.actionNeeded';
    const keyWithDate =
        props.missingActions.length > 1
            ? 'capital.overview.grants.item.alerts.actionNeededByMany'
            : 'capital.overview.grants.item.alerts.actionNeededBy';

    return formattedExpirationDate.value ? i18n.get(keyWithDate, { values: { date: formattedExpirationDate.value } }) : i18n.get(key);
});

const getTopWindowHref = () => window.top?.location.href || window.location.href;

const redirectTopWindow = (url: string) => {
    if (window.top) {
        window.top.location.href = url;
    } else {
        window.location.href = url;
    }
};

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
</script>

<template>
    <BentoAlert v-if="error" :class="props.className" type="critical">
        {{ i18n.get('capital.overview.grants.item.alerts.somethingWentWrong') }}
        <template #actions>
            <BentoButton :class="styles.button" @click="refreshComponent">
                {{ i18n.get('common.actions.refresh.labels.default') }}
            </BentoButton>
        </template>
    </BentoAlert>

    <BentoAlert v-else :class="props.className" type="warning">
        {{ alertTitle }}
        <template #description>
            <ol v-if="props.missingActions.length > 1" :class="styles.actionsContainer">
                <li v-for="action in props.missingActions" :key="action.type">
                    <BentoButton
                        :class="styles.button"
                        variant="tertiary"
                        :aria-label="i18n.get(GRANT_ACTION_CONFIGS[action.type].buttonLabelKey)"
                        :disabled="!!loadingAction"
                        :state="loadingAction === action.type ? 'loading' : undefined"
                        @click="handleActionClick(action.type)"
                    >
                        {{ i18n.get(GRANT_ACTION_CONFIGS[action.type].buttonLabelKey) }}
                    </BentoButton>
                </li>
            </ol>
            <BentoButton
                v-else
                :class="styles.button"
                variant="tertiary"
                :aria-label="i18n.get(GRANT_ACTION_CONFIGS[props.missingActions[0]!.type].buttonLabelKey)"
                :disabled="!!loadingAction"
                :state="loadingAction === props.missingActions[0]?.type ? 'loading' : undefined"
                @click="handleActionClick(props.missingActions[0]!.type)"
            >
                {{ i18n.get(GRANT_ACTION_CONFIGS[props.missingActions[0]!.type].buttonLabelKey) }}
            </BentoButton>
        </template>
    </BentoAlert>
</template>
