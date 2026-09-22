<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { OnFundsRequestCallback } from '@integration-components/capital/domain';
import { BentoLoadingIndicator, type BentoButtonActionsList } from '@adyen/bento-vue3';
import '@adyen/bento-vue3/styles/bento-light';
import { IGrant } from '@integration-components/types';
import { CapitalOverviewProps } from '../../types';
import { useEnhancedCapitalState } from '../../../shared/composables/useEnhancedCapitalState';
import CapitalHeader from '../../../shared/CapitalHeader/CapitalHeader.vue';
import GrantList from '../GrantList/GrantList.vue';
import CapitalError from '../../../shared/CapitalError/CapitalError.vue';
import OfferAlert from '../OfferAlert.vue';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import { useLandedPageEvent } from '@integration-components/composables-vue';
import styles from './CapitalOverview.module.scss';
import OfferModal from '../OfferModal.vue';

const props = defineProps<CapitalOverviewProps>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const requestedGrant = ref<IGrant>();
const { capitalState, error, isLoading } = useEnhancedCapitalState(() => true, requestedGrant);
const isEarlyRenewal = computed(() => !!capitalState.value?.renewableGrants.length);
const isOfferModalOpen = ref(false);
const shouldTrackOfferClose = ref(true);

useLandedPageEvent(
    // TODO: Verify
    () => ({
        ...sharedCapitalOverviewAnalyticsEventProperties,
        label: 'Capital overview',
        subCategory: 'Grants overview',
        hasOffer: !!capitalState.value?.dynamicOfferConfig,
        isEarlyRenewal: isEarlyRenewal.value,
        hasGrants: capitalState.value?.hasGrants,
    }),
    () => !error.value && !!capitalState.value?.isRegionSupported
);

const openOfferModal = () => {
    isOfferModalOpen.value = true;
    shouldTrackOfferClose.value = true;
    // TODO: Verify
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        label: 'Open offer',
        subCategory: 'Grants overview',
    });
};

const closeOfferModal = () => {
    isOfferModalOpen.value = false;

    if (!shouldTrackOfferClose.value) return;

    // TODO: Verify
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        label: 'Dismiss offer',
        subCategory: 'Grants overview',
    });
};

const handleFundsRequest: OnFundsRequestCallback = (data, renewsGrantId) => {
    requestedGrant.value = { ...data, renewsGrantId };
    shouldTrackOfferClose.value = false;
    closeOfferModal();
};

const headerActions = computed<BentoButtonActionsList | undefined>(() => {
    if (error.value || !capitalState.value?.isRegionSupported || !capitalState.value.dynamicOfferConfig) return undefined;
    return [{ title: i18n.get('capital.overview.grants.newGrant.actions.newGrant'), event: openOfferModal }];
});
</script>

<template>
    <BentoLoadingIndicator v-if="isLoading" />
    <template v-else>
        <CapitalHeader :actions="headerActions" :hide-title="props.hideTitle" :region="capitalState?.region" title-key="capital.common.title" />
        <CapitalError v-if="error" :error="error" :on-contact-support="props.onContactSupport" />
        <template v-else-if="capitalState">
            <CapitalError v-if="!capitalState.isRegionSupported" unsupported-region />
            <div v-else :class="styles.root">
                <OfferAlert
                    v-if="capitalState.dynamicOfferConfig"
                    :dynamic-offer-config="capitalState.dynamicOfferConfig"
                    :has-grants="capitalState.hasGrants"
                    :is-early-renewal="isEarlyRenewal"
                />
                <GrantList :capital-state="capitalState" :requested-grant="requestedGrant" :on-contact-support="props.onContactSupport" />
            </div>
        </template>
    </template>
    <OfferModal
        :is-open="isOfferModalOpen"
        :on-close="closeOfferModal"
        :on-contact-support="props.onContactSupport"
        :on-funds-request="handleFundsRequest"
    />
</template>
