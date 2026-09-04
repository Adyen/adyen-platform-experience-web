<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import { getBankAccountDetails, type CapitalBankAccount } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import styles from './AccountDetails.module.scss';

const props = defineProps<{
    bankAccount: CapitalBankAccount;
    className?: string;
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
    <dl :class="[styles.root, props.className]">
        <div v-for="detail in accountDetails" :key="detail.field">
            <dt :class="styles.detailLabel">
                <BentoTypography el="span" variant="caption">
                    {{ i18n.get(detail.label) }}
                </BentoTypography>
            </dt>
            <dd :class="styles.detailContent">
                <div v-if="detail.textToCopy" :class="styles.copyableContent">
                    <BentoTypography el="span" variant="body" :stronger="detail.isPrimary">
                        {{ detail.content }}
                    </BentoTypography>
                    <BentoButton
                        variant="tertiary"
                        :aria-label="detail.copyButtonLabel ? i18n.get(detail.copyButtonLabel) : undefined"
                        @click="copyValue(detail.textToCopy)"
                    >
                        <CopyIcon />
                    </BentoButton>
                </div>
                <BentoTypography v-else el="span" variant="body" :stronger="detail.isPrimary">
                    {{ detail.content }}
                </BentoTypography>
            </dd>
        </div>
    </dl>
</template>
