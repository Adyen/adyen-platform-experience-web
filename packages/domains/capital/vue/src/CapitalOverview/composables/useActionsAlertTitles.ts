import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useTimezoneAwareDateFormatting } from '@integration-components/composables-vue';
import type { IContractType } from '@integration-components/types';
import { DATE_FORMAT_MISSING_ACTION } from '@integration-components/utils';
import { useCapitalCopy } from '../../shared/composables/useCapitalCopy';

export const useActionsAlertTitles = (
    expirationDate: MaybeRefOrGetter<string | undefined>,
    contractType: MaybeRefOrGetter<IContractType | undefined>
) => {
    const { getContractCopy } = useCapitalCopy();
    const { dateFormat } = useTimezoneAwareDateFormatting();

    return computed(() => {
        const date = toValue(expirationDate);
        const contract = toValue(contractType);
        const formattedExpirationDate = date ? dateFormat(date, DATE_FORMAT_MISSING_ACTION) : undefined;

        return {
            multiple: formattedExpirationDate
                ? getContractCopy('capital.overview.grantItem.alerts.actionsNeededWithDeadline', contract, {
                      values: { date: formattedExpirationDate },
                  })
                : getContractCopy('capital.overview.grantItem.alerts.actionsNeeded', contract),
            single: formattedExpirationDate
                ? getContractCopy('capital.overview.grantItem.alerts.singleActionNeededWithDeadline', contract, {
                      values: { date: formattedExpirationDate },
                  })
                : getContractCopy('capital.overview.grantItem.alerts.singleActionNeeded', contract),
        };
    });
};
