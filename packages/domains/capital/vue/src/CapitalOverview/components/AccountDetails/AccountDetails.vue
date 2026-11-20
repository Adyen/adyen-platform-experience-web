<script setup lang="ts">
import { computed } from 'vue';
import { BentoStructuredList, BentoStructuredListItem, BentoTypography } from '@adyen/bento-vue3';
import { getBankAccountDetails, type CapitalBankAccount } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import styles from './AccountDetails.module.scss';
import { CopyText } from '@integration-components/composables-vue';

const props = defineProps<{
    bankAccount: CapitalBankAccount;
}>();

const { i18n } = useCoreContext();
const accountDetails = computed(() => getBankAccountDetails(props.bankAccount));
</script>

<template>
    <BentoStructuredList layout="33-66">
        <BentoStructuredListItem v-for="detail in accountDetails" :key="detail.field" :label="i18n.get(detail.label)">
            <div :class="styles.itemValue">
                <CopyText
                    v-if="detail.textToCopy"
                    :copy-button-aria-label-key="detail.copyButtonLabel"
                    :show-copy-text-tooltip="false"
                    :text-to-copy="detail.textToCopy"
                    type="Default"
                >
                    <BentoTypography el="span" variant="body" :stronger="detail.isPrimary">
                        {{ detail.content }}
                    </BentoTypography>
                </CopyText>
                <BentoTypography v-else el="span" variant="body" :stronger="detail.isPrimary">
                    {{ detail.content }}
                </BentoTypography>
            </div>
        </BentoStructuredListItem>
    </BentoStructuredList>
</template>
