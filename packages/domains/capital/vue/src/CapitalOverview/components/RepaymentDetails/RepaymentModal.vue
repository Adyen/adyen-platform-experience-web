<script setup lang="ts">
import { computed } from 'vue';
import { BentoCard, BentoDivider, BentoModal, BentoTypography } from '@adyen/bento-vue3';
import { getBankAccount, getTransferInstrumentIds } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IGrant } from '@integration-components/types';
import { useContractCopy } from '../../../shared/composables/useContractCopy';
import AccountDetails from '../AccountDetails/AccountDetails.vue';
import { CONTRACT_KEYS } from './contractKeys';
import styles from './RepaymentModal.module.scss';

const props = defineProps<{
    grant: IGrant;
    isOpen: boolean;
    onClose: () => void;
}>();

const { i18n } = useCoreContext();
const { getContractCopy } = useContractCopy(() => props.grant.contractType);
const bankAccount = computed(() => getBankAccount(props.grant));
const transferInstrumentItems = computed(() => getTransferInstrumentIds(props.grant));

const instructionItems = computed(() => [
    bankAccount.value
        ? i18n.get('capital.overview.repayment.steps.addBeneficiary', {
              values: { beneficiaryName: bankAccount.value.beneficiaryName },
          })
        : undefined,
    i18n.get('capital.overview.repayment.steps.transfer', {
        values: { amount: i18n.amount(props.grant.remainingTotalAmount.value, props.grant.remainingTotalAmount.currency) },
    }),
    getContractCopy(CONTRACT_KEYS.waitStep),
]);
</script>

<template>
    <BentoModal :is-open="props.isOpen" size="medium" @close-modal="props.onClose">
        {{ i18n.get('capital.overview.repayment.title') }}
        <template #content>
            <div v-if="bankAccount" :class="styles.root">
                <BentoTypography variant="body">
                    {{ getContractCopy(CONTRACT_KEYS.repaymentIntro) }}
                </BentoTypography>
                <template v-if="transferInstrumentItems.length">
                    <div :class="styles.titledContainer">
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
                <div :class="styles.titledContainer">
                    <BentoTypography el="span" variant="caption" stronger>
                        {{ getContractCopy(CONTRACT_KEYS.stepsTitle) }}
                    </BentoTypography>
                    <ul :class="styles.instructionList">
                        <li v-for="item in instructionItems" :key="item" :class="styles.instructionListItem">
                            <BentoTypography el="span" variant="caption">
                                {{ item }}
                            </BentoTypography>
                        </li>
                    </ul>
                </div>
                <BentoCard>
                    {{ i18n.get('capital.overview.repayment.accountTitle') }}
                    <template #description>
                        <AccountDetails :bank-account="bankAccount" />
                    </template>
                </BentoCard>
            </div>
        </template>
    </BentoModal>
</template>
