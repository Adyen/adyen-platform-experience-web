<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useBalanceAccounts } from '@integration-components/composables-vue';
import { isFunction } from '@integration-components/utils';
import { BentoButton, BentoLoadingIndicator } from '@adyen/bento-vue3';
import PayoutData from './PayoutData.vue';
import { usePayoutDetails } from '../composables/usePayoutDetails';
import { PAYOUT_TABLE_FIELDS } from '../../PayoutsOverview/constants';
import type { PayoutDetailsCustomization } from '../types';
import type { CustomDataRetrieved } from '@integration-components/types';
import './PayoutDetailsContainer.scss';

const props = defineProps<{
    id: string;
    date: string;
    balanceAccountDescription?: string;
    onContactSupport?: () => void;
    dataCustomization?: { details?: PayoutDetailsCustomization };
}>();

const { i18n } = useCoreContext();

const { data, error, isFetching } = usePayoutDetails(() => ({
    fetchEnabled: !!props.id && !!props.date,
    balanceAccountId: props.id,
    createdAt: props.date,
}));

// Balance-account description fallback: only fetched when consumer doesn't pass one.
const hasDescription = computed(() => !!props.balanceAccountDescription);
const { balanceAccounts } = useBalanceAccounts(
    () => props.id,
    () => !hasDescription.value
);

const resolvedBalanceAccountDescription = computed(() => props.balanceAccountDescription || balanceAccounts.value?.[0]?.description);

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

const showError = computed(() => !!error.value);
const showLoadingPlaceholder = computed(() => isFetching.value && !data.value && !error.value);
</script>

<template>
    <div class="adyen-pe-payout-details">
        <div v-if="showError" class="adyen-pe-data-overview-error">
            <p>{{ i18n.get('payouts.details.errors.unavailable') }}</p>
            <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport.labels.default') }}
            </BentoButton>
        </div>

        <div v-else-if="showLoadingPlaceholder" class="adyen-pe-payout-details__loading" aria-busy="true">
            <BentoLoadingIndicator />
        </div>

        <PayoutData
            v-else-if="data"
            :payout="data"
            :balance-account-id="props.id"
            :balance-account-description="resolvedBalanceAccountDescription"
            :extra-fields="extraFields"
            :data-customization="props.dataCustomization"
        />
    </div>
</template>
