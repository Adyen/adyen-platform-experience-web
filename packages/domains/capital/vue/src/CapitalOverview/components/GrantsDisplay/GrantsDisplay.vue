<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { BentoAlert, BentoButton, BentoList, BentoListItem, BentoSegmentedControl, type BentoSegmentedControlItem } from '@adyen/bento-vue3';
import { getGrantConfig, getGroupedGrants, getHasGrantGroups, type EnhancedCapitalState } from '@integration-components/capital/domain';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { GRANT_ADJUSTMENT_DETAILS, sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import type { IGrant } from '@integration-components/types';
import CapitalHeader from '../../../shared/CapitalHeader/CapitalHeader.vue';
import GrantItem from '../GrantItem/GrantItem.vue';
import GrantRepaymentDetails from '../GrantRepaymentDetails/GrantRepaymentDetails.vue';
import styles from './GrantsDisplay.module.scss';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    grants: IGrant[];
    hideTitle?: boolean;
    onNewOfferRequest: () => void;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();

const analyticsProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Grants overview',
} as const;

const selectedGrantGroup = ref<'active' | 'inactive'>('active');
type GrantAdjustmentDetail = 'revocation' | 'unscheduledRepayment';
const selectedGrantDetail = ref<GrantAdjustmentDetail>();
const selectedGrant = ref<IGrant>();
const grantGroups = computed(() => getGroupedGrants(props.grants));
const hasGrantGroups = computed(() => getHasGrantGroups(grantGroups.value));
const maxAmount = computed(() => props.capitalState.dynamicOffer?.maxAmount);
const selectedGrantConfig = computed(() => (selectedGrant.value ? getGrantConfig(selectedGrant.value) : undefined));
const shouldShowRepaymentDetails = computed(
    () =>
        selectedGrant.value &&
        selectedGrantDetail.value === GRANT_ADJUSTMENT_DETAILS.unscheduledRepayment &&
        selectedGrantConfig.value?.hasUnscheduledRepaymentDetails
);

const grantGroupItems = computed<BentoSegmentedControlItem[]>(() => [
    { label: i18n.get('capital.overview.grants.list.tabs.labels.inProgress'), value: 'active' },
    { label: i18n.get('capital.overview.grants.list.tabs.labels.closed'), value: 'inactive' },
]);

const displayedGrants = computed(() => {
    if (!hasGrantGroups.value) {
        return props.grants;
    }

    return selectedGrantGroup.value === 'active' ? grantGroups.value.ongoing : grantGroups.value.closed;
});

const onNewOfferRequestWithTracking = () => {
    try {
        props.onNewOfferRequest();
    } finally {
        userEvents.addEvent?.('Clicked button', { ...analyticsProperties, label: 'Request a new loan' });
    }
};

const showGrantDetails = (grant: IGrant, detail?: GrantAdjustmentDetail) => {
    selectedGrantDetail.value = detail;
    selectedGrant.value = grant;
};

const getShowGrantDetails = (grant: IGrant) => (detail?: GrantAdjustmentDetail) => {
    showGrantDetails(grant, detail);
};

const hideGrantDetails = () => {
    selectedGrantDetail.value = undefined;
};

onMounted(() => {
    userEvents.addEvent?.('Landed on page', { ...analyticsProperties, label: 'Capital overview' });
});
</script>

<template>
    <GrantRepaymentDetails v-if="shouldShowRepaymentDetails && selectedGrant" :grant="selectedGrant" :on-details-close="hideGrantDetails" />

    <div v-else :class="styles.root">
        <CapitalHeader :hide-title="props.hideTitle" :region="props.capitalState.region" title-key="capital.common.title" />

        <div v-if="maxAmount" :class="styles.newGrantBanner">
            <BentoAlert type="highlight">
                {{ i18n.get('capital.overview.grants.newGrant.title.part1') }}
                <strong>
                    {{
                        i18n.get('capital.overview.grants.newGrant.title.part2', {
                            values: { amount: i18n.amount(maxAmount.value, maxAmount.currency, { minimumFractionDigits: 0 }) },
                        })
                    }}
                </strong>
                <template v-if="props.capitalState.renewableGrants.length" #description>
                    {{ i18n.get('capital.overview.grants.newGrant.earlyRenewalNotice') }}
                </template>
                <template #actions>
                    <BentoButton :class="styles.offerButton" @click="onNewOfferRequestWithTracking">
                        {{ i18n.get('capital.overview.grants.newGrant.actions.newGrant') }}
                    </BentoButton>
                </template>
            </BentoAlert>
        </div>

        <BentoSegmentedControl
            v-if="hasGrantGroups"
            v-model="selectedGrantGroup"
            :aria-label="i18n.get('capital.overview.grants.list.tabs.a11y.label')"
            :items="grantGroupItems"
        />

        <BentoList :class="styles.items">
            <BentoListItem v-for="grant in displayedGrants" :key="grant.id">
                <template #content>
                    <GrantItem :grant="grant" :show-details="getShowGrantDetails(grant)" />
                </template>
            </BentoListItem>
        </BentoList>
    </div>
</template>
