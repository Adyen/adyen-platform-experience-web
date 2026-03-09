<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import type { PayoutDetailsProps, IPayoutDetails, ExtraField } from './types';
import type { EndpointCallable } from '../../core/ConfigContext/types';
import { useConfigContext } from '../../core/ConfigContext';
import { useCoreContext } from '../../core/Context';
import { BentoTypography, BentoAccordion, BentoAccordionItem } from '@adyen/bento-vue3';
import './PayoutDetails.scss';

interface Props extends PayoutDetailsProps {
    createdAt: string;
    extraFields?: Record<string, ExtraField>;
}

interface BalanceAccount {
    id: string;
    description?: string;
}

const balanceAccountsCache = new WeakMap<EndpointCallable, BalanceAccount[]>();

const props = defineProps<Props>();

const { endpoints } = useConfigContext();
const { i18n } = useCoreContext();

const payout = ref<IPayoutDetails | undefined>(undefined);
const balanceAccountDescriptionFallback = ref<string | undefined>(undefined);
const isFetching = ref(false);
const error = ref<string | null>(null);

async function fetchBalanceAccountDescriptionFallback() {
    if (props.balanceAccountDescription) {
        balanceAccountDescriptionFallback.value = undefined;
        return;
    }

    const { getBalanceAccounts } = endpoints;
    if (typeof getBalanceAccounts !== 'function') {
        balanceAccountDescriptionFallback.value = undefined;
        return;
    }

    try {
        const cachedBalanceAccounts = balanceAccountsCache.get(getBalanceAccounts);
        const allBalanceAccounts = cachedBalanceAccounts ?? (await getBalanceAccounts({}))?.data;

        if (!cachedBalanceAccounts && Array.isArray(allBalanceAccounts)) {
            balanceAccountsCache.set(getBalanceAccounts, allBalanceAccounts);
        }

        const filteredBalanceAccounts = allBalanceAccounts?.filter(
            (account: BalanceAccount) => !props.balanceAccountId || account.id === props.balanceAccountId
        );

        balanceAccountDescriptionFallback.value = filteredBalanceAccounts?.[0]?.description;
    } catch (err) {
        console.error('Failed to fetch balance accounts:', err);
        balanceAccountDescriptionFallback.value = undefined;
    }
}

async function fetchPayoutData() {
    if (!endpoints.getPayout) return;

    isFetching.value = true;
    error.value = null;

    try {
        const response = await endpoints.getPayout(
            {},
            {
                query: {
                    balanceAccountId: props.balanceAccountId,
                    createdAt: props.createdAt,
                },
            }
        );
        payout.value = response;
    } catch (err) {
        console.error('Failed to fetch payout:', err);
        error.value = (err as Error).message;
    } finally {
        isFetching.value = false;
    }
}

onMounted(() => {
    fetchPayoutData();
});

watch(
    () => [props.balanceAccountId, props.createdAt],
    () => {
        fetchPayoutData();
    }
);

watch(
    () => [props.balanceAccountId, props.balanceAccountDescription, endpoints.getBalanceAccounts],
    () => {
        fetchBalanceAccountDescriptionFallback();
    },
    { immediate: true }
);

const payoutData = computed(() => payout.value?.payout);
const amountBreakdowns = computed(() => payout.value?.amountBreakdowns);
const resolvedBalanceAccountDescription = computed(() => props.balanceAccountDescription || balanceAccountDescriptionFallback.value);

