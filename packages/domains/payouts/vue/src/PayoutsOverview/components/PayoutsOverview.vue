<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { BentoTypography, BentoModal } from '@adyen/bento-vue3';
import { quickSelectDateRanges } from '@integration-components/utils';
import PayoutsFilters from './PayoutsFilters.vue';
import PayoutsTable from './PayoutsTable.vue';
import PayoutDetailsContainer from '../../PayoutDetails/components/PayoutDetailsContainer.vue';
import { usePayoutsList } from '../composables/usePayoutsList';
import { BASE_CLASS } from '../constants';
import type { IBalanceAccountBase, PayoutsOverviewExternalProps } from '../types';
import type { IPayout } from '@integration-components/types';
import '../styles/index.scss';

const props = defineProps<{
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    hideTitle?: boolean;
    showDetails?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
    onRecordSelection?: PayoutsOverviewExternalProps['onRecordSelection'];
    dataCustomization?: PayoutsOverviewExternalProps['dataCustomization'];
    balanceAccounts: IBalanceAccountBase[] | undefined;
    isLoadingBalanceAccount: boolean;
}>();

const { i18n } = useCoreContext();

const filterParams = ref<{
    balanceAccountId: string | undefined;
    createdSince: string;
    createdUntil: string;
}>({
    balanceAccountId: undefined,
    createdSince: new Date(quickSelectDateRanges.last30Days.startDate).toISOString(),
    createdUntil: new Date(quickSelectDateRanges.last30Days.endDate).toISOString(),
});

function onFiltersChange(params: { balanceAccountId: string | undefined; createdSince: string; createdUntil: string }) {
    filterParams.value = params;
}

const activeBalanceAccount = computed(() => {
    const id = filterParams.value.balanceAccountId;
    return props.balanceAccounts?.find((a: IBalanceAccountBase) => a.id === id);
});

const payoutsListResult = usePayoutsList(() => ({
    fetchEnabled: !!filterParams.value.balanceAccountId,
    balanceAccountId: filterParams.value.balanceAccountId,
    createdSince: filterParams.value.createdSince,
    createdUntil: filterParams.value.createdUntil,
    allowLimitSelection: props.allowLimitSelection,
    preferredLimit: props.preferredLimit,
    onFiltersChanged: props.onFiltersChanged,
}));

const isLoading = computed(
    () => payoutsListResult.fetching.value || props.isLoadingBalanceAccount || !props.balanceAccounts || !activeBalanceAccount.value
);

const payoutsError = computed(() => payoutsListResult.error.value as Error | undefined);

// ── Details modal ──
const isModalOpen = ref(false);
const selectedPayout = ref<IPayout | null>(null);

function showModal() {
    isModalOpen.value = true;
}

function onRowClick(payout: IPayout) {
    if (props.showDetails === false && !props.onRecordSelection) return;
    selectedPayout.value = payout;
    const balanceAccountId = activeBalanceAccount.value?.id ?? '';

    // Notify the consumer first so they can intercept and decide whether to
    // call `showModal` themselves. If no consumer callback is provided we open
    // the modal directly (mirrors the Preact `useModalDetails.callback` flow).
    if (props.onRecordSelection) {
        props.onRecordSelection({
            balanceAccountId,
            date: payout.createdAt ?? '',
            showModal,
        });
    } else if (props.showDetails !== false) {
        showModal();
    }
}

function closeModal() {
    isModalOpen.value = false;
    selectedPayout.value = null;
}
</script>

<template>
    <div :class="BASE_CLASS">
        <div v-if="!props.hideTitle" class="adyen-pe-payouts-overview-header">
            <BentoTypography variant="title">{{ i18n.get('payouts.overview.title') }}</BentoTypography>
            <BentoTypography variant="body" class="adyen-pe-payouts-overview-header__description">{{
                i18n.get('payouts.overview.generateInfo')
            }}</BentoTypography>
        </div>

        <div role="toolbar" class="adyen-pe-payouts-overview__toolbar">
            <PayoutsFilters :balance-accounts="props.balanceAccounts" :on-change="onFiltersChange" />
        </div>

        <PayoutsTable
            :balance-account-id="activeBalanceAccount?.id"
            :loading="isLoading"
            :data="payoutsListResult.records.value"
            :show-pagination="true"
            :show-details="props.showDetails"
            :error="payoutsError"
            :on-row-click="onRowClick"
            :on-contact-support="props.onContactSupport"
            :custom-columns="props.dataCustomization?.list?.fields"
            :on-data-retrieve="props.dataCustomization?.list?.onDataRetrieve"
            :has-next="payoutsListResult.hasNext.value"
            :has-previous="payoutsListResult.hasPrevious.value"
            :go-to-next-page="payoutsListResult.goToNextPage"
            :go-to-previous-page="payoutsListResult.goToPreviousPage"
            :limit="payoutsListResult.limit.value"
            :limit-options="payoutsListResult.limitOptions.value"
            :update-limit="payoutsListResult.updateLimit"
            :current-page="payoutsListResult.page.value + 1"
        />

        <BentoModal
            :is-open="isModalOpen"
            size="medium"
            :is-dismissible="true"
            @close-modal="closeModal"
            :aria-label="i18n.get('payouts.details.title')"
        >
            {{ i18n.get('payouts.details.title') }}
            <template #content>
                <PayoutDetailsContainer
                    v-if="selectedPayout && activeBalanceAccount"
                    :id="activeBalanceAccount.id"
                    :balance-account-description="activeBalanceAccount.description"
                    :date="selectedPayout.createdAt ?? ''"
                    :on-contact-support="props.onContactSupport"
                />
            </template>
        </BentoModal>
    </div>
</template>
