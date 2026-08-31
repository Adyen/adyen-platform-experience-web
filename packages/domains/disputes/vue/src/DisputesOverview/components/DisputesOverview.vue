<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { BentoCard, BentoLoadingIndicator, BentoTab, BentoTabs, BentoTypography } from '@adyen/bento-vue3';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import { DataOverviewError, getDataOverviewErrorInfo, getErrorMessage, useDataOverviewError } from '@integration-components/composables-vue';
import { useContainerQuery } from '@integration-components/composables-vue/useContainerQuery';
import { containerQueries } from '@integration-components/composables-vue/containerQueries';
import { DISPUTE_STATUS_GROUPS } from '@integration-components/disputes/domain';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import DisputesFilters from './DisputesFilters.vue';
import DisputesTable from './DisputesTable.vue';
import DisputeManagementModal from './DisputeManagementModal.vue';
import { useDisputesList } from '../composables/useDisputesList';
import { DEFAULT_DISPUTE_STATUS_GROUP } from '../constants';
import type { DisputesOverviewProps } from '../types';
import styles from './DisputesOverview.module.scss';
import '@adyen/bento-vue3/styles/bento-light';
import { useDisputesContext } from '../../integration/context';
import {
    DISPUTES_DATA_OVERVIEW_ACTION_KEYS,
    DISPUTES_DATA_OVERVIEW_ERROR_KEYS,
    DISPUTES_ERROR_MESSAGE_KEYS,
} from '../../integration/translationKeys';
import { disputesOverviewEventBridge, type DisputeManagementEventMap, type DisputesOverviewEmits, type DisputesOverviewEventMap } from '../../events';

const props = defineProps<Omit<DisputesOverviewProps, 'onFiltersChanged'>>();
const emit = defineEmits<DisputesOverviewEmits>();
const hasContactSupportListener = disputesOverviewEventBridge.hasListener('contactSupportRequested');
disputesOverviewEventBridge.provideEvents({
    contactSupportRequested: payload => emit('contactSupportRequested', payload),
    disputeAccepted: payload => emit('disputeAccepted', payload),
    disputeDefended: payload => emit('disputeDefended', payload),
    disputeDismissed: payload => emit('disputeDismissed', payload),
    disputeSelected: payload => emit('disputeSelected', payload),
    filtersChanged: payload => emit('filtersChanged', payload),
});

const { balanceAccounts, i18n, provideTranslationOverrides, runtime } = useDisputesContext();
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
        errorMessage: 'disputes.overview.common.errors.unavailable',
        errorKeys: DISPUTES_ERROR_MESSAGE_KEYS,
        hasError: available.value === false,
        isBalanceAccountIdWrong: isBalanceAccountIdWrong.value,
        onContactSupport: props.onContactSupport || hasContactSupportListener.value ? requestContactSupport : undefined,
        overviewErrorKeys: DISPUTES_DATA_OVERVIEW_ERROR_KEYS,
    })
);
const hasOverviewError = computed(() => !!overviewErrorInfo.value);
const containerRef = ref<HTMLElement | null>(null);
const isMobile = useContainerQuery(containerQueries.down.xs, containerRef);

const DISPUTE_STATUS_GROUP_VALUES = Object.keys(DISPUTE_STATUS_GROUPS) as IDisputeStatusGroup[];

const statusGroup = ref<IDisputeStatusGroup>(DEFAULT_DISPUTE_STATUS_GROUP);
const fetchStatusGroup = ref<IDisputeStatusGroup>(statusGroup.value);
const statusGroupFetchPending = ref(false);

let statusGroupDebounceTimer: ReturnType<typeof setTimeout> | undefined;

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

function updateStatusGroup(statusGroupToFetch: IDisputeStatusGroup) {
    if (statusGroupDebounceTimer) {
        clearTimeout(statusGroupDebounceTimer);
    }

    statusGroup.value = statusGroupToFetch;
    statusGroupFetchPending.value = true;

    statusGroupDebounceTimer = setTimeout(() => {
        fetchStatusGroup.value = statusGroupToFetch;
        statusGroupFetchPending.value = false;
        statusGroupDebounceTimer = undefined;
    }, 500);
}

function onStatusGroupChange(index: number) {
    updateStatusGroup(DISPUTE_STATUS_GROUP_VALUES[index] ?? DEFAULT_DISPUTE_STATUS_GROUP);
}

const activeBalanceAccount = computed(() => {
    const id = filterParams.value.balanceAccountId;
    return filteredBalanceAccounts.value?.find(account => account.id === id) ?? filteredBalanceAccounts.value?.[0];
});

const disputesListResult = useDisputesList(() => ({
    fetchEnabled:
        available.value === true && !hasOverviewError.value && filtersInitialized.value && !statusGroupFetchPending.value && !runtime.refreshing,
    balanceAccountId: filterParams.value.balanceAccountId,
    statusGroup: fetchStatusGroup.value,
    schemeCodes: filterParams.value.schemeCodes,
    reasonCategories: filterParams.value.reasonCategories,
    createdSince: filterParams.value.createdSince,
    createdUntil: filterParams.value.createdUntil,
    allowLimitSelection: props.allowLimitSelection,
    preferredLimit: props.preferredLimit,
    refreshToken: refreshToken.value,
    onFiltersChanged,
}));

