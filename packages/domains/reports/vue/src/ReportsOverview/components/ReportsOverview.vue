<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoLoadingIndicator, BentoTypography } from '@adyen/bento-vue3';
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
import { EARLIEST_REPORT_SINCE_DATE } from '../../../../domain/src';
import { useReportsList } from '../composables/useReportsList';
import { useReportsContext } from '../../integration/context';
import { REPORTS_DATA_OVERVIEW_ACTION_KEYS, REPORTS_DATA_OVERVIEW_ERROR_KEYS, REPORTS_ERROR_MESSAGE_KEYS } from '../../integration/translationKeys';
import type { ReportsOverviewDomainProps } from '../../integration/types';
import ReportsFilters from './ReportsFilters.vue';
import ReportsTable from './ReportsTable.vue';
import styles from './ReportsOverview.module.scss';
import '@adyen/bento-vue3/styles/bento-light';
import { reportsOverviewEventBridge, type ReportsOverviewEmits } from '../../events';

const props = defineProps<Omit<ReportsOverviewDomainProps, 'onFiltersChanged'>>();
const emit = defineEmits<ReportsOverviewEmits>();
const hasContactSupportListener = reportsOverviewEventBridge.hasListener('contactSupportRequested');
reportsOverviewEventBridge.provideEvents({
    contactSupportRequested: payload => emit('contactSupportRequested', payload),
    filtersChanged: payload => emit('filtersChanged', payload),
});

const { balanceAccounts, i18n, provideTranslationOverrides, runtime } = useReportsContext();
provideTranslationOverrides();
const requestContactSupport = () => {
    emit('contactSupportRequested', { component: 'overview' });
    props.onContactSupport?.();
};
const available = computed(() => runtime.available);
const filteredBalanceAccounts = computed(() => {
    const accounts = balanceAccounts.accounts;
    if (!props.balanceAccountId) return accounts;
    const account = accounts?.find(candidate => props.balanceAccountId === candidate.id);
    return account ? [account] : [];
});
const isBalanceAccountIdWrong = computed(
    () => !!props.balanceAccountId && !!balanceAccounts.accounts?.length && filteredBalanceAccounts.value?.length === 0
);
const overviewErrorInfo = computed(() =>
    getDataOverviewErrorInfo({
        balanceAccountsError: balanceAccounts.error,
        errorMessage: 'reports.overview.errors.unavailable',
        errorKeys: REPORTS_ERROR_MESSAGE_KEYS,
        hasError: available.value === false,
        isBalanceAccountIdWrong: isBalanceAccountIdWrong.value,
        onContactSupport: props.onContactSupport || hasContactSupportListener.value ? requestContactSupport : undefined,
        overviewErrorKeys: REPORTS_DATA_OVERVIEW_ERROR_KEYS,
    })
);
const hasOverviewError = computed(() => !!overviewErrorInfo.value);

const initialDateRangeQueryParams = getTimezoneAwareDateRangeQueryParams({
    dateRange: quickSelectDateRanges.last30Days,
    earliestDate: startOfDay(new Date(EARLIEST_REPORT_SINCE_DATE)),
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

const reportsListResult = useReportsList(() => ({
    fetchEnabled: available.value === true && !hasOverviewError.value && !!filterParams.value.balanceAccountId && !runtime.refreshing,
    balanceAccountId: filterParams.value.balanceAccountId,
    createdSince: filterParams.value.createdSince,
    createdUntil: filterParams.value.createdUntil,
    allowLimitSelection: props.allowLimitSelection,
    preferredLimit: props.preferredLimit,
    onFiltersChanged: filters => emit('filtersChanged', filters),
}));

const isLoading = computed(
    () => reportsListResult.fetching.value || balanceAccounts.loading || !filteredBalanceAccounts.value || !activeBalanceAccount.value
);
const listError = computed(() => reportsListResult.error.value as Error | undefined);
const listErrorInfo = computed(() =>
    getErrorMessage({
        error: listError.value,
        keys: REPORTS_ERROR_MESSAGE_KEYS,
        message: 'reports.overview.errors.listUnavailable',
        onContactSupport: props.onContactSupport || hasContactSupportListener.value ? requestContactSupport : undefined,
    })
);
const activeErrorInfo = computed(() => overviewErrorInfo.value ?? listErrorInfo.value);
const { presentation: errorPresentation } = useDataOverviewError({
    actionKeys: REPORTS_DATA_OVERVIEW_ACTION_KEYS,
    copyIcon: CopyIcon,
    errorInfo: activeErrorInfo,
    onRefresh: () => runtime.refresh(),
    refreshIcon: RefreshIcon,
    translate: (key, options) => i18n.get(key, options),
});
const tableErrorPresentation = computed(() => (listError.value ? errorPresentation.value : undefined));
</script>

<template>
    <div :class="styles.root">
        <BentoLoadingIndicator v-if="available === undefined" />

        <DataOverviewError v-else-if="hasOverviewError" v-bind="errorPresentation" />

        <template v-else>
            <div v-if="!props.hideTitle" :class="styles.header">
                <BentoTypography variant="title">
                    {{ i18n.get('reports.overview.title') }}
                </BentoTypography>
                <BentoTypography variant="body" :class="styles.description">
                    {{ i18n.get('reports.overview.generateInfo') }}
                </BentoTypography>
            </div>

            <ReportsFilters :balance-accounts="filteredBalanceAccounts" :on-change="onFiltersChange" />

            <ReportsTable
                :balance-account-id="activeBalanceAccount?.id"
                :loading="isLoading"
                :data="reportsListResult.records.value"
                :show-pagination="true"
                :error-presentation="tableErrorPresentation"
                :custom-columns="props.dataCustomization?.list?.fields"
                :on-data-retrieve="props.dataCustomization?.list?.onDataRetrieve"
                :has-next="reportsListResult.hasNext.value"
                :has-previous="reportsListResult.hasPrevious.value"
                :go-to-next-page="reportsListResult.goToNextPage"
                :go-to-previous-page="reportsListResult.goToPreviousPage"
                :limit="reportsListResult.limit.value"
                :limit-options="reportsListResult.limitOptions.value"
                :update-limit="reportsListResult.updateLimit"
                :current-page="reportsListResult.page.value + 1"
            />
        </template>
    </div>
</template>
