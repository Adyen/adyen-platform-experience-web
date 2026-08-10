<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { BentoTypography, BentoTabs, BentoTab, BentoButton, BentoAlert, BentoModal } from '@adyen/bento-vue3';
import PlusIcon from '@adyen/ui-assets-icons-16/vue/plus';
import SettingsIcon from '@adyen/ui-assets-icons-16/vue/settings';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import { useResponsiveContainer, containerQueries } from '@integration-components/composables-vue';
import PaymentLinksFilters from './PaymentLinksFilters.vue';
import PaymentLinksTable from './PaymentLinksTable.vue';
import PaymentLinkCreation from '../../PaymentLinkCreation/components/PaymentLinkCreationContainer/PaymentLinkCreationContainer.vue';
import PaymentLinkDetails from '../../PaymentLinkDetails/components/PaymentLinkDetails/PaymentLinkDetails.vue';
import PaymentLinkSettings from '../../PaymentLinkSettings/components/PaymentLinkSettingsContainer.vue';
import { usePaymentLinksList } from '../composables/usePaymentLinksList';
import { BASE_CLASS, DEFAULT_PAYMENT_LINK_STATUS_GROUP, PAYMENT_LINK_STATUS_GROUPS_TABS } from '../constants';
import type { PaymentLinksFiltersValue } from './PaymentLinksFilters.vue';
import type { IPaymentLinkFilters, IPaymentLinkItem, IPaymentLinkStatusGroup } from '@integration-components/types';
import type { StoreData, PaymentLinksOverviewModalType } from '../../../../domain/src';
import { ACCOUNT_MISCONFIGURATION, WRONG_STORE_IDS } from '../../../../domain/src';
import type { PaymentLinksOverviewExternalProps } from '../types';
import { createPaymentLinksError } from '../utils/error';
import { listFrom } from '@integration-components/utils';
import '../styles/PaymentLinksOverview.scss';

const props = defineProps<{
    allowLimitSelection?: boolean;
    hideTitle?: boolean;
    preferredLimit?: number;
    showDetails?: boolean;
    storeIds?: PaymentLinksOverviewExternalProps['storeIds'];
    onFiltersChanged?: PaymentLinksOverviewExternalProps['onFiltersChanged'];
    onRecordSelection?: PaymentLinksOverviewExternalProps['onRecordSelection'];
    onContactSupport?: () => void;
    paymentLinkCreation?: PaymentLinksOverviewExternalProps['paymentLinkCreation'];
    paymentLinkSettings?: PaymentLinksOverviewExternalProps['paymentLinkSettings'];
    stores: StoreData[] | undefined;
    allStores: StoreData[] | undefined;
    isFiltersLoading: boolean;
    storeError?: Error;
    filterOptions: IPaymentLinkFilters | undefined;
    filterOptionsError?: Error;
}>();

const { i18n } = useCoreContext();
const config = useConfigContext();
const isMobile = useResponsiveContainer(containerQueries.down.xs);

let statusGroupDebounceTimer: ReturnType<typeof setTimeout> | undefined;

const statusGroupFetchPending = ref(false);
const statusGroup = ref<IPaymentLinkStatusGroup>(DEFAULT_PAYMENT_LINK_STATUS_GROUP);
const fetchStatusGroup = ref<IPaymentLinkStatusGroup>(statusGroup.value);
const activeStatusGroupTabIndex = computed(() => PAYMENT_LINK_STATUS_GROUPS_TABS.findIndex(tab => tab.id === statusGroup.value));

function onStatusGroupChange(newIndex: number) {
    const tab = PAYMENT_LINK_STATUS_GROUPS_TABS[newIndex];
    if (!tab) return;

    if (statusGroupDebounceTimer) {
        clearTimeout(statusGroupDebounceTimer);
    }

    const nextStatusGroup = tab.id as IPaymentLinkStatusGroup;
    statusGroup.value = nextStatusGroup;
    statusGroupFetchPending.value = true;

    statusGroupDebounceTimer = setTimeout(() => {
        fetchStatusGroup.value = nextStatusGroup;
        requestAnimationFrame(() => (statusGroupFetchPending.value = false));
        statusGroupDebounceTimer = undefined;
    }, 500);
}

const filtersValue = ref<PaymentLinksFiltersValue>({
    statuses: [],
    linkTypes: [],
    storeIds: [],
    merchantReference: undefined,
    paymentLinkId: undefined,
    createdSince: '',
    createdUntil: '',
});
const lastRefreshTimestamp = ref(performance.now());

function onFiltersChange(value: PaymentLinksFiltersValue) {
    filtersValue.value = value;
}

const hasMultipleStores = computed(() => !!props.stores && props.stores.length > 1);
const fetchEnabled = computed(() => !!props.allStores?.length);

