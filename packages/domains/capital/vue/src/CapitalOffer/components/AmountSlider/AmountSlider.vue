<script setup lang="ts">
import { computed } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useUniqueId } from '@integration-components/composables-vue';
import type { IDynamicOffersConfig } from '@integration-components/types';
import Slider from '../Slider/Slider.vue';
import styles from './AmountSlider.module.scss';

const props = defineProps<{
    dynamicOfferConfig: IDynamicOffersConfig;
    value: number;
    onRelease?: (value: number) => void;
    onValueChange?: (value: number) => void;
}>();

const { i18n } = useCoreContext();
const elementBaseId = useUniqueId();
const labelId = `${elementBaseId}-label`;
const sliderId = `${elementBaseId}-slider`;
const currency = computed(() => props.dynamicOfferConfig.minAmount.currency);
const formattedAmount = computed(() => i18n.amount(props.value, currency.value, { maximumFractionDigits: 0 }));

const getValue = (event: Event) => Number((event.target as HTMLInputElement).value);
const handleValueChange = (event: Event) => props.onValueChange?.(getValue(event));
const handleRelease = (event: Event) => props.onRelease?.(getValue(event));
</script>

<template>
    <div :class="styles.root">
        <label :id="labelId" :for="sliderId" :class="styles.label">
            <BentoTypography variant="body" stronger>
                {{ i18n.get('capital.offer.selection.slider.a11y.label') }}
            </BentoTypography>
        </label>
        <output :aria-labelledby="labelId" :for="sliderId" :class="styles.value" aria-live="polite">
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
            :value="value"
            @input="handleValueChange"
            @change="handleRelease"
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
