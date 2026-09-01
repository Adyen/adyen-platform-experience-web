<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext, useModalContext } from '@integration-components/core/vue';
import {
    BentoTypography,
    BentoCard,
    BentoTag,
    BentoLink,
    BentoButtonActions,
    BentoDataGrid,
    BentoStructuredList,
    BentoStructuredListItem,
} from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import type { IPayoutDetails } from '@integration-components/types';
import { DATE_FORMAT_PAYOUT_DETAILS } from '@integration-components/utils';
import { formatAmountWithCurrencyCode } from '@integration-components/core/Localization/amount/amount-util';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import { getPayoutAdjustmentType, getPayoutFundsCapturedType } from '@integration-components/payouts/domain';
import type { PayoutDetailsCustomization } from '../types';
import styles from './PayoutData.module.scss';

const props = defineProps<{
    payout?: IPayoutDetails;
    balanceAccountId: string;
    balanceAccountDescription?: string;
    extraFields?: Record<string, any> | undefined;
    dataCustomization?: { details?: PayoutDetailsCustomization };
    hideTitle?: boolean;
}>();

const { i18n } = useCoreContext();
const { withinModal } = useModalContext();
const { dateFormat } = useTimezoneAwareDateFormatting('UTC');

const payoutInner = computed(() => props.payout?.payout);
const shouldHideTitle = computed(() => props.hideTitle || withinModal);

// Adjustments: split into additions/subtractions, each sorted alphabetically by translation key.
type ListItem = { key: string; value: string };
const adjustments = computed(() => {
    const breakdown = props.payout?.amountBreakdowns?.adjustmentBreakdown;
    if (!breakdown) return undefined;
    const data: { subtractions: ListItem[]; additions: ListItem[] } = { subtractions: [], additions: [] };
    for (const currentValue of breakdown) {
        if (currentValue.category && currentValue.amount?.value) {
            const { currency, value: amount } = currentValue.amount;
            const target = data[amount && amount < 0 ? 'subtractions' : 'additions'];
            target.push({
                key: currentValue.category,
                value: `${i18n.amount(amount, currency, { hideCurrency: true })} ${currency}`,
            });
        }
    }
    data.subtractions.sort((a, b) => a.key.localeCompare(b.key));
    data.additions.sort((a, b) => a.key.localeCompare(b.key));
    return data;
});

// Funds captured breakdown: filter out zero-amount items, sort with `capture` first.
const fundsCaptured = computed<ListItem[] | undefined>(() => {
    const breakdown = props.payout?.amountBreakdowns?.fundsCapturedBreakdown;
    if (!breakdown) return undefined;
    const items: ListItem[] = [];
    for (const item of breakdown) {
        if (item?.amount?.value === 0) continue;
        if (item?.amount?.value && item.category) {
            items.push({
                key: item.category,
                value: `${i18n.amount(item.amount.value, item.amount.currency, { hideCurrency: true })} ${item.amount.currency}`,
            });
        }
    }
    items.sort((a, b) => {
        if (a.key === 'capture') return -1;
        if (b.key === 'capture') return 1;
        return a.key.localeCompare(b.key);
    });
    return items;
});

function isCustomDataObject(value: unknown): value is { type: string; value: any; config?: any } {
    return !!value && typeof value === 'object' && 'value' in value && 'type' in value;
}

interface ExtraDetailItem {
    key: string;
    value: any;
    type: string;
    config?: any;
}

const extraDetails = computed<ExtraDetailItem[]>(() => {
    const fields = props.extraFields as Record<string, any> | undefined;
    if (!fields) return [];
    return Object.entries(fields)
        .filter(([, field]) => (field as any)?.type !== 'button' && (field as any)?.visibility !== 'hidden')
        .map(([key, value]) => ({
            key,
            value: isCustomDataObject(value) ? value.value : value,
            type: isCustomDataObject(value) ? value.type : 'text',
            config: isCustomDataObject(value) ? value.config : undefined,
        }));
});

const buttonActions = computed(() => {
    const fields = props.extraFields as Record<string, any> | undefined;
    if (!fields) return [];
    return (Object.values(fields) as any[])
        .filter(field => field?.type === 'button')
        .map(field => ({
            title: field.value,
            event: field.config?.action,
            variant: 'secondary' as const,
        }));
});

const titleClass = computed(() => [styles.title, extraDetails.value.length ? styles.titleWithExtraDetails : '']);

function formatPayoutDate(dateStr: string): string {
    return dateFormat(dateStr, DATE_FORMAT_PAYOUT_DETAILS);
}

const formatAmount = (amount: { value: number; currency: string }) => formatAmountWithCurrencyCode(amount.value, i18n.locale, amount.currency);

const fundsCapturedColumns = computed<BentoColumn[]>(() => [
    {
        field: 'label',
        label: i18n.get('payouts.details.breakdown.fields.fundsCaptured'),
        flex: 1,
    },
    {
        field: 'quantity',
        label: '',
        flex: 1,
        numeric: true,
    },
]);

