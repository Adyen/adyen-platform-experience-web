<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useShouldHideTitles } from '@integration-components/composables-vue';
import ReportsFilters from './ReportsFilters.vue';
import ReportsTable from './ReportsTable.vue';
import { useReportsList } from '../composables/useReportsList';
import type { IBalanceAccountBase } from '../types';
import { BentoTypography } from '@adyen/bento-vue3';
import { quickSelectDateRanges } from '@integration-components/utils';
import styles from './ReportsOverview.module.scss';

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
const hideTitles = useShouldHideTitles();

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

const reportsListResult = useReportsList(() => ({
    fetchEnabled: !!filterParams.value.balanceAccountId,
    balanceAccountId: filterParams.value.balanceAccountId,
    createdSince: filterParams.value.createdSince,
    createdUntil: filterParams.value.createdUntil,
    allowLimitSelection: props.allowLimitSelection,
    preferredLimit: props.preferredLimit,
    onFiltersChanged: props.onFiltersChanged,
}));

const isLoading = computed(
    () => reportsListResult.fetching.value || props.isLoadingBalanceAccount || !props.balanceAccounts || !activeBalanceAccount.value
);

// Computed to avoid inline `as Type | Union` casts in the template (vue/no-deprecated-filter)
const listError = computed(() => reportsListResult.error.value as Error | undefined);
</script>

<template>
    <div :class="styles.root">
        <div v-if="!props.hideTitle && !hideTitles" :class="styles.header">
            <BentoTypography variant="title">{{ i18n.get('reports.overview.title') }}</BentoTypography>
            <BentoTypography variant="body" :class="styles.description">{{ i18n.get('reports.overview.generateInfo') }}</BentoTypography>
        </div>

        <ReportsFilters :balance-accounts="props.balanceAccounts" :on-change="onFiltersChange" />

        <ReportsTable
            :balance-account-id="activeBalanceAccount?.id"
            :loading="isLoading"
            :data="reportsListResult.records.value"
            :show-pagination="true"
            :error="listError"
            :on-contact-support="props.onContactSupport"
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
    </div>
</template>
