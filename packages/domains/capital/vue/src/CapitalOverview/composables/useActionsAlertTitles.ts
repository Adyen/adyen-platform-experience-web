import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { ContractTypeKeyMap } from '@integration-components/capital/domain';
import { useTimezoneAwareDateFormatting } from '@integration-components/composables-vue';
import type { IContractType } from '@integration-components/types';
import { DATE_FORMAT_MISSING_ACTION } from '@integration-components/utils';
import { useContractCopy } from '../../shared/composables/useContractCopy';

const CONTRACT_KEYS = {
    multiple: {
        CashAdvance: 'capital.overview.grantAlerts.cashAdvance.actionsNeeded',
        Loan: 'capital.overview.grantAlerts.loan.actionsNeeded',
    },
    multipleWithDeadline: {
        CashAdvance: 'capital.overview.grantAlerts.cashAdvance.actionsNeededWithDeadline',
        Loan: 'capital.overview.grantAlerts.loan.actionsNeededWithDeadline',
    },
    single: {
        CashAdvance: 'capital.overview.grantAlerts.cashAdvance.singleActionNeeded',
        Loan: 'capital.overview.grantAlerts.loan.singleActionNeeded',
    },
    singleWithDeadline: {
        CashAdvance: 'capital.overview.grantAlerts.cashAdvance.singleActionNeededWithDeadline',
        Loan: 'capital.overview.grantAlerts.loan.singleActionNeededWithDeadline',
    },
} satisfies ContractTypeKeyMap;

export const useActionsAlertTitles = (expirationDate: MaybeRefOrGetter<string | undefined>, contractType: MaybeRefOrGetter<IContractType>) => {
    const { getContractCopy } = useContractCopy(contractType);
    const { dateFormat } = useTimezoneAwareDateFormatting();

    return computed(() => {
        const date = toValue(expirationDate);
        const formattedExpirationDate = date ? dateFormat(date, DATE_FORMAT_MISSING_ACTION) : undefined;

        return {
            multiple: formattedExpirationDate
                ? getContractCopy(CONTRACT_KEYS.multipleWithDeadline, { values: { date: formattedExpirationDate } })
                : getContractCopy(CONTRACT_KEYS.multiple),
            single: formattedExpirationDate
                ? getContractCopy(CONTRACT_KEYS.singleWithDeadline, { values: { date: formattedExpirationDate } })
                : getContractCopy(CONTRACT_KEYS.single),
        };
    });
};