const additionsColumns = computed<BentoColumn[]>(() => [
    {
        field: 'label',
        label: i18n.get('payouts.details.breakdown.fields.additions'),
        flex: 1,
    },
    {
        field: 'quantity',
        label: '',
        flex: 1,
        numeric: true,
    },
]);

const subtractionsColumns = computed<BentoColumn[]>(() => [
    {
        field: 'label',
        label: i18n.get('payouts.details.breakdown.fields.subtractions'),
        flex: 1,
    },
    {
        field: 'quantity',
        label: '',
        flex: 1,
        numeric: true,
    },
]);

const fundsCapturedRows = computed<BentoDatagridDataItem[]>(() =>
    (fundsCaptured.value ?? []).map((item, index) => ({
        id: `${item.key}-${index}`,
        label: getPayoutFundsCapturedType(i18n, item.key),
        quantity: item.value,
    }))
);

const additionsRows = computed<BentoDatagridDataItem[]>(() =>
    (adjustments.value?.additions ?? []).map((item, index) => ({
        id: `${item.key}-${index}`,
        label: getPayoutAdjustmentType(i18n, item.key),
        quantity: item.value,
    }))
);

const subtractionsRows = computed<BentoDatagridDataItem[]>(() =>
    (adjustments.value?.subtractions ?? []).map((item, index) => ({
        id: `${item.key}-${index}`,
        label: getPayoutAdjustmentType(i18n, item.key),
        quantity: item.value,
    }))
);
</script>

