<script setup lang="ts">
import { ref, computed } from 'vue';
import { BentoTypography, BentoTabs, BentoTab, BentoButton, BentoAlert, BentoModal } from '@adyen/bento-vue3';
import PlusIcon from '@adyen/ui-assets-icons-16/vue/plus';
import SettingsIcon from '@adyen/ui-assets-icons-16/vue/settings';
import { useCoreContext, useConfigContext } from '@integration-components/core/vue';
import { useResponsiveContainer, containerQueries } from '@integration-components/composables-vue';
import PaymentLinksFilters from './PaymentLinksFilters.vue';
import PaymentLinksTable from './PaymentLinksTable.vue';
// import { PaymentLinkCreationInternal } from '../../PaymentLinkCreation';
import { usePaymentLinksList } from '../composables/usePaymentLinksList';
import { BASE_CLASS, DEFAULT_PAYMENT_LINK_STATUS_GROUP, PAYMENT_LINK_STATUS_GROUPS_TABS } from '../constants';
import type { PaymentLinksFiltersValue } from './PaymentLinksFilters.vue';
import type { IPaymentLinkFilters, IPaymentLinkItem, IPaymentLinkStatusGroup } from '@integration-components/types';
import type { StoreData, PaymentLinksOverviewModalType } from '../../../../domain/src';
import type { PaymentLinksOverviewExternalProps } from '../types';
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
    isStoresLoading: boolean;
    storeError?: Error;
    filterOptions: IPaymentLinkFilters | undefined;
    filterOptionsError?: Error;
}>();

const { i18n } = useCoreContext();
const config = useConfigContext();

const isMobile = useResponsiveContainer(containerQueries.down.xs);

const statusGroup = ref<IPaymentLinkStatusGroup>(DEFAULT_PAYMENT_LINK_STATUS_GROUP);

const activeStatusGroupTabIndex = computed(() => PAYMENT_LINK_STATUS_GROUPS_TABS.findIndex(tab => tab.id === statusGroup.value));

function onStatusGroupChange(newIndex: number) {
    const tab = PAYMENT_LINK_STATUS_GROUPS_TABS[newIndex];
    if (tab) statusGroup.value = tab.id as IPaymentLinkStatusGroup;
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

function onFiltersChange(value: PaymentLinksFiltersValue) {
    filtersValue.value = value;
}

const hasMultipleStores = computed(() => !!props.stores && props.stores.length > 1);
const fetchEnabled = computed(() => !!props.allStores?.length);

const paymentLinksListResult = usePaymentLinksList(() => ({
    fetchEnabled: fetchEnabled.value,
    statusGroup: statusGroup.value,
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
}));

const showFiltersAlert = computed(() => !!props.storeError || !!props.filterOptionsError);
const filtersAlertDismissed = ref(false);

function closeFiltersAlert() {
    filtersAlertDismissed.value = true;
}

// ── Row-click details modal (stub — PaymentLinkDetails is not yet migrated to Vue) ──
const isDetailsModalOpen = ref(false);
const selectedPaymentLink = ref<IPaymentLinkItem | null>(null);

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
        paymentLinksListResult.refresh();
        hasToRefresh.value = false;
    }
}

// function onPaymentLinkCreated(paymentLink: any) {
//     props.paymentLinkCreation?.onPaymentLinkCreated?.(paymentLink);
//     hasToRefresh.value = true;
// }

const hasActionButtons = computed(() => !!(config.endpoints?.savePayByLinkSettings || config.endpoints?.createPBLPaymentLink));
</script>

<template>
    <div :class="[BASE_CLASS, { [`${BASE_CLASS}--xs`]: isMobile }]">
        <div class="adyen-pe-payment-links-overview__header">
            <BentoTypography v-if="!props.hideTitle" variant="title">
                {{ i18n.get('payByLink.overview.title') }}
            </BentoTypography>
            <div v-else />
            <div class="adyen-pe-payment-links-overview__actions-container">
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
            <div v-if="hasActionButtons && !isMobile" class="adyen-pe-payment-links-overview__action-buttons-container">
                <BentoButton v-if="config.endpoints?.createPBLPaymentLink" variant="primary" @click="openPaymentLinkModal">
                    {{ i18n.get('payByLink.overview.list.actions.createPaymentLink') }}
                </BentoButton>
                <BentoButton
                    v-if="config.endpoints?.savePayByLinkSettings"
                    variant="secondary"
                    :aria-label="i18n.get('payByLink.overview.actions.settings.a11y.label')"
                    @click="openSettingsModal"
                >
                    <SettingsIcon />
                </BentoButton>
            </div>
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
            :error="paymentLinksListResult.error.value as any"
            :loading="paymentLinksListResult.fetching.value || props.isStoresLoading"
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

        <!-- Row-click details modal. TODO: replace with the migrated PaymentLinkDetails Vue component once available. -->
        <BentoModal
            :is-open="isDetailsModalOpen"
            size="medium"
            :is-dismissible="true"
            :aria-label="i18n.get('payByLink.details.title')"
            @close-modal="closeDetailsModal"
        >
            {{ i18n.get('payByLink.details.title') }}
            <template #content>
                <BentoTypography v-if="selectedPaymentLink" variant="body">
                    {{ selectedPaymentLink.paymentLinkId }}
                </BentoTypography>
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
                <!-- TODO: replace with the migrated PaymentLinkCreation Vue component once available. -->
                <BentoTypography v-if="modalType === 'Creation'" variant="title">
                    {{ i18n.get('payByLink.creation.form.title') }}
                </BentoTypography>
                <!-- <PaymentLinkCreationInternal
                    v-if="modalType === 'Creation'"
                    :fields-config="props.paymentLinkCreation?.fieldsConfig"
                    :store-ids="props.storeIds"
                    :on-payment-link-created="onPaymentLinkCreated"
                    :on-creation-dismiss="() => (isModalVisible = false)"
                    :on-contact-support="props.onContactSupport"
                /> -->
                <!-- TODO: replace with the migrated PaymentLinkSettings Vue component once available. -->
                <BentoTypography v-else-if="modalType === 'Settings'" variant="title">
                    {{ i18n.get('payByLink.overview.actions.settings.a11y.label') }}
                </BentoTypography>
            </template>
        </BentoModal>
    </div>
</template>
