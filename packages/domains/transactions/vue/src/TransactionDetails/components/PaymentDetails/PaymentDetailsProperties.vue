<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { CopyText, CustomDetailValue } from '@integration-components/composables-vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import {
    getPaymentDetailsItems,
    sharedTransactionDetailsEventProperties,
    type TransactionDetails,
    type TransactionDetailsCustomization,
    type TransactionsTranslationKey,
} from '../../../../../domain/src';
import styles from './PaymentDetails.module.scss';

const props = defineProps<{
    dataCustomization?: { details?: TransactionDetailsCustomization };
    extraFields: Record<string, any> | undefined;
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();

const standardItems = computed(() => getPaymentDetailsItems(i18n, props.transaction, props.dataCustomization?.details));

const customItems = computed(() =>
    Object.entries(props.extraFields ?? {})
        .filter(([, value]) => (value as any)?.type !== 'button')
        .map(([key, value]) => ({ key: key as TransactionsTranslationKey, value }))
);

function trackCopy(trackingName?: string) {
    if (!trackingName) return;

    userEvents.addEvent?.('Clicked button', {
        ...sharedTransactionDetailsEventProperties,
        sectionName: 'Details',
        label: 'Copy button',
        subSectionName: trackingName,
    });
}
</script>

<template>
    <BentoStructuredList>
        <BentoStructuredListItem v-for="item in standardItems" :key="item.id ?? item.key" :label="i18n.get(item.key)">
            <template v-if="item.copyable" #default>
                <div :class="styles.copyableValue">
                    <CopyText
                        :copy-button-aria-label-key="item.copyAriaLabelKey"
                        :on-copy-text="() => trackCopy(item.trackingName)"
                        :show-copy-text-tooltip="false"
                        :text-to-copy="item.value"
                        type="Default"
                    >
                        <BentoTypography variant="body">
                            {{ item.value }}
                        </BentoTypography>
                    </CopyText>
                </div>
            </template>
            <template v-else #default>
                <BentoTypography variant="body">
                    {{ item.value }}
                </BentoTypography>
            </template>
        </BentoStructuredListItem>

        <BentoStructuredListItem v-for="item in customItems" :key="item.key" :label="i18n.get(item.key)">
            <CustomDetailValue :value="item.value" />
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
