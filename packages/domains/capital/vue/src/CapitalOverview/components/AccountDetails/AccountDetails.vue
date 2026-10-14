<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import { getBankAccountDetails, type CapitalBankAccount } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import styles from './AccountDetails.module.scss';
import { useLiveAnnouncement } from '@integration-components/composables-vue';
import accessibilityStyles from '@integration-components/style/accessibility.module.scss';

const props = defineProps<{
    bankAccount: CapitalBankAccount;
}>();

const { i18n } = useCoreContext();
const { announcement, announce } = useLiveAnnouncement();
const accountDetails = computed(() => getBankAccountDetails(props.bankAccount));

const copyValue = async (value: string) => {
    await navigator.clipboard?.writeText(value);
    announce(() => i18n.get('capital.common.actions.copy.labels.done'));
};
</script>

<template>
    <BentoStructuredList layout="33-66">
        <BentoStructuredListItem v-for="detail in accountDetails" :key="detail.field" :label="i18n.get(detail.label)">
            <div :class="styles.itemValue">
                <BentoTypography el="span" variant="body" :stronger="detail.isPrimary">
                    {{ detail.content }}
                </BentoTypography>
                <BentoButton
                    v-if="detail.textToCopy"
                    variant="tertiary"
                    :aria-label="detail.copyButtonLabel ? i18n.get(detail.copyButtonLabel) : undefined"
                    @click="copyValue(detail.textToCopy)"
                >
                    <CopyIcon />
                </BentoButton>
                <span :class="accessibilityStyles.visuallyHidden" aria-atomic="true" aria-live="polite">{{ announcement }}</span>
            </div>
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
