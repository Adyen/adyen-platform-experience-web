<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { CopyText } from '@integration-components/composables-vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography, BentoLink } from '@adyen/bento-vue3';
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
        .map(([key, value]) => ({
            key: key as TransactionsTranslationKey,
            value: (value as any)?.value ?? value,
            type: (value as any)?.type ?? 'text',
            config: (value as any)?.config,
        }))
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
    <BentoStructuredList :class="styles.list">
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
            <div v-else-if="item.type === 'icon' && item.config" :class="item.config.className">
                <img :src="item.config.src" :alt="item.config.alt || item.value" />
                <BentoTypography variant="body">
                    {{ item.value }}
                </BentoTypography>
            </div>
            <BentoTypography v-else variant="body" :class="item.config?.className">
                {{ item.value }}
            </BentoTypography>
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
