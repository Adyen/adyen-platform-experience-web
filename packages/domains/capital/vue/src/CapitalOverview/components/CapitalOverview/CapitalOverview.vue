<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { OnFundsRequestCallback } from '@integration-components/capital/domain';
import type { BentoButtonActionsList } from '@adyen/bento-vue3';
import { IGrant } from '@integration-components/types';
import { CapitalOverviewComponentProps } from '../../types';
import { useEnhancedCapitalState } from '../../../shared/composables/useEnhancedCapitalState';
import CapitalHeader from '../../../shared/CapitalHeader/CapitalHeader.vue';
import GrantList from '../GrantList/GrantList.vue';
import CapitalError from '../../../shared/CapitalError.vue';
import OfferAlert from '../OfferAlert.vue';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import { ComponentShell, useLandedPageEvent, useShouldHideTitles, type ComponentShellState } from '@integration-components/composables-vue';
import styles from './CapitalOverview.module.scss';
import OfferModal from '../OfferModal.vue';
import UnsupportedRegionState from '../../../shared/UnsupportedRegionState.vue';

const props = defineProps<CapitalOverviewComponentProps>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const requestedGrant = ref<IGrant>();
const { capitalState, error, isLoading } = useEnhancedCapitalState(() => true, requestedGrant);
const isEarlyRenewal = computed(() => !!capitalState.value?.renewableGrants.length);
const isOfferModalOpen = ref(false);
const shouldTrackOfferClose = ref(true);
const hideTitles = useShouldHideTitles();
const shellState = computed<ComponentShellState>(() => (isLoading.value ? 'loading' : 'ready'));

useLandedPageEvent(
    () => ({
        ...sharedCapitalOverviewAnalyticsEventProperties,
        subCategory: 'Grants overview',
        hasGrants: capitalState.value?.hasGrants,
        hasOffer: !!capitalState.value?.dynamicOfferConfig,
        isEarlyRenewal: isEarlyRenewal.value,
    }),
    () => !error.value && !!capitalState.value?.isRegionSupported
);

const openOfferModal = () => {
    isOfferModalOpen.value = true;
    shouldTrackOfferClose.value = true;
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        subCategory: 'Grants overview',
        label: 'Open offer',
        hasGrants: capitalState.value?.hasGrants,
        hasOffer: !!capitalState.value?.dynamicOfferConfig,
        isEarlyRenewal: isEarlyRenewal.value,
    });
};

const closeOfferModal = () => {
    isOfferModalOpen.value = false;

    if (!shouldTrackOfferClose.value) return;

    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        subCategory: 'Offer',
        label: 'Dismiss offer',
    });
};

const handleFundsRequest: OnFundsRequestCallback = (data, renewsGrantId) => {
    requestedGrant.value = { ...data, renewsGrantId };
    shouldTrackOfferClose.value = false;
    closeOfferModal();
};

const headerActions = computed<BentoButtonActionsList | undefined>(() => {
    if (error.value || !capitalState.value?.isRegionSupported || !capitalState.value.dynamicOfferConfig) return undefined;
    return [
        {
            title: i18n.get(
                capitalState.value.hasGrants ? 'capital.overview.grants.newGrant.actions.newGrant' : 'capital.overview.grants.newGrant.actions.grant'
            ),
            event: openOfferModal,
        },
    ];
});
</script>

<template>
    <div :class="styles.root">
        <ComponentShell :state="shellState">
            <CapitalHeader :actions="headerActions" :hide-title="hideTitles" :region="capitalState?.region" title-key="capital.common.title" />
            <CapitalError v-if="error" :error="error" :on-contact-support="props.onContactSupport" />
            <template v-else-if="capitalState">
                <UnsupportedRegionState v-if="!capitalState.isRegionSupported" />
                <template v-else>
                    <OfferAlert
                        v-if="capitalState.dynamicOfferConfig"
                        :dynamic-offer-config="capitalState.dynamicOfferConfig"
                        :has-grants="capitalState.hasGrants"
                        :is-early-renewal="isEarlyRenewal"
                    />
                    <GrantList :capital-state="capitalState" :requested-grant="requestedGrant" :on-contact-support="props.onContactSupport" />
                </template>
            </template>
        </ComponentShell>
    </div>
    <OfferModal
        :is-open="isOfferModalOpen"
        :on-close="closeOfferModal"
        :on-contact-support="props.onContactSupport"
        :on-funds-request="handleFundsRequest"
    />
</template>
