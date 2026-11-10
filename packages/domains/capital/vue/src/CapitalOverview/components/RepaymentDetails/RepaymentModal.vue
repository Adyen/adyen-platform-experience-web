<script setup lang="ts">
import { computed } from 'vue';
import { BentoCard, BentoDivider, BentoModal, BentoTypography } from '@adyen/bento-vue3';
import { getBankAccount, getTransferInstrumentIds } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IGrant } from '@integration-components/types';
import { useCapitalCopy } from '../../../shared/composables/useCapitalCopy';
import AccountDetails from '../AccountDetails/AccountDetails.vue';
import styles from './RepaymentModal.module.scss';

const props = defineProps<{
    grant: IGrant;
    isOpen: boolean;
    onClose: () => void;
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useCapitalCopy();
const bankAccount = computed(() => getBankAccount(props.grant));
const transferInstrumentItems = computed(() => getTransferInstrumentIds(props.grant));

const instructionItems = computed(() => [
    bankAccount.value
        ? i18n.get('capital.overview.repayment.steps.addBeneficiary', {
              values: { beneficiaryName: bankAccount.value.beneficiaryName },
          })
        : undefined,
    getContractCopy('capital.overview.repayment.steps.transfer', props.grant.contractType, {
        values: { amount: i18n.amount(props.grant.remainingTotalAmount.value, props.grant.remainingTotalAmount.currency) },
    }),
    i18n.get('capital.overview.repayment.steps.wait'),
]);
</script>

<template>
    <BentoModal :is-open="props.isOpen" size="medium" @close-modal="props.onClose">
        {{ i18n.get('capital.overview.repayment.title') }}
        <template #content>
            <div v-if="bankAccount" :class="styles.root">
                <BentoTypography>
                    {{ getContractCopy('capital.overview.repayment.subtitle', props.grant.contractType) }}
                </BentoTypography>
                <BentoCard>
                    {{ i18n.get('capital.overview.repayment.accountTitle') }}
                    <template #description>
                        <AccountDetails :bank-account="bankAccount" />
                    </template>
                </BentoCard>
                <div :class="styles.notice">
                    <template v-if="transferInstrumentItems.length">
                        <div>
                            <BentoTypography el="span" variant="caption" stronger>
                                {{ i18n.get('capital.overview.repayment.transferInstrumentsTitle') }}
                            </BentoTypography>
                            <ul :class="styles.transferInstrumentList">
                                <li
                                    v-for="transferInstrumentId in transferInstrumentItems"
                                    :key="transferInstrumentId"
                                    :class="styles.transferInstrumentListItem"
                                >
                                    <BentoTypography el="span" variant="caption">
                                        {{ transferInstrumentId }}
                                    </BentoTypography>
                                </li>
                            </ul>
                        </div>
                        <BentoDivider />
                    </template>
                    <div>
                        <BentoTypography el="span" variant="caption" stronger>
                            {{ getContractCopy('capital.overview.repayment.stepsTitle', props.grant.contractType) }}
                        </BentoTypography>
                        <ul :class="styles.list">
                            <li v-for="item in instructionItems" :key="item" :class="styles.instructionListItem">
                                <BentoTypography el="span" variant="caption">
                                    {{ item }}
                                </BentoTypography>
                            </li>
                        </ul>
                    </div>
                    <BentoTypography el="span" variant="caption" :class="styles.verifiedBankAccountNotice">
                        {{ i18n.get('capital.overview.repayment.verifiedAccountNote') }}
                    </BentoTypography>
                </div>
            </div>
        </template>
    </BentoModal>
</template>
