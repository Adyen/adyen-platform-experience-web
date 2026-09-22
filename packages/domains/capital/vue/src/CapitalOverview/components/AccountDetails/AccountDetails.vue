<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import { getBankAccountDetails, type CapitalBankAccount } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import styles from './AccountDetails.module.scss';

const props = defineProps<{
    bankAccount: CapitalBankAccount;
}>();

const { i18n } = useCoreContext();

const accountDetails = computed(() => getBankAccountDetails(props.bankAccount));

const copyValue = (value: string) => {
    void navigator.clipboard?.writeText(value).catch(() => {
        // Silently ignore or handle copy failure
    });
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
            </div>
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
