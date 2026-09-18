<script setup lang="ts">
import { computed } from 'vue';
import { BentoTab, BentoTabs, BentoTypography } from '@adyen/bento-vue3';
import { getRenewableGrantDetails, type EnhancedCapitalState } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IGrantOfferResponseDTO } from '@integration-components/types';
import { useFinancingDetailItems, type FinancingDetailItemKey } from '../../composables/useFinancingDetailItems';
import FinancingDetailList from '../FinancingDetailList/FinancingDetailList.vue';
import styles from './OfferSummaryDetails.module.scss';

const props = defineProps<{
    capitalState: EnhancedCapitalState;
    grantOffer: IGrantOfferResponseDTO;
    hasBalanceAccountError?: boolean;
}>();

const { i18n } = useCoreContext();
const { getItems } = useFinancingDetailItems();
const renewableGrantDetails = computed(() => getRenewableGrantDetails(props.capitalState));
const isEarlyRenewal = computed(() => !!renewableGrantDetails.value);
const itemKeys = computed(
    () =>
        [
            ...(isEarlyRenewal.value ? ['financing', 'fees', 'totalRepaymentAmount'] : []),
            'dailyRepaymentRate',
            'annualPercentageRate',
            'repaymentThreshold',
            'expectedRepaymentPeriod',
            'maximumRepaymentDate',
            'account',
        ] as FinancingDetailItemKey[]
);

const offerItems = computed(() => getItems(props.grantOffer, itemKeys.value));
const renewableGrantItems = computed(() => (renewableGrantDetails.value ? getItems(renewableGrantDetails.value, itemKeys.value) : []));
</script>

<template>
    <section>
        <BentoTabs v-if="isEarlyRenewal">
            <BentoTab :title="i18n.get('capital.offer.summary.earlyRenewal.tabs.newGrant')">
                <FinancingDetailList :has-balance-account-error="props.hasBalanceAccountError" :items="offerItems" :class="styles.list" />
            </BentoTab>
            <BentoTab :title="i18n.get('capital.offer.summary.earlyRenewal.tabs.currentGrant')">
                <FinancingDetailList :has-balance-account-error="props.hasBalanceAccountError" :items="renewableGrantItems" :class="styles.list" />
            </BentoTab>
        </BentoTabs>
        <template v-else>
            <BentoTypography variant="body" strongest>
                {{ i18n.get('capital.common.termsTitle') }}
            </BentoTypography>
            <FinancingDetailList :has-balance-account-error="props.hasBalanceAccountError" :items="offerItems" :class="styles.list" />
        </template>
    </section>
</template>
