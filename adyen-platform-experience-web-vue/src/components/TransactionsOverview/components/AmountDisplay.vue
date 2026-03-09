<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext } from '../../../core/Context';

const props = defineProps<{
    amount: number;
    currency: string;
    description?: string;
    label: string;
    large?: boolean;
}>();

const { i18n } = useCoreContext();

const formattedAmount = computed(() => i18n.amount(props.amount, props.currency));

const BASE_CLASS = 'adyen-pe-amount-display';
</script>

<template>
    <div :class="BASE_CLASS">
        <div :class="`${BASE_CLASS}__label`">
            <span>{{ props.label }}</span>
            <!-- TODO: Add Tooltip with description if provided -->
        </div>

        <div :class="[`${BASE_CLASS}__amount`, { [`${BASE_CLASS}__amount--large`]: props.large }]">
            <span :class="props.large ? 'title-large' : 'subtitle-stronger'">
                {{ formattedAmount }}
            </span>
            <span :class="[`${BASE_CLASS}__currency`, props.large ? 'subtitle-stronger' : 'caption-stronger']">
                {{ props.currency }}
            </span>
        </div>
    </div>
</template>
