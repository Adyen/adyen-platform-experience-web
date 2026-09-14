<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { useUniqueId } from '@integration-components/composables-vue';
import type { IDynamicOffersConfig } from '@integration-components/types';
import Slider from '../Slider/Slider.vue';
import styles from './AmountSelector.module.scss';
import {
    getDefaultAmountValue,
    getPercentageOfRange,
    getRelativeToDefault,
    sharedCapitalOfferAnalyticsEventProperties,
} from '@integration-components/capital/domain';

const props = defineProps<{
    dynamicOfferConfig: IDynamicOffersConfig;
    isEarlyRenewal: boolean;
    amountValue: number;
    onAmountValueChange: (value: number) => void;
    onAmountValueChangeCommitted: (value: number) => void;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const hasEmittedInitialChangeEvent = ref(false);
const elementBaseId = useUniqueId();
const labelId = `${elementBaseId}-label`;
const sliderId = `${elementBaseId}-slider`;
const currency = computed(() => props.dynamicOfferConfig.minAmount.currency);
const formattedAmount = computed(() => i18n.amount(props.amountValue, currency.value, { maximumFractionDigits: 0 }));

const getValue = (event: Event) => Number((event.target as HTMLInputElement).value);

const emitChangeEvent = (amountValue: number) => {
    const config = props.dynamicOfferConfig;

    userEvents.addEvent?.('Changed capital offer slider', {
        ...sharedCapitalOfferAnalyticsEventProperties,
        subCategory: 'Business financing offer',
        label: 'Slider changed',
        currency: config.minAmount.currency,
        value: amountValue,
        valuePercentage: getPercentageOfRange(amountValue, config.minAmount.value, config.maxAmount.value),
        min: config.minAmount.value,
        max: config.maxAmount.value,
        relativeToDefault: getRelativeToDefault(amountValue, getDefaultAmountValue(config)),
        isEarlyRenewal: props.isEarlyRenewal,
    });
};

// Emit initial amount change event
watch(
    [() => props.dynamicOfferConfig, () => props.amountValue],
    ([dynamicOfferConfig, amountValue]) => {
        if (!hasEmittedInitialChangeEvent.value && dynamicOfferConfig && amountValue !== undefined) {
            hasEmittedInitialChangeEvent.value = true;
            emitChangeEvent(amountValue);
        }
    },
    { immediate: true }
);

const handleChange = (event: Event) => {
    const value = getValue(event);
    props.onAmountValueChangeCommitted?.(value);
    emitChangeEvent(value);
};

const handleInput = (event: Event) => {
    props.onAmountValueChange?.(getValue(event));
};
</script>

<template>
    <div :class="styles.root">
        <label :id="labelId" :for="sliderId" :class="styles.label">
            <BentoTypography variant="body" stronger>
                {{ i18n.get('capital.offer.selection.slider.a11y.label') }}
            </BentoTypography>
        </label>
        <output :aria-labelledby="labelId" :for="sliderId" aria-live="polite">
            <BentoTypography variant="title" large>
                {{ formattedAmount }}
            </BentoTypography>
        </output>
        <Slider
            :id="sliderId"
            :aria-valuetext="formattedAmount"
            :max="props.dynamicOfferConfig.maxAmount.value"
            :min="props.dynamicOfferConfig.minAmount.value"
            :step="props.dynamicOfferConfig.step"
            :value="amountValue"
            @change="handleChange"
            @input="handleInput"
        />
        <div :class="styles.rangeLabels" aria-hidden="true">
            <div :class="styles.rangeLabel">
                <BentoTypography variant="caption">
                    {{ i18n.get('capital.offer.selection.slider.markers.min') }}
                </BentoTypography>
                <BentoTypography variant="body">
                    {{ i18n.amount(props.dynamicOfferConfig.minAmount.value, currency, { maximumFractionDigits: 0 }) }}
                </BentoTypography>
            </div>
            <div :class="styles.rangeLabel">
                <BentoTypography variant="caption">
                    {{ i18n.get('capital.offer.selection.slider.markers.max') }}
                </BentoTypography>
                <BentoTypography variant="body">
                    {{ i18n.amount(props.dynamicOfferConfig.maxAmount.value, currency, { maximumFractionDigits: 0 }) }}
                </BentoTypography>
            </div>
        </div>
    </div>
</template>