const paymentLinksListResult = usePaymentLinksList(() => ({
    fetchEnabled: fetchEnabled.value && !statusGroupFetchPending.value,
    statusGroup: fetchStatusGroup.value,
    statuses: filtersValue.value.statuses,
    linkTypes: filtersValue.value.linkTypes,
    filterStoreIds: filtersValue.value.storeIds,
    propStoreIds: props.storeIds,
    merchantReference: filtersValue.value.merchantReference,
    paymentLinkId: filtersValue.value.paymentLinkId,
    createdSince: filtersValue.value.createdSince,
    createdUntil: filtersValue.value.createdUntil,
    allowLimitSelection: props.allowLimitSelection,
    preferredLimit: props.preferredLimit,
    onFiltersChanged: props.onFiltersChanged,
    lastRefreshTimestamp: lastRefreshTimestamp.value,
    _storeIds: String(listFrom(props.storeIds) ?? ''),
}));

const showFiltersAlert = computed(() => !!props.storeError || !!props.filterOptionsError);
const filtersAlertDismissed = ref(false);

watch([() => props.storeError, () => props.filterOptionsError], () => {
    filtersAlertDismissed.value = false;
});

function closeFiltersAlert() {
    filtersAlertDismissed.value = true;
}

const noStoresError = computed(() => {
    if (props.isFiltersLoading || props.allStores?.length !== 0 || props.storeError) return undefined;
    return createPaymentLinksError('No stores configured', { errorCode: ACCOUNT_MISCONFIGURATION });
});

const storesFilteredError = computed(() => {
    if (props.isFiltersLoading || (props.allStores && props.allStores.length > 0 && props.stores?.length !== 0)) return undefined;
    return createPaymentLinksError('The provided store IDs do not match any configured stores', { errorCode: WRONG_STORE_IDS });
});

const paymentLinksError = computed(() => noStoresError.value ?? paymentLinksListResult.error.value ?? storesFilteredError.value);

onUnmounted(() => {
    if (statusGroupDebounceTimer) {
        clearTimeout(statusGroupDebounceTimer);
    }
});

const isDetailsModalOpen = ref(false);
const selectedPaymentLink = ref<IPaymentLinkItem | null>(null);
const hasDetailsToRefresh = ref(false);

function showDetailsModal() {
    isDetailsModalOpen.value = true;
}

function onRowClick(paymentLink: IPaymentLinkItem) {
    selectedPaymentLink.value = paymentLink;

    if (props.onRecordSelection) {
        props.onRecordSelection({ id: paymentLink.paymentLinkId, showModal: showDetailsModal });
    } else if (props.showDetails !== false) {
        showDetailsModal();
    }
}

function closeDetailsModal() {
    isDetailsModalOpen.value = false;
    selectedPaymentLink.value = null;
    if (hasDetailsToRefresh.value) {
        refreshPaymentLinkList();
        hasDetailsToRefresh.value = false;
    }
}

function onPaymentLinkUpdate() {
    hasDetailsToRefresh.value = true;
}

// ── Creation / settings modals ──
const isModalVisible = ref(false);
const modalType = ref<PaymentLinksOverviewModalType | undefined>(undefined);
const hasToRefresh = ref(false);

function openPaymentLinkModal() {
    modalType.value = 'Creation';
    isModalVisible.value = true;
}

function openSettingsModal() {
    modalType.value = 'Settings';
    isModalVisible.value = true;
}

function onCloseModal() {
    isModalVisible.value = false;
    if (hasToRefresh.value) {
        refreshPaymentLinkList();
        hasToRefresh.value = false;
    }
}

function refreshPaymentLinkList() {
    const now = new Date();
    const createdUntilDate = filtersValue.value.createdUntil ? new Date(filtersValue.value.createdUntil) : null;

    if (createdUntilDate?.toDateString() === now.toDateString()) {
        filtersValue.value = {
            ...filtersValue.value,
            createdUntil: now.toISOString(),
        };
    }

    lastRefreshTimestamp.value = performance.now();
}

function onPaymentLinkCreated(paymentLink: any) {
    props.paymentLinkCreation?.onPaymentLinkCreated?.(paymentLink);
    hasToRefresh.value = true;
}

const hasActionButtons = computed(() => !!(config.endpoints?.savePayByLinkSettings || config.endpoints?.createPBLPaymentLink));
</script>