const isLoading = computed(
    () =>
        statusGroupFetchPending.value ||
        disputesListResult.fetching.value ||
        balanceAccounts.loading ||
        !filteredBalanceAccounts.value ||
        !filtersInitialized.value
);

const disputesError = computed(() => disputesListResult.error.value as Error | undefined);
const listErrorInfo = computed(() =>
    getErrorMessage({
        error: disputesError.value,
        keys: DISPUTES_ERROR_MESSAGE_KEYS,
        message: 'disputes.overview.common.errors.listUnavailable',
        onContactSupport: props.onContactSupport || hasContactSupportListener.value ? requestContactSupport : undefined,
    })
);
const activeErrorInfo = computed(() => overviewErrorInfo.value ?? listErrorInfo.value);
const { presentation: errorPresentation } = useDataOverviewError({
    actionKeys: DISPUTES_DATA_OVERVIEW_ACTION_KEYS,
    copyIcon: CopyIcon,
    errorInfo: activeErrorInfo,
    onRefresh: () => runtime.refresh(),
    refreshIcon: RefreshIcon,
    translate: (key, options) => i18n.get(key, options),
});
const tableErrorPresentation = computed(() => (disputesError.value ? errorPresentation.value : undefined));

function showModal(id: string) {
    selectedDisputeId.value = id;
}

function requestContactSupport() {
    const payload: DisputesOverviewEventMap['contactSupportRequested'] = { component: 'overview' };
    emit('contactSupportRequested', payload);
    props.onContactSupport?.();
}

function onFiltersChanged(payload: DisputesOverviewEventMap['filtersChanged']) {
    emit('filtersChanged', payload);
}

function onRowClick(dispute: IDisputeListItem) {
    const id = dispute.disputePspReference;
    if (props.showDetails !== false) showModal(id);
    const payload: DisputesOverviewEventMap['disputeSelected'] = { id, showModal: () => showModal(id) };
    emit('disputeSelected', payload);
    props.onRecordSelection?.(payload);
}

function refreshDisputesList(gotoStatusGroup?: IDisputeStatusGroup) {
    if (gotoStatusGroup && DISPUTE_STATUS_GROUP_VALUES.includes(gotoStatusGroup) && gotoStatusGroup !== statusGroup.value) {
        updateStatusGroup(gotoStatusGroup);
    } else {
        refreshToken.value = performance.now();
    }
}

function closeModal() {
    selectedDisputeId.value = undefined;
}

function onManagementContactSupportRequested(payload: DisputeManagementEventMap['contactSupportRequested']) {
    emit('contactSupportRequested', payload);
    props.onContactSupport?.();
}

function onDisputeAccepted(payload: DisputeManagementEventMap['disputeAccepted']) {
    emit('disputeAccepted', payload);
}

function onDisputeDefended(payload: DisputeManagementEventMap['disputeDefended']) {
    emit('disputeDefended', payload);
}

function onDisputeDismissed(payload: DisputeManagementEventMap['dismissed']) {
    emit('disputeDismissed', payload);
}

onUnmounted(() => {
    if (statusGroupDebounceTimer) {
        clearTimeout(statusGroupDebounceTimer);
    }
});
</script>

<template>
    <div ref="containerRef" :class="[styles.root, isMobile ? styles.rootXs : '']">
        <BentoLoadingIndicator v-if="available === undefined" />

        <DataOverviewError v-else-if="hasOverviewError" v-bind="errorPresentation" :variant="isMobile ? 'condensed' : 'embedded'" />

        <template v-else>
            <div :class="styles.header">
                <BentoTypography v-if="!props.hideTitle" el="h2" variant="title" stronger>
                    {{ i18n.get('disputes.overview.common.title') }}
                </BentoTypography>
                <div v-if="isMobile" role="toolbar" :class="[styles.toolbar, styles.toolbarCompact]">
                    <DisputesFilters
                        :compact="true"
                        :balance-accounts="filteredBalanceAccounts"
                        :status-group="statusGroup"
                        :on-change="onFiltersChange"
                    />
                </div>
            </div>

            <div :class="styles.tabsContainer">
                <BentoTabs
                    :aria-label="statusGroupAriaLabel"
                    :active-tab-index="activeStatusGroupIndex"
                    @update:active-tab-index="onStatusGroupChange"
                >
                    <BentoTab v-for="item in statusGroupItems" :key="item.value" :title="item.label" />
                </BentoTabs>
            </div>

            <BentoCard :class="styles.card">
                <template #content>
                    <div :class="styles.content">
                        <div v-if="!isMobile" role="toolbar" :class="styles.toolbar">
                            <DisputesFilters
                                :compact="false"
                                :balance-accounts="filteredBalanceAccounts"
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
                            :error-presentation="tableErrorPresentation"
                            :on-row-click="onRowClick"
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
                :show-contact-support="!!props.onContactSupport || hasContactSupportListener"
                :refresh-disputes-list="refreshDisputesList"
                :on-close="closeModal"
                @contact-support-requested="onManagementContactSupportRequested"
                @dispute-accepted="onDisputeAccepted"
                @dispute-defended="onDisputeDefended"
                @dismissed="onDisputeDismissed"
            />
        </template>
    </div>
</template>
