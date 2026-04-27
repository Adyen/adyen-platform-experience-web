<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import ReportsFilters from './ReportsFilters.vue';
import ReportsTable from './ReportsTable.vue';
import { useReportsList } from '../composables/useReportsList';
import { BASE_CLASS } from '../constants';
import type { IBalanceAccountBase } from '../types';
import { BentoTypography } from '@adyen/bento-vue3';
import '../styles/index.scss';

const props = defineProps<{
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
    dataCustomization?: any;
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
    createdSince: new Date().toISOString(),
    createdUntil: new Date().toISOString(),
});

function onFiltersChange(params: { balanceAccountId: string | undefined; createdSince: string; createdUntil: string }) {
    filterParams.value = params;
}

const activeBalanceAccount = computed(() => {
    const id = filterParams.value.balanceAccountId;
    return props.balanceAccounts?.find((a: IBalanceAccountBase) => a.id === id);
});

const reportsListResult = useReportsList(() => ({
    fetchEnabled: !!filterParams.value.balanceAccountId,
    balanceAccountId: filterParams.value.balanceAccountId,
    createdSince: filterParams.value.createdSince,
    createdUntil: filterParams.value.createdUntil,
    allowLimitSelection: props.allowLimitSelection,
    preferredLimit: props.preferredLimit,
    onFiltersChanged: props.onFiltersChanged,
    dataCustomization: props.dataCustomization,
}));

const isLoading = computed(
    () =>
        reportsListResult.fetching.value ||
        props.isLoadingBalanceAccount ||
        !props.balanceAccounts ||
        !activeBalanceAccount.value ||
        reportsListResult.loadingCustomRecords.value
);

const displayData = computed(() => {
    if (props.dataCustomization?.list?.onDataRetrieve) {
        return reportsListResult.customRecords.value;
    }
    return reportsListResult.records.value;
});
</script>

<template>
    <div :class="BASE_CLASS">
        <div v-if="!props.hideTitle" class="adyen-pe-reports-overview-header">
            <BentoTypography variant="title">{{ i18n.get('reports.overview.title') }}</BentoTypography>
            <BentoTypography variant="body" class="adyen-pe-reports-overview-header__description">{{
                i18n.get('reports.overview.generateInfo')
            }}</BentoTypography>
        </div>

        <div role="toolbar" class="adyen-pe-reports-overview__toolbar">
            <ReportsFilters :balance-accounts="props.balanceAccounts" :on-change="onFiltersChange" />
        </div>

        <ReportsTable
            :balance-account-id="activeBalanceAccount?.id"
            :loading="isLoading"
            :data="displayData"
            :show-pagination="true"
            :error="reportsListResult.error.value as Error | undefined"
            :on-contact-support="props.onContactSupport"
            :custom-columns="props.dataCustomization?.list?.fields"
            :has-next="reportsListResult.hasNext.value"
            :has-previous="reportsListResult.hasPrevious.value"
            :go-to-next-page="reportsListResult.goToNextPage"
            :go-to-previous-page="reportsListResult.goToPreviousPage"
            :limit="reportsListResult.limit.value"
            :limit-options="reportsListResult.limitOptions.value"
            :update-limit="reportsListResult.updateLimit"
            :current-page="reportsListResult.page.value + 1"
        />
    </div>
</template>
