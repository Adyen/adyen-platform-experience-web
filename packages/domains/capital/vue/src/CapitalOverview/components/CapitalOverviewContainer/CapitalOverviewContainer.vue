<script setup lang="ts">
import { CapitalOverviewProps } from '../../types';
import { computed, ref } from 'vue';
import { useSupportedRegions } from '../../composables/useSupportedRegions';
import { useCapitalState } from '../../composables/useCapitalState';
import { useGrants } from '../../composables/useGrants';
import { getEnhancedCapitalState } from '@integration-components/capital/domain';
import { useConfigContext } from '@integration-components/core/vue';
import type { IGrant } from '@integration-components/types';

const props = defineProps<CapitalOverviewProps>();
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
const hasCapitalEndpoints = computed(() => !!config.endpoints.getCapitalState || !!config.endpoints.getGrants);

const state = computed<CapitalOverviewState>(() => {
    console.log(props);
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

//TODO: This will be used for PreQualified
// const handlePreQualifiedFundsRequest: OnFundsRequestCallback = (data, renewsGrantId) => {
//     if (props.onFundsRequest) {
//         props.onFundsRequest(data, renewsGrantId);
//     } else {
//         requestedGrant.value = { ...data, renewsGrantId };
//     }
// };
</script>

<template>
    <div>
        <div v-if="state === 'Loading'">Loading</div>
        <!--        <div v-else-if="state === 'Error'"></div>-->
        <!--        <div v-else-if="state === 'UnsupportedRegion'"></div>-->
        <!--        <div v-else-if="state === 'PreQualified'"></div>-->
        <!--        <div v-else></div>-->
    </div>
</template>
