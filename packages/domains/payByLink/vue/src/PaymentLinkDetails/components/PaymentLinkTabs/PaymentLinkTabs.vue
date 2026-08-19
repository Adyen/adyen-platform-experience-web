<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoTab, BentoTabs } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useLiveAnnouncement } from '@integration-components/composables-vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import { buildPaymentLinkListItems } from '@integration-components/payByLink/domain';
import type { IPaymentLinkDetails } from '@integration-components/types';
import PaymentLinkActivity from '../PaymentLinkActivity/PaymentLinkActivity.vue';
import PaymentLinkTabsList from './PaymentLinkTabsList.vue';
import './PaymentLinkTabs.scss';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-tabs',
};

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
const copiedItemId = ref<string>();
const { announce, announcement } = useLiveAnnouncement();

function onTabChange(index: number) {
    activeTabIndex.value = index;
}

function onCopy(copyId: string) {
    copiedItemId.value = copyId;
    announce(() => i18n.get('common.actions.copy.labels.done'));
}

function resetCopiedItem() {
    copiedItemId.value = undefined;
}

const listItems = computed(() => buildPaymentLinkListItems(props.paymentLink, { i18n, dateFormat }));
</script>

<template>
    <div :class="CLASSNAMES.root">
        <BentoTabs :active-tab-index="activeTabIndex" @update:active-tab-index="onTabChange">
            <BentoTab v-for="tab in tabs" :key="tab.id" :title="i18n.get(tab.label)">
                <PaymentLinkTabsList
                    v-if="tab.id === 'linkInformation'"
                    :items="listItems.linkInformation"
                    :copied-item-id="copiedItemId"
                    @copied="onCopy"
                    @clear-copied="resetCopiedItem"
                />

                <template v-else-if="tab.id === 'shopperInformation'">
                    <PaymentLinkTabsList
                        :items="listItems.shopperInformation"
                        :copied-item-id="copiedItemId"
                        @copied="onCopy"
                        @clear-copied="resetCopiedItem"
                    />

                    <div v-if="listItems.shippingAddress.length > 0">
                        <PaymentLinkTabsList
                            :heading="'payByLink.details.fields.shippingAddress.title'"
                            :items="listItems.shippingAddress"
                            :copied-item-id="copiedItemId"
                            @copied="onCopy"
                            @clear-copied="resetCopiedItem"
                        />
                    </div>

                    <div v-if="listItems.billingAddress.length > 0">
                        <PaymentLinkTabsList
                            :heading="'payByLink.details.fields.billingAddress.title'"
                            :items="listItems.billingAddress"
                            :copied-item-id="copiedItemId"
                            @copied="onCopy"
                            @clear-copied="resetCopiedItem"
                        />
                    </div>
                </template>

                <PaymentLinkActivity v-else-if="tab.id === 'activity'" :activities="paymentLink.paymentLinkActivities ?? []" />
            </BentoTab>
        </BentoTabs>
        <span class="adyen-pe-visually-hidden" aria-atomic="true" aria-live="polite">{{ announcement }}</span>
    </div>
</template>
