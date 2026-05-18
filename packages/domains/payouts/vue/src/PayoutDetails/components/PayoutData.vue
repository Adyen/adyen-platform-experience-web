<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import {
    createDynamicTranslationFactory,
    createKeyFactoryFromConfig,
    type TranslationFactoryFunction,
    type TranslationFallbackFunction,
} from '@integration-components/core';
import { BentoTypography, BentoCard, BentoTag, BentoLink, BentoButtonActions, BentoDataGrid } from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem } from '@adyen/bento-vue3';
import type { IPayoutDetails } from '@integration-components/types';
import { DATE_FORMAT_PAYOUT_DETAILS } from '@integration-components/utils';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import {
    PD_BASE_CLASS,
    PD_BUTTON_ACTIONS,
    PD_CARD_CLASS,
    PD_CARD_HEADER_CLASS,
    PD_CONTENT_CLASS,
    PD_DATA_GRID_CLASS,
    PD_EXTRA_DETAILS_CLASS,
    PD_EXTRA_DETAILS_ICON,
    PD_EXTRA_DETAILS_LABEL,
    PD_SECTION_AMOUNT_CLASS,
    PD_SECTION_CLASS,
    PD_SECTION_GROSS_AMOUNT_CLASS,
    PD_SECTION_NET_AMOUNT_CLASS,
    PD_SUMMARY_CARD_HEADER_CLASS,
    PD_TITLE_BA_CLASS,
    PD_TITLE_CLASS,
    PD_TITLE_CLASS_WITH_EXTRA_DETAILS,
    PD_TITLE_CONTAINER_CLASS,
    PD_UNPAID_AMOUNT,
} from '../constants';
import type { PayoutDetailsCustomization } from '../types';
import '../styles/PayoutData.scss';

const props = defineProps<{
    payout?: IPayoutDetails;
    balanceAccountId: string;
    balanceAccountDescription?: string;
    extraFields?: Record<string, any> | undefined;
    dataCustomization?: { details?: PayoutDetailsCustomization };
}>();

const { i18n } = useCoreContext();
const { dateFormat } = useTimezoneAwareDateFormatting('UTC');

// ── Translation factories (local copies of the Preact getters since they live
// in the Preact-coupled `src/components/utils/translation/getters.ts`) ──
const originalValueFallback: TranslationFallbackFunction = (_, value) => value;
const payoutAdjustmentTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'payouts.details.breakdown.adjustments.types.' });
const getPayoutAdjustmentType: TranslationFactoryFunction = createDynamicTranslationFactory(payoutAdjustmentTypeKeyFactory, originalValueFallback);
const payoutFundsCapturedTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'payouts.details.breakdown.fundsCaptured.types.' });
const getPayoutFundsCapturedType: TranslationFactoryFunction = createDynamicTranslationFactory(
    payoutFundsCapturedTypeKeyFactory,
    originalValueFallback
);

const payoutInner = computed(() => props.payout?.payout);

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
        }));
});

const titleClass = computed(() => [PD_TITLE_CLASS, extraDetails.value.length ? PD_TITLE_CLASS_WITH_EXTRA_DETAILS : '']);

function formatPayoutDate(dateStr: string): string {
    return dateFormat(dateStr, DATE_FORMAT_PAYOUT_DETAILS);
}

