<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useBalanceAccounts, ErrorMessageDisplay } from '@integration-components/composables-vue';
import { isFunction } from '@integration-components/utils';
import { BentoLoadingIndicator } from '@adyen/bento-vue3';
import PayoutData from './PayoutData.vue';
import { usePayoutDetails } from '../composables/usePayoutDetails';
import { PAYOUT_TABLE_FIELDS } from '../../PayoutsOverview/constants';
import type { PayoutDetailsCustomization } from '../types';
import type { CustomDataRetrieved } from '@integration-components/types';
import styles from './PayoutDetailsContainer.module.scss';
import '@adyen/bento-vue3/styles/bento-light';

const props = defineProps<{
    id: string;
    date: string;
    balanceAccountDescription?: string;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    dataCustomization?: { details?: PayoutDetailsCustomization };
}>();

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
    <div>
        <div v-if="showError">
            <ErrorMessageDisplay
                :error="error"
                :error-message="'payouts.details.errors.unavailable'"
                :on-contact-support="props.onContactSupport"
                with-image
                :outlined="false"
                :absolute-position="false"
                :with-background="false"
            />
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
        />
    </div>
</template>
