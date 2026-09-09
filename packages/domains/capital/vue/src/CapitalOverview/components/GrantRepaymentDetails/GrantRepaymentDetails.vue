<script setup lang="ts">
import { computed } from 'vue';
import { BentoDivider, BentoTypography } from '@adyen/bento-vue3';
import { getBankAccount, getTransferInstrumentIds } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IGrant } from '@integration-components/types';
import AccountDetails from '../AccountDetails/AccountDetails.vue';
import GrantAdjustmentDetails from '../GrantAdjustmentDetails/GrantAdjustmentDetails.vue';
import styles from './GrantRepaymentDetails.module.scss';

const props = defineProps<{
    grant: IGrant;
    onDetailsClose: () => void;
}>();

const { i18n } = useCoreContext();
const bankAccount = computed(() => getBankAccount(props.grant));
const transferInstrumentIds = computed(() => getTransferInstrumentIds(props.grant));
const addingBeneficiaryInstruction = computed(() =>
    bankAccount.value
        ? i18n.get('capital.overview.repayment.instructions.addingBeneficiary', {
              values: { beneficiaryName: bankAccount.value.beneficiaryName },
          })
        : undefined
);
</script>

<template>
    <GrantAdjustmentDetails
        v-if="bankAccount"
        :class="styles.root"
        header-title-key="capital.overview.repayment.title"
        header-subtitle-key="capital.overview.repayment.subtitle"
        :on-details-close="props.onDetailsClose"
    >
        <div :class="styles.repaymentAccount">
            <BentoTypography variant="body" stronger>
                {{ i18n.get('capital.overview.repayment.accountDetails.title') }}
            </BentoTypography>
            <AccountDetails :bank-account="bankAccount" />
        </div>

        <div :class="styles.notice">
            <template v-if="transferInstrumentIds.length">
                <div>
                    <BentoTypography el="span" variant="caption" stronger>
                        {{ i18n.get('capital.overview.repayment.transferInstruments') }}
                    </BentoTypography>

                    <ul :class="styles.transferInstrumentList">
                        <li v-for="transferInstrumentId in transferInstrumentIds" :key="transferInstrumentId" :class="styles.transferInstrumentItem">
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
                    {{ i18n.get('capital.overview.repayment.instructions.title') }}
                </BentoTypography>
                <ol :class="styles.instructionList">
                    <li>
                        <BentoTypography el="span" variant="caption">
                            {{ addingBeneficiaryInstruction }}
                        </BentoTypography>
                    </li>
                    <li>
                        <BentoTypography el="span" variant="caption">
                            {{ i18n.get('capital.overview.repayment.instructions.sendingPayment') }}
                        </BentoTypography>
                    </li>
                    <li>
                        <BentoTypography el="span" variant="caption">
                            {{ i18n.get('capital.overview.repayment.instructions.waiting') }}
                        </BentoTypography>
                    </li>
                </ol>
            </div>

            <BentoTypography el="span" variant="caption" :class="styles.verifiedBankAccountDetails">
                {{ i18n.get('capital.overview.repayment.instructions.verifiedAccount') }}
            </BentoTypography>
        </div>
    </GrantAdjustmentDetails>
</template>
