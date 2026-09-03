<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoTab, BentoTabs } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import { buildPaymentLinkListItems } from '@integration-components/payByLink/domain';
import type { IPaymentLinkDetails } from '@integration-components/types';
import PaymentLinkActivity from '../PaymentLinkActivity/PaymentLinkActivity.vue';
import PaymentLinkTabsList from './PaymentLinkTabsList.vue';
import styles from './PaymentLinkTabs.module.scss';

const props = defineProps<{
    paymentLink: IPaymentLinkDetails;
}>();

const { i18n } = useCoreContext();
const { dateFormat } = useTimezoneAwareDateFormatting();

const tabs = [
    { id: 'linkInformation', label: 'payByLink.details.tabs.linkInformation' },
    { id: 'shopperInformation', label: 'payByLink.details.tabs.shopperInformation' },
    { id: 'activity', label: 'payByLink.details.tabs.activity' },
] as const;

const activeTabIndex = ref(0);

function onTabChange(index: number) {
    activeTabIndex.value = index;
}

const listItems = computed(() => buildPaymentLinkListItems(props.paymentLink, { i18n, dateFormat }));
</script>

<template>
    <div :class="styles.root">
        <BentoTabs :active-tab-index="activeTabIndex" @update:active-tab-index="onTabChange">
            <BentoTab v-for="tab in tabs" :key="tab.id" :title="i18n.get(tab.label)">
                <PaymentLinkTabsList v-if="tab.id === 'linkInformation'" :items="listItems.linkInformation" />

                <template v-else-if="tab.id === 'shopperInformation'">
                    <PaymentLinkTabsList :items="listItems.shopperInformation" />

                    <div v-if="listItems.shippingAddress.length > 0">
                        <PaymentLinkTabsList :heading="'payByLink.details.fields.shippingAddress.title'" :items="listItems.shippingAddress" />
                    </div>

                    <div v-if="listItems.billingAddress.length > 0">
                        <PaymentLinkTabsList :heading="'payByLink.details.fields.billingAddress.title'" :items="listItems.billingAddress" />
                    </div>
                </template>

                <PaymentLinkActivity v-else-if="tab.id === 'activity'" :activities="paymentLink.paymentLinkActivities ?? []" />
            </BentoTab>
        </BentoTabs>
    </div>
</template>