<template>
    <div :class="[BASE_CLASS, { [`${BASE_CLASS}--xs`]: isMobile }]">
        <div class="adyen-pe-payment-links-overview__header">
            <BentoTypography v-if="!props.hideTitle" variant="title">
                {{ i18n.get('payByLink.overview.title') }}
            </BentoTypography>
            <div v-else />
            <div v-if="hasActionButtons" class="adyen-pe-payment-links-overview__actions-container">
                <BentoButton v-if="!isMobile && config.endpoints?.createPBLPaymentLink" variant="primary" @click="openPaymentLinkModal">
                    {{ i18n.get('payByLink.overview.list.actions.createPaymentLink') }}
                </BentoButton>
                <BentoButton
                    v-if="!isMobile && config.endpoints?.savePayByLinkSettings"
                    variant="secondary"
                    class="adyen-pe-payment-links-overview__settings-button"
                    :aria-label="i18n.get('payByLink.overview.actions.settings.a11y.label')"
                    @click="openSettingsModal"
                >
                    <SettingsIcon />
                </BentoButton>
                <BentoButton
                    v-if="isMobile && config.endpoints?.createPBLPaymentLink"
                    variant="primary"
                    condensed
                    class="adyen-pe-payment-links-overview__action-button--xs"
                    :aria-label="i18n.get('payByLink.overview.list.actions.createPaymentLink')"
                    @click="openPaymentLinkModal"
                >
                    <PlusIcon />
                </BentoButton>
                <BentoButton
                    v-if="isMobile && config.endpoints?.savePayByLinkSettings"
                    variant="secondary"
                    condensed
                    class="adyen-pe-payment-links-overview__action-button--xs"
                    :aria-label="i18n.get('payByLink.overview.actions.settings.a11y.label')"
                    @click="openSettingsModal"
                >
                    <SettingsIcon />
                </BentoButton>
            </div>
        </div>

        <div class="adyen-pe-payment-links-overview__tabs-container">
            <BentoTabs
                :aria-label="i18n.get('payByLink.overview.list.filters.types.statusGroup')"
                :active-tab-index="activeStatusGroupTabIndex"
                @update:active-tab-index="onStatusGroupChange"
            >
                <BentoTab v-for="tab in PAYMENT_LINK_STATUS_GROUPS_TABS" :key="tab.id" :title="i18n.get(tab.label)" />
            </BentoTabs>
        </div>

        <div class="adyen-pe-payment-links-overview__filters-container">
            <PaymentLinksFilters
                :stores="props.stores"
                :store-error="props.storeError"
                :filter-error="props.filterOptionsError"
                :available-link-types="props.filterOptions?.linkTypes"
                :available-statuses="props.filterOptions?.statuses"
                :status-group="statusGroup"
                :on-change="onFiltersChange"
            />
        </div>

        <BentoAlert
            v-if="showFiltersAlert && !filtersAlertDismissed"
            class="adyen-pe-payment-links-overview__filters-alert-container"
            type="critical"
            variant="tip"
            close-button
            @close-alert="closeFiltersAlert"
        >
            <template #description>
                {{ i18n.get('payByLink.overview.filters.errors.networkError') }}
            </template>
        </BentoAlert>

        <PaymentLinksTable
            :error="paymentLinksError"
            :loading="statusGroupFetchPending || paymentLinksListResult.fetching.value || props.isFiltersLoading"
            :on-contact-support="props.onContactSupport"
            :on-row-click="onRowClick"
            :show-pagination="true"
            :payment-links="paymentLinksListResult.records.value"
            :has-multiple-stores="hasMultipleStores"
            :has-next="paymentLinksListResult.hasNext.value"
            :has-previous="paymentLinksListResult.hasPrevious.value"
            :go-to-next-page="paymentLinksListResult.goToNextPage"
            :go-to-previous-page="paymentLinksListResult.goToPreviousPage"
            :limit="paymentLinksListResult.limit.value"
            :limit-options="paymentLinksListResult.limitOptions.value"
            :update-limit="paymentLinksListResult.updateLimit"
            :current-page="paymentLinksListResult.page.value + 1"
        />

        <BentoModal
            :is-open="isDetailsModalOpen"
            size="large"
            :is-dismissible="true"
            :aria-label="i18n.get('payByLink.details.title')"
            @close-modal="closeDetailsModal"
        >
            <template #content>
                <PaymentLinkDetails
                    v-if="selectedPaymentLink"
                    :id="selectedPaymentLink.paymentLinkId"
                    hide-title
                    :on-contact-support="props.onContactSupport"
                    :on-dismiss="closeDetailsModal"
                    :on-update="onPaymentLinkUpdate"
                    is-dismiss-button-hidden
                />
            </template>
        </BentoModal>

        <BentoModal
            :is-open="isModalVisible"
            size="large"
            :is-dismissible="true"
            :aria-label="i18n.get('payByLink.overview.title')"
            @close-modal="onCloseModal"
        >
            <template #content>
                <PaymentLinkCreation
                    v-if="modalType === 'Creation'"
                    :fields-config="props.paymentLinkCreation?.fieldsConfig"
                    :store-ids="props.storeIds"
                    :on-payment-link-created="onPaymentLinkCreated"
                    :on-creation-dismiss="props.paymentLinkCreation?.onCreationDismiss"
                    :on-contact-support="props.onContactSupport"
                />
                <PaymentLinkSettings
                    v-else-if="modalType === 'Settings'"
                    v-bind="props.paymentLinkSettings"
                    :store-ids="props.storeIds"
                    :on-contact-support="props.onContactSupport"
                    embedded-in-overview
                />
            </template>
        </BentoModal>
    </div>
</template>