const formatAmount = (value: number | undefined, currency: string | undefined): string => {
    if (value === undefined || currency === undefined) return '';
    return i18n.amount(value, currency);
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    return i18n.date(dateString, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
</script>

<template>
    <div class="adyen-pe-payout-details-wrapper">
        <div v-if="error" class="payout-error">
            <bento-typography variant="body" weight="stronger" style="color: #d32f2f"> Error: {{ error }} </bento-typography>
        </div>

        <div v-else-if="isFetching" class="payout-skeleton">
            <div v-for="n in 4" :key="n" class="skeleton-row"></div>
        </div>

        <div v-else-if="payoutData" class="adyen-pe-payout-details">
            <!-- Header Section -->
            <div class="adyen-pe-payout-details__header">
                <div class="adyen-pe-payout-details__title">
                    <bento-typography variant="title" :large="true" weight="stronger">
                        {{ i18n.get('payouts.details.title') }}
                    </bento-typography>
                </div>
                <bento-typography variant="title" weight="stronger">
                    {{ i18n.get('payouts.details.tags.netPayout') }}
                </bento-typography>
                <bento-typography variant="title" :large="true">
                    {{ formatAmount(payoutData.payoutAmount.value, payoutData.payoutAmount.currency) }}
                </bento-typography>
                <bento-typography v-if="payoutData.createdAt" variant="body">
                    {{ formatDate(payoutData.createdAt) }}
                </bento-typography>
                <div class="balance-account-info">
                    <bento-typography v-if="resolvedBalanceAccountDescription" variant="caption" weight="stronger" style="width: 100%">
                        {{ resolvedBalanceAccountDescription }}
                    </bento-typography>
                    <bento-typography variant="caption">
                        {{ props.balanceAccountId }}
                    </bento-typography>
                </div>
            </div>

            <!-- Accordion Section -->
            <bento-accordion>
                <!-- Funds Captured Section -->
                <bento-accordion-item
                    v-if="payoutData.fundsCapturedAmount"
                    :title="`${i18n.get('payouts.details.breakdown.fields.fundsCaptured')} ${formatAmount(payoutData.fundsCapturedAmount.value, payoutData.fundsCapturedAmount.currency)}`"
                >
                    <bento-typography variant="body">
                        <div v-if="amountBreakdowns?.fundsCapturedBreakdown?.length" class="breakdown-list">
                            <div v-for="item in amountBreakdowns.fundsCapturedBreakdown" :key="item.category" class="breakdown-item">
                                <span>{{ i18n.get(`payouts.details.breakdown.fundsCaptured.types.${item.category}`) }}</span>
                                <span>{{ formatAmount(item.amount?.value, item.amount?.currency) }}</span>
                            </div>
                        </div>
                        <div v-else>
                            {{ formatAmount(payoutData.fundsCapturedAmount.value, payoutData.fundsCapturedAmount.currency) }}
                        </div>
                    </bento-typography>
                </bento-accordion-item>

                <!-- Adjustments Section -->
                <bento-accordion-item
                    v-if="payoutData.adjustmentAmount"
                    :title="`${i18n.get('payouts.details.breakdown.fields.adjustments')} ${formatAmount(payoutData.adjustmentAmount.value, payoutData.adjustmentAmount.currency)}`"
                >
                    <bento-typography variant="body">
                        <div v-if="amountBreakdowns?.adjustmentBreakdown?.length" class="breakdown-list">
                            <div v-for="item in amountBreakdowns.adjustmentBreakdown" :key="item.category" class="breakdown-item">
                                <span>{{ i18n.get(`payouts.details.breakdown.adjustments.types.${item.category}`) }}</span>
                                <span>{{ formatAmount(item.amount?.value, item.amount?.currency) }}</span>
                            </div>
                        </div>
                        <div v-else>
                            {{ formatAmount(payoutData.adjustmentAmount.value, payoutData.adjustmentAmount.currency) }}
                        </div>
                    </bento-typography>
                </bento-accordion-item>

                <div class="adyen-pe-payout-details--net-payout">
                    <bento-typography variant="title">
                        {{
                            `${i18n.get('payouts.details.breakdown.fields.netPayout')} ${formatAmount(payoutData.payoutAmount.value, payoutData.payoutAmount.currency)}`
                        }}
                    </bento-typography>
                </div>

                <div class="adyen-pe-payout-details--unpaid-amount">
                    <bento-typography variant="body">
                        {{
                            `${i18n.get('payouts.details.breakdown.fields.remainingAmount')} - ${formatAmount(payoutData?.unpaidAmount?.value, payoutData?.unpaidAmount?.currency)}`
                        }}
                    </bento-typography>
                </div>
            </bento-accordion>
        </div>
    </div>
</template>

<style scoped>
.payout-error {
    padding: 16px;
}

.payout-skeleton {
    padding: 16px;
}

.skeleton-row {
    height: 20px;
    background: #e0e0e0;
    border-radius: 4px;
    margin-bottom: 12px;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.payout-details {
    padding: 16px;
}

.adyen-pe-payout-details__title,
.adyen-pe-payout-details__header {
    margin-bottom: 24px;
}

.balance-account-info {
    margin-top: 8px;
}

.breakdown-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;
}

.breakdown-item:last-child {
    border-bottom: none;
}
</style>
