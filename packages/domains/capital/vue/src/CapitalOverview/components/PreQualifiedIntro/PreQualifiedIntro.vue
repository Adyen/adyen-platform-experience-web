<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { BentoAlert, BentoButton } from '@adyen/bento-vue3';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { CAPITAL_OVERVIEW_CLASS_NAMES, sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import type { IAmount } from '@integration-components/types';
import CapitalHeader from '../../../shared/CapitalHeader/CapitalHeader.vue';
import './PreQualifiedIntro.scss';

const props = defineProps<{
    hideTitle?: boolean;
    maxAmount: IAmount;
    onOfferOptionsRequest: () => void;
    region?: string;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();

const analyticsProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Prequalified',
} as const;

const preQualifiedAmount = computed(() =>
    i18n.amount(props.maxAmount.value, props.maxAmount.currency, {
        minimumFractionDigits: 0,
    })
);

const onOfferOptionsRequestWithTracking = () => {
    try {
        props.onOfferOptionsRequest();
    } finally {
        userEvents.addEvent?.('Clicked button', { ...analyticsProperties, label: 'See options' });
    }
};

onMounted(() => {
    userEvents.addEvent?.('Landed on page', { ...analyticsProperties, label: 'Capital overview' });
});
</script>

<template>
    <div :class="CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrant">
        <CapitalHeader :hide-title="props.hideTitle" :region="props.region" title-key="capital.overview.common.titles.qualificationIntro" />
        <BentoAlert type="highlight">
            {{ i18n.get('capital.overview.prequalified.alreadyQualifyInfo.part1') }}
            <strong>
                {{ i18n.get('capital.overview.prequalified.alreadyQualifyInfo.part2', { values: { amount: preQualifiedAmount } }) }}
            </strong>
        </BentoAlert>
        <BentoButton :class="CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrantButton" @click="onOfferOptionsRequestWithTracking">
            {{ i18n.get('capital.overview.prequalified.actions.seeOptions') }}
        </BentoButton>
    </div>
</template>
