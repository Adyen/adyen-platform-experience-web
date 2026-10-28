<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { useLiveAnnouncement } from '@integration-components/composables-vue';
import {
    BentoStructuredList,
    BentoStructuredListItem,
    BentoTypography,
    BentoLink,
    BentoButton,
    BentoTooltipDirective as vBentoTooltip,
} from '@adyen/bento-vue3';
import {
    getPaymentDetailsItems,
    sharedTransactionDetailsEventProperties,
    type TransactionDetails,
    type TransactionDetailsCustomization,
    type TransactionsTranslationKey,
} from '../../../../../domain/src';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import accessibilityStyles from '@integration-components/style/accessibility.module.scss';
import styles from './PaymentDetails.module.scss';

const props = defineProps<{
    dataCustomization?: { details?: TransactionDetailsCustomization };
    extraFields: Record<string, any> | undefined;
    transaction: TransactionDetails;
}>();

const { i18n } = useCoreContext();
const { announce, announcement } = useLiveAnnouncement();
const userEvents = useEventDispatcherContext();
const copiedItemId = ref<string>();

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

function onCopyText(text: string, itemId?: string, trackingName?: string) {
    if (!navigator.clipboard) return;

    navigator.clipboard.writeText(text);
    copiedItemId.value = itemId;

    if (trackingName) {
        userEvents.addEvent?.('Clicked button', {
            ...sharedTransactionDetailsEventProperties,
            sectionName: 'Details',
            label: 'Copy button',
            subSectionName: trackingName,
        });
    }

    announce(() => i18n.get('transactions.common.actions.copy.labels.done'));
}

function getCopyTooltip(itemId?: string) {
    const key = copiedItemId.value === itemId ? 'transactions.common.actions.copy.labels.done' : 'transactions.common.actions.copy.labels.default';
    return i18n.get(key);
}

function resetCopiedItem() {
    copiedItemId.value = undefined;
}
</script>

<template>
    <BentoStructuredList :class="styles.list">
        <BentoStructuredListItem v-for="item in standardItems" :key="item.id ?? item.key" :label="i18n.get(item.key)">
            <template v-if="item.copyable" #default>
                <div :class="styles.copyableValue">
                    <BentoTypography variant="body">
                        {{ item.value }}
                    </BentoTypography>
                    <BentoButton
                        v-bento-tooltip="getCopyTooltip(item.id)"
                        variant="tertiary"
                        :aria-label="item.copyAriaLabelKey ? i18n.get(item.copyAriaLabelKey) : undefined"
                        @click="() => onCopyText(item.value, item.id, item.trackingName)"
                        @blur="resetCopiedItem"
                        @mouseleave="resetCopiedItem"
                    >
                        <CopyIcon />
                    </BentoButton>
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
    <span :class="accessibilityStyles.visuallyHidden" aria-atomic="true" aria-live="polite">{{ announcement }}</span>
</template>
