<script setup lang="ts">
import { ref, computed, watch, type ComponentPublicInstance } from 'vue';
import { BentoButton, BentoPopover, BentoRadioGroup, BentoDateRangePicker, BentoClickOutside } from '@adyen/bento-vue3';
import type { BentoDateRangePickerValue } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import type { IBalanceAccountBase } from '../types';
import { EARLIEST_PAYOUT_SINCE_DATE } from '../constants';

const props = defineProps<{
    balanceAccounts?: IBalanceAccountBase[];
    onChange?: (params: { balanceAccountId: string | undefined; createdSince: string; createdUntil: string }) => void;
}>();

const { i18n } = useCoreContext();

const balanceAccount = ref<IBalanceAccountBase | undefined>(undefined);

const now = new Date();
const earliestDate = new Date(EARLIEST_PAYOUT_SINCE_DATE);

function subDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = (day - 1 + 7) % 7;
    d.setDate(d.getDate() - diff);
    return d;
}

function startOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfYear(date: Date): Date {
    const d = new Date(date);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

const quickSelectRanges = [
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.last7Days'),
        value: 'last7Days',
        data: { startDate: subDays(now, 6) },
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.last30Days'),
        value: 'last30Days',
        data: { startDate: subDays(now, 29) },
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.last180Days'),
        value: 'last180Days',
        data: { startDate: subDays(now, 179) },
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.thisWeek'),
        value: 'thisWeek',
        data: { startDate: startOfWeek(now) },
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.lastWeek'),
        value: 'lastWeek',
        data: {
            startDate: (() => {
                const d = startOfWeek(now);
                d.setDate(d.getDate() - 7);
                return d;
            })(),
            endDate: (() => {
                const d = startOfWeek(now);
                d.setMilliseconds(d.getMilliseconds() - 1);
                return d;
            })(),
        },
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.thisMonth'),
        value: 'thisMonth',
        data: { startDate: startOfMonth(now) },
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.lastMonth'),
        value: 'lastMonth',
        data: {
            startDate: (() => {
                const d = startOfMonth(now);
                d.setMonth(d.getMonth() - 1);
                return d;
            })(),
            endDate: (() => {
                const d = startOfMonth(now);
                d.setMilliseconds(d.getMilliseconds() - 1);
                return d;
            })(),
        },
    },
    {
        label: i18n.get('common.filters.types.date.rangeSelect.options.yearToDate'),
        value: 'yearToDate',
        data: { startDate: startOfYear(now) },
    },
];

const dateRangeValue = ref<BentoDateRangePickerValue>({
    startDate: subDays(now, 29),
    endDate: now,
    range: 'last30Days',
});

const balanceAccountPopoverOpen = ref(false);
const balanceAccountTriggerRef = ref<ComponentPublicInstance | null>(null);

// Auto-select first balance account when available
watch(
    () => props.balanceAccounts,
    accounts => {
        if (accounts?.length && !balanceAccount.value) {
            balanceAccount.value = accounts[0];
        }
    },
    { immediate: true }
);

const currentFilterParams = computed(() => {
    const fromMs = Math.max(dateRangeValue.value.startDate.getTime(), earliestDate.getTime());
    return {
        balanceAccountId: balanceAccount.value?.id,
        createdSince: new Date(fromMs).toISOString(),
        createdUntil: dateRangeValue.value.endDate.toISOString(),
    };
});

watch(
    currentFilterParams,
    params => {
        props.onChange?.(params);
    },
    { deep: true, immediate: true }
);

const balanceAccountItems = computed(() =>
    (props.balanceAccounts ?? []).map((a: IBalanceAccountBase) => ({
        label: a.description || a.id,
        value: a.id,
    }))
);

function onBalanceAccountSelect(value: string | number) {
    const id = String(value);
    const account = props.balanceAccounts?.find((a: IBalanceAccountBase) => a.id === id);
    if (account) balanceAccount.value = account;
    balanceAccountPopoverOpen.value = false;
}

function onDateRangeInput(value: BentoDateRangePickerValue) {
    dateRangeValue.value = value;
}
</script>

<template>
    <bento-click-outside v-if="balanceAccounts && balanceAccounts.length > 1" @handler="balanceAccountPopoverOpen = false">
        <bento-button ref="balanceAccountTriggerRef" variant="secondary" size="small" @click="balanceAccountPopoverOpen = !balanceAccountPopoverOpen">
            {{ i18n.get('common.filters.types.account.label') }}
        </bento-button>

        <bento-popover
            v-if="balanceAccountTriggerRef"
            :open="balanceAccountPopoverOpen"
            :target-element="balanceAccountTriggerRef"
            position="bottom-start"
            @dismiss="balanceAccountPopoverOpen = false"
        >
            <bento-radio-group
                :label="i18n.get('common.filters.types.account.label')"
                :items="balanceAccountItems"
                :model-value="balanceAccount?.id"
                :hide-label="true"
                @update:model-value="onBalanceAccountSelect"
            />
        </bento-popover>
    </bento-click-outside>

    <bento-date-range-picker
        :has-actions="true"
        :model-value="dateRangeValue"
        :min="earliestDate"
        :max="new Date()"
        :number-of-months="1"
        :quick-select-ranges="quickSelectRanges"
        @input="onDateRangeInput"
    />
</template>