function formatAmount(amount: { value: number; currency: string }): string {
    return `${i18n.amount(amount.value, amount.currency, { hideCurrency: true })} ${amount.currency}`;
}

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
    <div v-if="payoutInner" :class="PD_BASE_CLASS">
        <!-- Title section -->
        <BentoCard>
            <div :class="titleClass">
                <div :class="PD_TITLE_CONTAINER_CLASS">
                    <BentoTypography variant="subtitle" stronger>
                        {{ i18n.get('payouts.details.tags.netPayout') }}
                    </BentoTypography>
                    <BentoTag v-if="payoutInner.isSumOfSameDayPayouts" variant="blue" :label="i18n.get('payouts.details.tags.sameDaySum')" />
                </div>
                <BentoTypography variant="title" large>
                    {{ formatAmount(payoutInner.payoutAmount) }}
                </BentoTypography>
                <time v-if="payoutInner.createdAt" :datetime="payoutInner.createdAt">
                    <BentoTypography variant="body">
                        {{ formatPayoutDate(payoutInner.createdAt) }}
                    </BentoTypography>
                </time>
                <div :class="PD_SECTION_CLASS">
                    <BentoTypography v-if="balanceAccountDescription" variant="body" strongest wide>
                        {{ balanceAccountDescription }}
                    </BentoTypography>
                    <BentoTypography variant="caption" :class="PD_TITLE_BA_CLASS">{{ balanceAccountId }}</BentoTypography>
                </div>
            </div>
        </BentoCard>

        <!-- Extra details (consumer-supplied) -->
        <div v-if="extraDetails.length">
            <ul :class="PD_EXTRA_DETAILS_CLASS">
                <li v-for="item in extraDetails" :key="item.key">
                    <div :class="PD_EXTRA_DETAILS_LABEL">{{ i18n.get(item.key as any) }}</div>
                    <BentoLink
                        v-if="item.type === 'link' && item.config"
                        :class="item.config.className"
                        :to="item.config.href"
                        :target="item.config.target || '_blank'"
                        isNotRouting
                    >
                        {{ item.value }}
                    </BentoLink>
                    <div v-else-if="item.type === 'icon' && item.config" :class="[PD_EXTRA_DETAILS_ICON, item.config.className]">
                        <img :src="item.config.src" :alt="item.config.alt || item.value" />
                        <BentoTypography variant="body">{{ item.value }}</BentoTypography>
                    </div>
                    <BentoTypography v-else variant="body" :class="item.config?.className">
                        {{ item.value }}
                    </BentoTypography>
                </li>
            </ul>
        </div>

        <!-- Content: funds captured + adjustments + net payout -->
        <div :class="PD_CONTENT_CLASS">
            <!-- Funds captured -->
            <div :class="PD_SECTION_CLASS">
                <template v-if="payoutInner.fundsCapturedAmount">
                    <BentoCard v-if="fundsCaptured && fundsCaptured.length" expandable closed>
                        <template #header>
                            <div :class="PD_CARD_HEADER_CLASS">
                                <BentoTypography variant="body" strongest>{{
                                    i18n.get('payouts.details.breakdown.fields.fundsCaptured')
                                }}</BentoTypography>
                                <BentoTypography variant="body">{{ formatAmount(payoutInner.fundsCapturedAmount) }}</BentoTypography>
                            </div>
                        </template>
                        <template #content>
                            <div :class="PD_SECTION_CLASS">
                                <div :class="PD_CARD_CLASS">
                                    <BentoDataGrid
                                        outline
                                        data-testid="payout-funds-captured-breakdown"
                                        :class="PD_DATA_GRID_CLASS"
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
                    <BentoCard v-else :class="[PD_SECTION_AMOUNT_CLASS, PD_SECTION_GROSS_AMOUNT_CLASS]">
                        <template #content>
                            <div :class="PD_CARD_HEADER_CLASS">
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
            <div :class="PD_SECTION_CLASS">
                <BentoCard v-if="adjustments && (adjustments.additions.length > 0 || adjustments.subtractions.length > 0)" expandable closed>
                    <template #header>
                        <div :class="PD_CARD_HEADER_CLASS">
                            <BentoTypography variant="body" strongest>
                                {{ i18n.get('payouts.details.breakdown.fields.adjustments') }}
                            </BentoTypography>
                            <BentoTypography variant="body">
                                {{ formatAmount(payoutInner.adjustmentAmount) }}
                            </BentoTypography>
                        </div>
                    </template>
                    <template #content>
                        <div v-if="adjustments && adjustments.additions.length" :class="PD_CARD_CLASS">
                            <div>
                                <BentoDataGrid
                                    outline
                                    data-testid="payout-adjustments-additions-breakdown"
                                    :class="PD_DATA_GRID_CLASS"
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
                        <div v-if="adjustments && adjustments.subtractions.length" :class="PD_CARD_CLASS">
                            <div>
                                <BentoDataGrid
                                    outline
                                    data-testid="payout-adjustments-subtractions-breakdown"
                                    :class="PD_DATA_GRID_CLASS"
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
                <BentoCard v-else :class="[PD_SECTION_AMOUNT_CLASS, PD_SECTION_GROSS_AMOUNT_CLASS]">
                    <template #content>
                        <div :class="[PD_CARD_HEADER_CLASS, PD_SUMMARY_CARD_HEADER_CLASS]">
                            <BentoTypography variant="body" strongest>
                                {{ i18n.get('payouts.details.breakdown.fields.adjustments') }}
                            </BentoTypography>
                            <BentoTypography variant="body" stronger>
                                {{ formatAmount(payoutInner.adjustmentAmount) }}
                            </BentoTypography>
                        </div>
                    </template>
                </BentoCard>
            </div>

            <!-- Net payout (always shown) -->
            <div :class="PD_SECTION_CLASS">
                <BentoCard>
                    <template #content>
                        <div :class="[PD_CARD_HEADER_CLASS, PD_SUMMARY_CARD_HEADER_CLASS, PD_SECTION_NET_AMOUNT_CLASS]">
                            <BentoTypography variant="body" strongest>
                                {{ i18n.get('payouts.details.breakdown.fields.netPayout') }}
                            </BentoTypography>
                            <BentoTypography variant="body" strongest>
                                {{ formatAmount(payoutInner.payoutAmount) }}
                            </BentoTypography>
                        </div>
                    </template>
                </BentoCard>
            </div>
        </div>

        <!-- Unpaid amount -->
        <BentoCard v-if="payoutInner.unpaidAmount" :class="PD_UNPAID_AMOUNT">
            <template #content>
                <div :class="[PD_CARD_HEADER_CLASS, PD_SUMMARY_CARD_HEADER_CLASS]">
                    <BentoTypography variant="body">{{ i18n.get('payouts.details.breakdown.fields.remainingAmount') }}</BentoTypography>
                    <BentoTypography variant="body">
                        {{ formatAmount(payoutInner.unpaidAmount) }}
                    </BentoTypography>
                </div>
            </template>
        </BentoCard>

        <!-- Button actions -->
        <div v-if="buttonActions.length" :class="PD_BUTTON_ACTIONS">
            <BentoButtonActions :actions="buttonActions" layout="BUTTONS_END" />
        </div>
    </div>
</template>
