<script setup lang="ts">
import { computed } from 'vue';
import { BentoTab, BentoTabs, BentoTypography } from '@adyen/bento-vue3';
import {
    getRenewableGrantDetails,
    type EnhancedCapitalState,
    sharedCapitalOfferAnalyticsEventProperties,
} from '@integration-components/capital/domain';
import { useEventDispatcherContext } from '@integration-components/core/vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { useCapitalCopy } from '../../../shared/composables/useCapitalCopy';
import { useFinancingDetailItems, type FinancingDetailItemKey } from '../../composables/useFinancingDetailItems';
import FinancingDetailList from '../FinancingDetailList/FinancingDetailList.vue';
import styles from './OfferSummaryDetails.module.scss';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    grantOffer: IGrantOfferResponseDTO;
    hasBalanceAccountError?: boolean;
}>();

const { getContractCopy } = useCapitalCopy();
const userEvents = useEventDispatcherContext();
const { getItems } = useFinancingDetailItems(props.capitalState.dynamicOfferConfig?.contractType);
const renewableGrantDetails = computed(() => getRenewableGrantDetails(props.capitalState));
const isEarlyRenewal = computed(() => !!renewableGrantDetails.value);
const itemKeys = computed(
    () =>
        [
            ...(isEarlyRenewal.value ? ['financing', 'fees', 'totalRepaymentAmount'] : []),
            'dailyRepaymentRate',
            ...(props.grantOffer.contractType === 'loan' ? ['annualPercentageRate'] : []),
            ...(props.grantOffer.contractType === 'loan' ? ['repaymentThreshold'] : []),
            'expectedRepaymentPeriod',
            ...(props.grantOffer.contractType === 'loan' ? ['maximumRepaymentDate'] : []),
            'account',
        ] as FinancingDetailItemKey[]
);

const offerItems = computed(() => getItems(props.grantOffer, itemKeys.value));
const renewableGrantItems = computed(() => {
    return renewableGrantDetails.value ? getItems(renewableGrantDetails.value, itemKeys.value) : [];
});

const handleActiveTabIndexUpdate = (index: number) => {
    userEvents.addEvent?.('Moved tabs', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Offer summary',
        selectedTab: index === 0 ? 'New loan' : 'Current loan',
    });
};
</script>

<template>
    <section>
        <BentoTabs v-if="isEarlyRenewal" @update:active-tab-index="handleActiveTabIndexUpdate($event)">
            <BentoTab :title="getContractCopy('capital.offer.summary.renewalTabs.newGrant', props.grantOffer.contractType)">
                <FinancingDetailList :has-balance-account-error="props.hasBalanceAccountError" :items="offerItems" :class="styles.list" />
            </BentoTab>
            <BentoTab :title="getContractCopy('capital.offer.summary.renewalTabs.currentGrant', props.grantOffer.contractType)">
                <FinancingDetailList :has-balance-account-error="props.hasBalanceAccountError" :items="renewableGrantItems" :class="styles.list" />
            </BentoTab>
        </BentoTabs>
        <template v-else>
            <BentoTypography variant="body" strongest>
                {{ getContractCopy('capital.offer.termsTitle', props.grantOffer.contractType) }}
            </BentoTypography>
            <FinancingDetailList :has-balance-account-error="props.hasBalanceAccountError" :items="offerItems" :class="styles.list" />
        </template>
    </section>
</template>
