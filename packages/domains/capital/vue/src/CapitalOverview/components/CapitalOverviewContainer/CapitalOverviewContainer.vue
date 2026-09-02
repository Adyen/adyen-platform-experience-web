<script setup lang="ts">
import { CapitalOverviewComponentProps } from '../../types';
import { computed, ref } from 'vue';
import { useSupportedRegions } from '../../composables/useSupportedRegions';
import { useCapitalState } from '../../composables/useCapitalState';
import { useGrants } from '../../composables/useGrants';
import { getAdjustedGrants, getEnhancedCapitalState, type OnFundsRequestCallback } from '@integration-components/capital/domain';
import { useConfigContext } from '@integration-components/core/vue';
import type { IGrant } from '@integration-components/types';
import CapitalHeader from '../../../shared/CapitalHeader/CapitalHeader.vue';
import PreQualified from '../PreQualified/PreQualified.vue';
import GrantList from '../GrantList/GrantList.vue';
import styles from './CapitalOverviewContainer.module.scss';
import CapitalError from '../../../shared/CapitalError/CapitalError.vue';

const props = defineProps<CapitalOverviewComponentProps>();
type CapitalOverviewState = 'Loading' | 'Error' | 'PreQualified' | 'GrantList' | 'UnsupportedRegion';

const config = useConfigContext();
const supportedRegions = useSupportedRegions();
const capitalStateQuery = useCapitalState();
const requestedGrant = ref<IGrant>();

const capitalState = computed(() => getEnhancedCapitalState(capitalStateQuery.data.value, supportedRegions.value, requestedGrant.value));
const grantsQuery = useGrants(
    capitalStateQuery.data,
    computed(() => capitalState.value?.isRegionSupported)
);
const error = computed(() => capitalStateQuery.error.value ?? grantsQuery.error.value);
const grants = computed(() => getAdjustedGrants(capitalState.value, grantsQuery.data.value, requestedGrant.value));
const hasCapitalEndpoints = computed(() => !!config.endpoints.getCapitalState || !!config.endpoints.getGrants);

const state = computed<CapitalOverviewState>(() => {
    if (!hasCapitalEndpoints.value || capitalStateQuery.isFetching.value || grantsQuery.isFetching.value) {
        return 'Loading';
    } else if (error.value || !capitalState.value) {
        return 'Error';
    } else if (!capitalState.value.isRegionSupported) {
        return 'UnsupportedRegion';
    } else if (!capitalState.value.hasGrants) {
        return 'PreQualified';
    }
    return 'GrantList';
});

const handlePreQualifiedFundsRequest: OnFundsRequestCallback = (data, renewsGrantId) => {
    if (props.onFundsRequest) {
        props.onFundsRequest(data, renewsGrantId);
    } else {
        requestedGrant.value = { ...data, renewsGrantId };
    }
};

const handleGrantListUpdateRequest = (grant: IGrant) => {
    requestedGrant.value = grant;
};
</script>

<template>
    <div :class="styles.root">
        <div v-if="state === 'Loading'">
            <div :class="styles.skeletonContainer">
                <div :class="styles.headerSkeleton" />
                <div :class="styles.skeleton" />
            </div>
        </div>
        <div v-else-if="state === 'Error'">
            <CapitalHeader :hide-title="props.hideTitle" :region="capitalState?.region" title-key="capital.common.title" />
            <CapitalError :error="error" />
        </div>
        <div v-else-if="state === 'UnsupportedRegion'">
            <CapitalHeader :hide-title="props.hideTitle" :region="capitalState?.region" title-key="capital.common.title" />
            <CapitalError unsupportedRegion />
        </div>
        <PreQualified
            v-else-if="state === 'PreQualified' && capitalState"
            :capital-state="capitalState"
            :hide-title="props.hideTitle"
            :on-funds-request="handlePreQualifiedFundsRequest"
            :on-offer-dismiss="props.onOfferDismiss"
            :on-offer-options-request="props.onOfferOptionsRequest"
            :skip-pre-qualified-intro="props.skipPreQualifiedIntro"
        />
        <GrantList
            v-else-if="state === 'GrantList' && capitalState && grants"
            :capital-state="capitalState"
            :grants="grants"
            :hide-title="props.hideTitle"
            :on-funds-request="props.onFundsRequest"
            :on-grant-list-update-request="handleGrantListUpdateRequest"
            :on-offer-dismiss="props.onOfferDismiss"
        />
    </div>
</template>
