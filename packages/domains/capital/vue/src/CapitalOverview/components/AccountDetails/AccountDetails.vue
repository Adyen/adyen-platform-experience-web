<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton, BentoTypography } from '@adyen/bento-vue3';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import {
    getBankAccountFieldCopyButtonTranslationKey,
    getBankAccountFieldFormattedValue,
    getBankAccountFields,
    getBankAccountFieldTextToCopy,
    getBankAccountFieldTranslationKey,
    isBankAccountFieldPrimary,
    type CapitalBankAccount,
    type CapitalBankAccountField,
} from '@integration-components/capital/domain';
import type { TranslationKey } from '@integration-components/core';
import { useCoreContext } from '@integration-components/core/vue';
import { ACCOUNT_DETAILS_CLASS_NAMES } from './constants';
import './AccountDetails.scss';

type AccountDetail = {
    content: string;
    copyButtonLabel?: TranslationKey;
    field: string;
    isPrimary: boolean;
    label: TranslationKey;
    textToCopy?: string;
};

const props = defineProps<{
    bankAccount: CapitalBankAccount;
    className?: string;
}>();

const { i18n } = useCoreContext();

const accountDetails = computed<AccountDetail[]>(() => {
    const details: AccountDetail[] = [];

    for (const field of getBankAccountFields(props.bankAccount)) {
        const value = props.bankAccount[field as CapitalBankAccountField];

        if (typeof value !== 'string' || !value) {
            continue;
        }

        const content = getBankAccountFieldFormattedValue(field, value);

        if (!content) {
            continue;
        }

        details.push({
            content,
            copyButtonLabel: getBankAccountFieldCopyButtonTranslationKey(field),
            field,
            isPrimary: isBankAccountFieldPrimary(field),
            label: getBankAccountFieldTranslationKey(field),
            textToCopy: getBankAccountFieldTextToCopy(field, value),
        });
    }

    return details;
});

const copyValue = (value: string) => {
    void navigator.clipboard?.writeText(value);
};
</script>

<template>
    <dl :class="[ACCOUNT_DETAILS_CLASS_NAMES.base, props.className]">
        <div v-for="detail in accountDetails" :key="detail.field" :class="ACCOUNT_DETAILS_CLASS_NAMES.detail">
            <dt :class="ACCOUNT_DETAILS_CLASS_NAMES.detailLabel">
                <BentoTypography el="span" variant="caption">
                    {{ i18n.get(detail.label) }}
                </BentoTypography>
            </dt>
            <dd :class="[ACCOUNT_DETAILS_CLASS_NAMES.detailContent, { [ACCOUNT_DETAILS_CLASS_NAMES.detailContentPrimary]: detail.isPrimary }]">
                <div v-if="detail.textToCopy" :class="ACCOUNT_DETAILS_CLASS_NAMES.copyableContent">
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