<template>
    <div v-if="!shouldHideTitle" :class="styles.pageTitle">
        <BentoTypography variant="title">{{ i18n.get('payouts.details.title') }}</BentoTypography>
    </div>

    <div v-if="payoutInner" :class="styles.root">
        <!-- Title section -->
        <BentoCard>
            <template #content>
                <div :class="titleClass">
                    <div :class="styles.titleContainer">
                        <BentoTypography variant="body">
                            {{ i18n.get('payouts.details.tags.netPayout') }}
                        </BentoTypography>
                        <BentoTag v-if="payoutInner.isSumOfSameDayPayouts" variant="blue" :label="i18n.get('payouts.details.tags.sameDaySum')" />
                    </div>
                    <BentoTypography v-if="payoutInner.payoutAmount" variant="title" medium>
                        {{ formatAmount(payoutInner.payoutAmount) }}
                    </BentoTypography>
                    <time v-if="payoutInner.createdAt" :datetime="payoutInner.createdAt">
                        <BentoTypography variant="body">
                            {{ formatPayoutDate(payoutInner.createdAt) }}
                        </BentoTypography>
                    </time>
                    <div>
                        <BentoTypography v-if="balanceAccountDescription" variant="body" strongest wide>
                            {{ balanceAccountDescription }}
                        </BentoTypography>
                        <BentoTypography variant="body" :class="styles.balanceAccountId">
                            {{ balanceAccountId }}
                        </BentoTypography>
                    </div>
                </div>
                <!-- Extra details (consumer-supplied) -->
                <BentoStructuredList v-if="extraDetails.length" :class="styles.extraDetails">
                    <BentoStructuredListItem
                        v-for="item in extraDetails"
                        :key="item.key"
                        :label="i18n.get(item.key as any)"
                        :class="styles.extraDetailsLabel"
                    >
                        <BentoLink
                            v-if="item.type === 'link' && item.config"
                            :class="item.config.className"
                            :to="item.config.href"
                            :target="item.config.target || '_blank'"
                            rel="noopener noreferrer"
                            external
                        >
                            {{ item.value }}
                        </BentoLink>
                        <div v-else-if="item.type === 'icon' && item.config" :class="[styles.extraDetailsIcon, item.config.className]">
                            <img :src="item.config.src" :alt="item.config.alt || item.value" :class="item.config.className" />
                            <BentoTypography variant="body">{{ item.value }}</BentoTypography>
                        </div>
                        <BentoTypography v-else variant="body" :class="item.config?.className">{{ item.value }}</BentoTypography>
                    </BentoStructuredListItem>
                </BentoStructuredList>
            </template>
        </BentoCard>

        <!-- Content: funds captured + adjustments + net payout -->
        <div :class="styles.content">
            <!-- Funds captured -->
            <div>
                <template v-if="payoutInner.fundsCapturedAmount">
                    <BentoCard v-if="fundsCaptured && fundsCaptured.length" expandable closed>
                        <template #header>
                            <div :class="styles.cardHeader">
                                <BentoTypography variant="body" strongest>{{
                                    i18n.get('payouts.details.breakdown.fields.fundsCaptured')
                                }}</BentoTypography>
                                <BentoTypography variant="body">{{ formatAmount(payoutInner.fundsCapturedAmount) }}</BentoTypography>
                            </div>
                        </template>
                        <template #content>
                            <div>
                                <div :class="styles.card">
                                    <BentoDataGrid
                                        outline
                                        data-testid="payout-funds-captured-breakdown"
                                        :class="[styles.dataGrid, styles.dataGridNoHeader]"
                                        :columns="fundsCapturedColumns"
                                        :data="fundsCapturedRows"
                                        :allow-row-clicks="false"
                                        :has-resizable-columns="false"
                                        :allow-column-drag-and-drop="false"
                                    >
                                        <template #item-label="{ item }">
                                            <BentoTypography variant="body">{{ item.label }}</BentoTypography>
                                        </template>
                                        <template #item-quantity="{ item }">
                                            <BentoTypography variant="body">{{ item.quantity }}</BentoTypography>
                                        </template>
                                    </BentoDataGrid>
                                </div>
                            </div>
                        </template>
                    </BentoCard>
                    <BentoCard v-else :class="styles.sectionAmount">
                        <template #content>
                            <div :class="styles.cardHeader">
                                <BentoTypography variant="body" strongest>
                                    {{ i18n.get('payouts.details.breakdown.fields.fundsCaptured') }}
                                </BentoTypography>
                                <BentoTypography variant="body">
                                    {{ formatAmount(payoutInner.fundsCapturedAmount) }}
                                </BentoTypography>
                            </div>
                        </template>
                    </BentoCard>
                </template>
            </div>

            <!-- Adjustments -->
            <div>
                <BentoCard v-if="adjustments && (adjustments.additions.length > 0 || adjustments.subtractions.length > 0)" expandable closed>
                    <template #header>
                        <div :class="styles.cardHeader">
                            <BentoTypography variant="body" strongest>
                                {{ i18n.get('payouts.details.breakdown.fields.adjustments') }}
                            </BentoTypography>
                            <BentoTypography v-if="payoutInner.adjustmentAmount" variant="body">
                                {{ formatAmount(payoutInner.adjustmentAmount) }}
                            </BentoTypography>
                        </div>
                    </template>
                    <template #content>
                        <div v-if="adjustments && adjustments.additions.length" :class="styles.card">
                            <div>
                                <BentoDataGrid
                                    outline
                                    data-testid="payout-adjustments-additions-breakdown"
                                    :class="styles.dataGrid"
                                    :columns="additionsColumns"
                                    :data="additionsRows"
                                    :allow-row-clicks="false"
                                    :has-resizable-columns="false"
                                    :allow-column-drag-and-drop="false"
                                >
                                    <template #item-label="{ item }">
                                        <BentoTypography variant="body">{{ item.label }}</BentoTypography>
                                    </template>
                                    <template #item-quantity="{ item }">
                                        <BentoTypography variant="body">{{ item.quantity }}</BentoTypography>
                                    </template>
                                </BentoDataGrid>
                            </div>
                        </div>
                        <div v-if="adjustments && adjustments.subtractions.length" :class="styles.card">
                            <div>
                                <BentoDataGrid
                                    outline
                                    data-testid="payout-adjustments-subtractions-breakdown"
                                    :class="styles.dataGrid"
                                    :columns="subtractionsColumns"
                                    :data="subtractionsRows"
                                    :allow-row-clicks="false"
                                    :has-resizable-columns="false"
                                    :allow-column-drag-and-drop="false"
                                >
                                    <template #item-label="{ item }">
                                        <BentoTypography variant="body">{{ item.label }}</BentoTypography>
                                    </template>
                                    <template #item-quantity="{ item }">
                                        <BentoTypography variant="body">{{ item.quantity }}</BentoTypography>
                                    </template>
                                </BentoDataGrid>
                            </div>
                        </div>
                    </template>
                </BentoCard>
                <BentoCard v-else :class="styles.sectionAmount">
                    <template #content>
                        <div :class="[styles.cardHeader, styles.cardHeaderSummary]">
                            <BentoTypography variant="body" strongest>
                                {{ i18n.get('payouts.details.breakdown.fields.adjustments') }}
                            </BentoTypography>
                            <BentoTypography v-if="payoutInner.adjustmentAmount" variant="body">
                                {{ formatAmount(payoutInner.adjustmentAmount) }}
                            </BentoTypography>
                        </div>
                    </template>
                </BentoCard>
            </div>

            <!-- Net payout (always shown) -->
            <div>
                <BentoCard>
                    <template #content>
                        <div :class="[styles.cardHeader, styles.cardHeaderSummary]">
                            <BentoTypography variant="body" strongest>
                                {{ i18n.get('payouts.details.breakdown.fields.netPayout') }}
                            </BentoTypography>
                            <BentoTypography v-if="payoutInner.payoutAmount" variant="body" strongest>
                                {{ formatAmount(payoutInner.payoutAmount) }}
                            </BentoTypography>
                        </div>
                    </template>
                </BentoCard>
            </div>
        </div>

        <!-- Unpaid amount -->
        <BentoCard v-if="payoutInner.unpaidAmount" :background="'secondary'">
            <template #content>
                <div :class="[styles.cardHeader, styles.cardHeaderSummary]">
                    <BentoTypography variant="body">{{ i18n.get('payouts.details.breakdown.fields.remainingAmount') }}</BentoTypography>
                    <BentoTypography variant="body">
                        {{ formatAmount(payoutInner.unpaidAmount) }}
                    </BentoTypography>
                </div>
            </template>
        </BentoCard>

        <!-- Button actions -->
        <div v-if="buttonActions.length" :class="styles.buttonActions">
            <BentoButtonActions :actions="buttonActions" layout="buttons-end" />
        </div>
    </div>
</template>
