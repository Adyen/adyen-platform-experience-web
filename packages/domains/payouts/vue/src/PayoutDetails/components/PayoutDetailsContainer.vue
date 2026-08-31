<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { DataOverviewError, getErrorMessage, useDataOverviewError } from '@integration-components/composables-vue';
import { isFunction } from '@integration-components/utils';
import { BentoLoadingIndicator } from '@adyen/bento-vue3';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import PayoutData from './PayoutData.vue';
import { usePayoutDetails } from '../composables/usePayoutDetails';
import { PAYOUT_TABLE_FIELDS } from '../../PayoutsOverview/constants';
import type { PayoutDetailsCustomization } from '../types';
import type { CustomDataRetrieved } from '@integration-components/types';
import styles from './PayoutDetailsContainer.module.scss';
import { usePayoutsContext } from '../../integration/context';
import { PAYOUTS_DATA_OVERVIEW_ACTION_KEYS, PAYOUTS_ERROR_MESSAGE_KEYS } from '../../integration/translationKeys';
import type { PayoutDetailsRenderMode } from '../../integration/types';
import { payoutDetailsEventBridge, type PayoutDetailsEmits, type PayoutDetailsEventMap } from '../../events';
import '@adyen/bento-vue3/styles/bento-light';

const props = withDefaults(
    defineProps<{
        id: string;
        date: string;
        balanceAccountDescription?: string;
        hideTitle?: boolean;
        onContactSupport?: () => void;
        showContactSupport?: boolean;
        dataCustomization?: { details?: PayoutDetailsCustomization };
        renderMode: PayoutDetailsRenderMode;
    }>(),
    { showContactSupport: undefined }
);
const emit = defineEmits<PayoutDetailsEmits>();
const hasContactSupportListener = payoutDetailsEventBridge.hasListener('contactSupportRequested');
const canContactSupport = computed(() => props.showContactSupport ?? (!!props.onContactSupport || hasContactSupportListener.value));
payoutDetailsEventBridge.provideEvents({
    contactSupportRequested: payload => emit('contactSupportRequested', payload),
});

const { balanceAccounts, i18n, provideTranslationOverrides, runtime } = usePayoutsContext();
if (props.renderMode === 'standalone') provideTranslationOverrides();

const { data, error, isFetching } = usePayoutDetails(() => ({
    fetchEnabled: runtime.available === true && !!props.id && !!props.date,
    balanceAccountId: props.id,
    createdAt: props.date,
}));

const resolvedBalanceAccountDescription = computed(
    () => props.balanceAccountDescription || balanceAccounts.accounts?.find(account => account.id === props.id)?.description
);

// Extra (consumer-supplied) fields, retrieved via dataCustomization.details.onDataRetrieve.
// Re-fetched whenever the underlying details data changes.
const extraFields = ref<Record<string, any> | undefined>(undefined);
const PAYOUT_RESERVED = new Set<string>(PAYOUT_TABLE_FIELDS);
let extraFieldsRequestId = 0;

watch(
    () => [data.value, props.dataCustomization] as const,
    async ([newData]) => {
        const requestId = ++extraFieldsRequestId;
        const detailsCustomization = props.dataCustomization?.details;
        if (!newData || !detailsCustomization || !isFunction(detailsCustomization.onDataRetrieve)) {
            extraFields.value = undefined;
            return;
        }
        const retrieved = (await detailsCustomization.onDataRetrieve(newData)) as CustomDataRetrieved | undefined;
        if (requestId !== extraFieldsRequestId) return;
        if (!retrieved) {
            extraFields.value = undefined;
            return;
        }
        const fields = (detailsCustomization.fields ?? []).reduce<Record<string, any>>((acc, field) => {
            const key = typeof field?.key === 'string' ? field.key : '';
            if (!key) return acc;
            if (PAYOUT_RESERVED.has(key)) return acc;
            if (field?.visibility === 'hidden') return acc;
            if (retrieved[key] !== undefined) acc[key] = retrieved[key];
            return acc;
        }, {});
        extraFields.value = fields;
    },
    { immediate: true }
);

const activeError = computed(() => (runtime.available === false ? new Error() : error.value));
const requestContactSupport = () => {
    const payload: PayoutDetailsEventMap['contactSupportRequested'] = { component: 'details' };
    emit('contactSupportRequested', payload);
    props.onContactSupport?.();
};
const errorInfo = computed(() =>
    runtime.available === false
        ? // Mirrors the Preact ConfigProvider permission-unavailable composition.
          { title: 'payouts.errors.somethingWentWrong', messages: ['payouts.details.errors.unavailable', 'payouts.errors.contactSupport'] }
        : getErrorMessage({
              error: activeError.value,
              keys: PAYOUTS_ERROR_MESSAGE_KEYS,
              message: 'payouts.details.errors.unavailable',
              onContactSupport: canContactSupport.value ? requestContactSupport : undefined,
          })
);
const { presentation: errorPresentation } = useDataOverviewError({
    actionKeys: PAYOUTS_DATA_OVERVIEW_ACTION_KEYS,
    copyIcon: CopyIcon,
    errorInfo,
    onRefresh: () => runtime.refresh(),
    refreshIcon: RefreshIcon,
    translate: (key, options) => i18n.get(key, options),
});
const showError = computed(() => !!activeError.value);
const showLoadingPlaceholder = computed(() => runtime.available === undefined || (isFetching.value && !data.value && !activeError.value));

onUnmounted(() => {
    extraFieldsRequestId++;
});
</script>

<template>
    <div>
        <div v-if="showError">
            <DataOverviewError v-bind="errorPresentation" join-messages />
        </div>

        <div v-else-if="showLoadingPlaceholder" :class="styles.loading" aria-busy="true">
            <BentoLoadingIndicator />
        </div>

        <PayoutData
            v-else-if="data"
            :payout="data"
            :balance-account-id="props.id"
            :balance-account-description="resolvedBalanceAccountDescription"
            :extra-fields="extraFields"
            :data-customization="props.dataCustomization"
            :hide-title="props.hideTitle"
            :render-mode="props.renderMode"
        />
    </div>
</template>
