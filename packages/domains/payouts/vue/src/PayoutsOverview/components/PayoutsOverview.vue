<script setup lang="ts">
import { ref, computed } from 'vue';
import { BentoLoadingIndicator, BentoTypography, BentoModal } from '@adyen/bento-vue3';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import {
    DataOverviewError,
    getDataOverviewErrorInfo,
    getErrorMessage,
    getTimezoneAwareDateRangeQueryParams,
    useDataOverviewError,
} from '@integration-components/composables-vue';
import { quickSelectDateRanges, startOfDay } from '@integration-components/utils';
import PayoutsFilters from './PayoutsFilters.vue';
import PayoutsTable from './PayoutsTable.vue';
import PayoutDetailsContainer from '../../PayoutDetails/components/PayoutDetailsContainer.vue';
import { usePayoutsList } from '../composables/usePayoutsList';
import { EARLIEST_PAYOUT_SINCE_DATE } from '../constants';
import type { PayoutsOverviewProps } from '../types';
import type { IPayout } from '@integration-components/types';
import { usePayoutsContext } from '../../integration/context';
import { PAYOUTS_DATA_OVERVIEW_ACTION_KEYS, PAYOUTS_DATA_OVERVIEW_ERROR_KEYS, PAYOUTS_ERROR_MESSAGE_KEYS } from '../../integration/translationKeys';
import styles from './PayoutsOverview.module.scss';
import '@adyen/bento-vue3/styles/bento-light';
import { payoutsOverviewEventBridge, type PayoutDetailsEventMap, type PayoutsOverviewEmits, type PayoutsOverviewEventMap } from '../../events';

const props = defineProps<Omit<PayoutsOverviewProps, 'onFiltersChanged'>>();
const emit = defineEmits<PayoutsOverviewEmits>();
const hasContactSupportListener = payoutsOverviewEventBridge.hasListener('contactSupportRequested');
const hasPayoutSelectedListener = payoutsOverviewEventBridge.hasListener('payoutSelected');
payoutsOverviewEventBridge.provideEvents({
    contactSupportRequested: payload => emit('contactSupportRequested', payload),
    filtersChanged: payload => emit('filtersChanged', payload),
    payoutSelected: payload => emit('payoutSelected', payload),
});

const { balanceAccounts, i18n, provideTranslationOverrides, runtime } = usePayoutsContext();
provideTranslationOverrides();
const available = computed(() => runtime.available);
const filteredBalanceAccounts = computed(() => {
    const accounts = balanceAccounts.accounts;
    if (!props.balanceAccountId) return accounts;
    const account = accounts?.find(candidate => candidate.id === props.balanceAccountId);
    return account ? [account] : [];
});
const isBalanceAccountIdWrong = computed(
    () => !!props.balanceAccountId && !!balanceAccounts.accounts?.length && filteredBalanceAccounts.value?.length === 0
);
const overviewErrorInfo = computed(() =>
    getDataOverviewErrorInfo({
        balanceAccountsError: balanceAccounts.error,
        errorMessage: 'payouts.overview.errors.unavailable',
        errorKeys: PAYOUTS_ERROR_MESSAGE_KEYS,
        hasError: available.value === false,
        isBalanceAccountIdWrong: isBalanceAccountIdWrong.value,
        onContactSupport: props.onContactSupport || hasContactSupportListener.value ? requestContactSupport : undefined,
        overviewErrorKeys: PAYOUTS_DATA_OVERVIEW_ERROR_KEYS,
    })
);
const hasOverviewError = computed(() => !!overviewErrorInfo.value);

const initialDateRangeQueryParams = getTimezoneAwareDateRangeQueryParams({
    dateRange: quickSelectDateRanges.last30Days,
    earliestDate: startOfDay(new Date(EARLIEST_PAYOUT_SINCE_DATE)),
    timezone: 'UTC',
});

const filterParams = ref<{
    balanceAccountId: string | undefined;
    createdSince: string;
    createdUntil: string;
}>({
    balanceAccountId: undefined,
    ...initialDateRangeQueryParams,
});

function onFiltersChange(params: { balanceAccountId: string | undefined; createdSince: string; createdUntil: string }) {
    filterParams.value = params;
}

const activeBalanceAccount = computed(() => {
    const id = filterParams.value.balanceAccountId;
    return filteredBalanceAccounts.value?.find(account => account.id === id);
});

const payoutsListResult = usePayoutsList(() => ({
    fetchEnabled: available.value === true && !hasOverviewError.value && !!filterParams.value.balanceAccountId && !runtime.refreshing,
    balanceAccountId: filterParams.value.balanceAccountId,
    createdSince: filterParams.value.createdSince,
    createdUntil: filterParams.value.createdUntil,
    allowLimitSelection: props.allowLimitSelection,
    preferredLimit: props.preferredLimit,
    onFiltersChanged: onFiltersChanged,
}));

