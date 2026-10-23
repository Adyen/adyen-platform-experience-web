<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoLoadingSkeletonShape, BentoSegmentedControl, type BentoSegmentedControlItem } from '@adyen/bento-vue3';
import { getGroupedGrants, getHasGrantGroups, type EnhancedCapitalState } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import GrantItem from '../GrantItem/GrantItem.vue';
import { useAdjustedGrants } from '../../composables/useAdjustedGrants';
import CapitalError from '../../../shared/CapitalError.vue';
import { IGrant } from '@integration-components/types';
import styles from './GrantList.module.scss';
import EmptyOfferState from '../../../shared/EmptyOfferState.vue';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    requestedGrant?: IGrant;
    onContactSupport?: () => void;
}>();

const { i18n } = useCoreContext();

const { grants, error, isLoading } = useAdjustedGrants(
    () => props.capitalState,
    () => props.requestedGrant
);

const dynamicOfferConfig = computed(() => props.capitalState.dynamicOfferConfig);
const grantGroups = computed(() => (grants.value ? getGroupedGrants(grants.value) : undefined));
const hasGrantGroups = computed(() => !!grantGroups.value && getHasGrantGroups(grantGroups.value));
const selectedGrantGroup = ref<'active' | 'inactive'>('active');

const grantGroupItems = computed<BentoSegmentedControlItem[]>(() => [
    { label: i18n.get('capital.overview.grants.tabs.inProgress'), value: 'active' },
    { label: i18n.get('capital.overview.grants.tabs.closed'), value: 'inactive' },
]);

const displayedGrants = computed(() => {
    if (!hasGrantGroups.value || !grantGroups.value) {
        return grants.value;
    }

    return selectedGrantGroup.value === 'active' ? grantGroups.value.ongoing : grantGroups.value.closed;
});
</script>

<template>
    <div :class="styles.root" :aria-busy="isLoading">
        <BentoLoadingSkeletonShape v-if="isLoading" variant="rectangle" height="152px" />
        <CapitalError v-else-if="error" :error="error" :on-contact-support="props.onContactSupport" />
        <template v-else>
            <EmptyOfferState v-if="!grants?.length && !dynamicOfferConfig" />
            <template v-else-if="grants?.length">
                <BentoSegmentedControl
                    v-if="hasGrantGroups"
                    v-model="selectedGrantGroup"
                    :aria-label="i18n.get('capital.overview.grants.tabs.a11yLabel')"
                    :items="grantGroupItems"
                />
                <ul :class="styles.list">
                    <li v-for="grant in displayedGrants" :key="grant.id" :class="styles.listItem">
                        <GrantItem :grant="grant" />
                    </li>
                </ul>
            </template>
        </template>
    </div>
</template>
