<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { OnFundsRequestCallback } from '@integration-components/capital/domain';
import { BentoLoadingIndicator, BentoModal } from '@adyen/bento-vue3';
import '@adyen/bento-vue3/styles/bento-light';
import { IGrant } from '@integration-components/types';
import { CapitalOverviewProps } from '../../types';
import { useEnhancedCapitalState } from '../../../shared/composables/useEnhancedCapitalState';
import CapitalHeader from '../../../shared/CapitalHeader/CapitalHeader.vue';
import GrantList from '../GrantList/GrantList.vue';
import CapitalError from '../../../shared/CapitalError/CapitalError.vue';
import OfferAlert from '../OfferAlert/OfferAlert.vue';
import CapitalOffer from '../../../CapitalOffer/components/CapitalOffer.vue';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import { useLandedPageEvent } from '@integration-components/composables-vue';
import styles from './CapitalOverview.module.scss';

const props = defineProps<CapitalOverviewProps>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const requestedGrant = ref<IGrant>();
const { capitalState, error, isLoading } = useEnhancedCapitalState(() => true, requestedGrant);
const isEarlyRenewal = computed(() => !!capitalState.value?.renewableGrants.length);
const isOfferOpen = ref(false);
const shouldTrackOfferClose = ref(true);
const offerTitleKey = ref<TranslationKey>('capital.offer.selection.title');
const offerTitle = computed(() => i18n.get(offerTitleKey.value));

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

const openOffer = () => {
    isOfferOpen.value = true;
    shouldTrackOfferClose.value = true;
    // TODO: Verify
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        label: 'Open offer',
        subCategory: 'Grants overview',
    });
};

const closeOffer = () => {
    isOfferOpen.value = false;

    if (!shouldTrackOfferClose.value) return;

    // TODO: Verify
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        label: 'Dismiss offer',
        subCategory: 'Grants overview',
    });
};

const handleOfferTitleChange = (title: TranslationKey) => {
    offerTitleKey.value = title;
};

const handleFundsRequest: OnFundsRequestCallback = (data, renewsGrantId) => {
    requestedGrant.value = { ...data, renewsGrantId };
    shouldTrackOfferClose.value = false;
    closeOffer();
};
</script>

<template>
    <BentoLoadingIndicator v-if="isLoading" />
    <template v-else>
        <CapitalHeader :hide-title="props.hideTitle" :region="capitalState?.region" title-key="capital.common.title" />
        <CapitalError v-if="error" :error="error" :on-contact-support="props.onContactSupport" />
        <template v-else-if="capitalState">
            <CapitalError v-if="!capitalState.isRegionSupported" unsupported-region />
            <div v-else :class="styles.root">
                <OfferAlert
                    v-if="capitalState.dynamicOfferConfig"
                    :dynamic-offer-config="capitalState.dynamicOfferConfig"
                    :has-grants="capitalState.hasGrants"
                    :is-early-renewal="isEarlyRenewal"
                    :on-offer-request="openOffer"
                />
                <GrantList :capital-state="capitalState" :requested-grant="requestedGrant" :on-contact-support="props.onContactSupport" />
            </div>
        </template>
    </template>
    <BentoModal :is-open="isOfferOpen" size="medium" @close-modal="closeOffer">
        {{ offerTitle }}
        <template #content>
            <CapitalOffer
                :capital-state="capitalState"
                hide-subtitle
                hide-title
                :on-contact-support="props.onContactSupport"
                :on-funds-request="handleFundsRequest"
                :on-title-change="handleOfferTitleChange"
            />
        </template>
    </BentoModal>
</template>