const isLoading = computed(
    () => payoutsListResult.fetching.value || balanceAccounts.loading || !filteredBalanceAccounts.value || !activeBalanceAccount.value
);

const payoutsError = computed(() => payoutsListResult.error.value as Error | undefined);
const listErrorInfo = computed(() =>
    getErrorMessage({
        error: payoutsError.value,
        keys: PAYOUTS_ERROR_MESSAGE_KEYS,
        message: 'payouts.overview.errors.listUnavailable',
        onContactSupport: props.onContactSupport || hasContactSupportListener.value ? requestContactSupport : undefined,
    })
);
const activeErrorInfo = computed(() => overviewErrorInfo.value ?? listErrorInfo.value);
const { presentation: errorPresentation } = useDataOverviewError({
    actionKeys: PAYOUTS_DATA_OVERVIEW_ACTION_KEYS,
    copyIcon: CopyIcon,
    errorInfo: activeErrorInfo,
    onRefresh: () => runtime.refresh(),
    refreshIcon: RefreshIcon,
    translate: (key, options) => i18n.get(key, options),
});
const tableErrorPresentation = computed(() => (payoutsError.value ? errorPresentation.value : undefined));

// ── Details modal ──
const isModalOpen = ref(false);
const selectedPayout = ref<IPayout | null>(null);

function showModal() {
    isModalOpen.value = true;
}

function requestContactSupport() {
    const payload: PayoutsOverviewEventMap['contactSupportRequested'] = { component: 'overview' };
    emit('contactSupportRequested', payload);
    props.onContactSupport?.();
}

function onFiltersChanged(payload: PayoutsOverviewEventMap['filtersChanged']) {
    emit('filtersChanged', payload);
}

function onRowClick(payout: IPayout) {
    if (props.showDetails === false && !props.onRecordSelection && !hasPayoutSelectedListener.value) return;
    selectedPayout.value = payout;
    const balanceAccountId = activeBalanceAccount.value?.id ?? '';

    // Notify the consumer first so they can intercept and decide whether to
    // call `showModal` themselves. If no consumer callback is provided we open
    // the modal directly (mirrors the Preact `useModalDetails.callback` flow).
    const payload: PayoutsOverviewEventMap['payoutSelected'] = {
        balanceAccountId,
        date: payout.createdAt ?? '',
        showModal,
    };
    emit('payoutSelected', payload);
    if (props.onRecordSelection) {
        props.onRecordSelection(payload);
    } else if (props.showDetails !== false) {
        showModal();
    }
}

function closeModal() {
    isModalOpen.value = false;
    selectedPayout.value = null;
}

function onDetailsContactSupportRequested(payload: PayoutDetailsEventMap['contactSupportRequested']) {
    emit('contactSupportRequested', payload);
    props.onContactSupport?.();
}
</script>

<template>
    <div :class="styles.root">
        <BentoLoadingIndicator v-if="available === undefined" />

        <DataOverviewError v-else-if="hasOverviewError" v-bind="errorPresentation" />

        <template v-else>
            <div v-if="!props.hideTitle" :class="styles.header">
                <BentoTypography variant="title">
                    {{ i18n.get('payouts.overview.title') }}
                </BentoTypography>
                <BentoTypography variant="body" :class="styles.description">
                    {{ i18n.get('payouts.overview.generateInfo') }}
                </BentoTypography>
            </div>

            <div role="toolbar" :class="styles.toolbar">
                <PayoutsFilters :balance-accounts="filteredBalanceAccounts" :on-change="onFiltersChange" />
            </div>

            <PayoutsTable
                :loading="isLoading"
                :data="payoutsListResult.records.value"
                :show-pagination="true"
                :error-presentation="tableErrorPresentation"
                :on-row-click="onRowClick"
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
                :aria-label="i18n.get('payouts.details.title')"
                @close-modal="closeModal"
            >
                <!-- Keep this default slot empty so Bento preserves its header layout without rendering a duplicate title. -->
                <template #default />
                <template #content>
                    <PayoutDetailsContainer
                        v-if="selectedPayout && activeBalanceAccount"
                        :id="activeBalanceAccount.id"
                        :balance-account-description="activeBalanceAccount.description"
                        :date="selectedPayout.createdAt ?? ''"
                        :data-customization="props.dataCustomization"
                        :show-contact-support="!!props.onContactSupport || hasContactSupportListener"
                        render-mode="modal"
                        @contact-support-requested="onDetailsContactSupportRequested"
                    />
                </template>
            </BentoModal>
        </template>
    </div>
</template>
