<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoLoadingIndicator, BentoSegmentedControl, type BentoSegmentedControlItem } from '@adyen/bento-vue3';
import { getGroupedGrants, getHasGrantGroups, type EnhancedCapitalState } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import GrantItem from '../GrantItem/GrantItem.vue';
import { useAdjustedGrants } from '../../composables/useAdjustedGrants';
import CapitalError from '../../../shared/CapitalError/CapitalError.vue';
import { IGrant } from '@integration-components/types';
import styles from './GrantList.module.scss';

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
    { label: i18n.get('capital.overview.grants.list.tabs.labels.inProgress'), value: 'active' },
    { label: i18n.get('capital.overview.grants.list.tabs.labels.closed'), value: 'inactive' },
]);

const displayedGrants = computed(() => {
    if (!hasGrantGroups.value || !grantGroups.value) {
        return grants.value;
    }

    return selectedGrantGroup.value === 'active' ? grantGroups.value.ongoing : grantGroups.value.closed;
});
</script>

<template>
    <BentoLoadingIndicator v-if="isLoading" />
    <CapitalError v-else-if="error" :error="error" :on-contact-support="props.onContactSupport" />
    <template v-else>
        <CapitalError v-if="!grants?.length && !dynamicOfferConfig" empty-grant-offer />
        <template v-else-if="grants?.length">
            <BentoSegmentedControl
                v-if="hasGrantGroups"
                v-model="selectedGrantGroup"
                :aria-label="i18n.get('capital.overview.grants.list.tabs.a11y.label')"
                :items="grantGroupItems"
            />
            <ul :class="styles.list">
                <li v-for="grant in displayedGrants" :key="grant.id" :class="styles.listItem">
                    <GrantItem :grant="grant" />
                </li>
            </ul>
        </template>
    </template>
</template>
