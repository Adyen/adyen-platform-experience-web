<script setup lang="ts">
import { ref, computed } from 'vue';
import { BentoCard, BentoTab, BentoTabs, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useResponsiveContainer, containerQueries, useShouldHideTitles } from '@integration-components/composables-vue';
import { DISPUTE_STATUS_GROUPS } from '@integration-components/disputes/domain';
import type { IBalanceAccountBase } from '@integration-components/types';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import DisputesFilters from './DisputesFilters.vue';
import DisputesTable from './DisputesTable.vue';
import DisputeManagementModal from './DisputeManagementModal.vue';
import { useDisputesList } from '../composables/useDisputesList';
import { DEFAULT_DISPUTE_STATUS_GROUP } from '../constants';
import type { DisputesOverviewProps } from '../types';
import styles from './DisputesOverview.module.scss';

const props = defineProps<
    DisputesOverviewProps & {
        balanceAccounts: IBalanceAccountBase[] | undefined;
        isLoadingBalanceAccount: boolean;
    }
>();

const { i18n } = useCoreContext();
const hideTitles = useShouldHideTitles();
const isMobile = useResponsiveContainer(containerQueries.down.xs);

const DISPUTE_STATUS_GROUP_VALUES = Object.keys(DISPUTE_STATUS_GROUPS) as IDisputeStatusGroup[];

const statusGroup = ref<IDisputeStatusGroup>(DEFAULT_DISPUTE_STATUS_GROUP);
const refreshToken = ref(0);
const selectedDisputeId = ref<string | undefined>(undefined);
const filtersInitialized = ref(false);

const filterParams = ref<{
    balanceAccountId: string | undefined;
    schemeCodes: string | undefined;
    reasonCategories: string | undefined;
    createdSince: string;
    createdUntil: string;
}>({
    balanceAccountId: undefined,
    schemeCodes: undefined,
    reasonCategories: undefined,
    createdSince: '',
    createdUntil: '',
});

function onFiltersChange(params: {
    balanceAccountId: string | undefined;
    schemeCodes: string | undefined;
    reasonCategories: string | undefined;
    createdSince: string;
    createdUntil: string;
}) {
    filterParams.value = params;
    filtersInitialized.value = true;
}

const statusGroupItems = computed(() =>
    Object.entries(DISPUTE_STATUS_GROUPS).map(([value, labelKey]) => ({ label: i18n.get(labelKey), value: value as IDisputeStatusGroup }))
);
const activeStatusGroupIndex = computed(() => DISPUTE_STATUS_GROUP_VALUES.indexOf(statusGroup.value));
const statusGroupAriaLabel = computed(() => i18n.get('disputes.overview.common.filters.types.statusGroup'));

function onStatusGroupChange(index: number) {
    statusGroup.value = DISPUTE_STATUS_GROUP_VALUES[index] ?? DEFAULT_DISPUTE_STATUS_GROUP;
}

const activeBalanceAccount = computed(() => {
    const id = filterParams.value.balanceAccountId;
    return props.balanceAccounts?.find(account => account.id === id);
});

const disputesListResult = useDisputesList(() => ({
    fetchEnabled: filtersInitialized.value,
    balanceAccountId: filterParams.value.balanceAccountId,
    statusGroup: statusGroup.value,
    schemeCodes: filterParams.value.schemeCodes,
    reasonCategories: filterParams.value.reasonCategories,
    createdSince: filterParams.value.createdSince,
    createdUntil: filterParams.value.createdUntil,
    allowLimitSelection: props.allowLimitSelection,
    preferredLimit: props.preferredLimit,
    refreshToken: refreshToken.value,
    onFiltersChanged: props.onFiltersChanged,
}));

const isLoading = computed(
    () => disputesListResult.fetching.value || props.isLoadingBalanceAccount || !props.balanceAccounts || !filtersInitialized.value
);

const disputesError = computed(() => disputesListResult.error.value as Error | undefined);

function showModal(id: string) {
    selectedDisputeId.value = id;
}

function onRowClick(dispute: IDisputeListItem) {
    const id = dispute.disputePspReference;
    if (props.showDetails !== false) showModal(id);
    props.onRecordSelection?.({ id, showModal: () => showModal(id) });
}

function refreshDisputesList(gotoStatusGroup?: IDisputeStatusGroup) {
    if (gotoStatusGroup && DISPUTE_STATUS_GROUP_VALUES.includes(gotoStatusGroup) && gotoStatusGroup !== statusGroup.value) {
        statusGroup.value = gotoStatusGroup;
    } else {
        refreshToken.value = performance.now();
    }
}

function closeModal() {
    selectedDisputeId.value = undefined;
}
</script>

<template>
    <div :class="[styles.root, isMobile ? styles.rootXs : '']">
        <div :class="styles.header">
            <BentoTypography v-if="!props.hideTitle && !hideTitles" el="h2" variant="title" stronger>
                {{ i18n.get('disputes.overview.common.title') }}
            </BentoTypography>
            <div v-if="isMobile" role="toolbar" :class="[styles.toolbar, styles.toolbarCompact]">
                <DisputesFilters :compact="true" :balance-accounts="props.balanceAccounts" :status-group="statusGroup" :on-change="onFiltersChange" />
            </div>
        </div>

        <div :class="styles.tabsContainer">
            <BentoTabs :aria-label="statusGroupAriaLabel" :active-tab-index="activeStatusGroupIndex" @update:active-tab-index="onStatusGroupChange">
                <BentoTab v-for="item in statusGroupItems" :key="item.value" :title="item.label" />
            </BentoTabs>
        </div>

        <BentoCard :class="styles.card">
            <template #content>
                <div :class="styles.content">
                    <div v-if="!isMobile" role="toolbar" :class="styles.toolbar">
                        <DisputesFilters
                            :compact="false"
                            :balance-accounts="props.balanceAccounts"
                            :status-group="statusGroup"
                            :on-change="onFiltersChange"
                        />
                    </div>

                    <DisputesTable
                        :status-group="statusGroup"
                        :active-balance-account="activeBalanceAccount"
                        :loading="isLoading"
                        :data="disputesListResult.records.value"
                        :show-pagination="true"
                        :error="disputesError"
                        :on-row-click="onRowClick"
                        :on-contact-support="props.onContactSupport"
                        :custom-columns="props.dataCustomization?.list?.fields"
                        :on-data-retrieve="props.dataCustomization?.list?.onDataRetrieve"
                        :has-next="disputesListResult.hasNext.value"
                        :has-previous="disputesListResult.hasPrevious.value"
                        :go-to-next-page="disputesListResult.goToNextPage"
                        :go-to-previous-page="disputesListResult.goToPreviousPage"
                        :limit="disputesListResult.limit.value"
                        :limit-options="disputesListResult.limitOptions.value"
                        :update-limit="disputesListResult.updateLimit"
                        :current-page="disputesListResult.page.value + 1"
                    />
                </div>
            </template>
        </BentoCard>

        <DisputeManagementModal
            :dispute-id="selectedDisputeId"
            :data-customization="props.dataCustomization?.details"
            :on-contact-support="props.onContactSupport"
            :refresh-disputes-list="refreshDisputesList"
            :on-close="closeModal"
        />
    </div>
</template>
