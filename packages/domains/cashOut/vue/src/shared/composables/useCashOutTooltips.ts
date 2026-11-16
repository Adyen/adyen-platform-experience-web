import { useCoreContext } from '@integration-components/core/vue';
import { formatBasisPoints, getAvailableForCashOutTooltip, getFeeTooltip } from '@integration-components/cashOut/domain';
import type { ICashOutAmount, ICashOutEligibility } from '@integration-components/types';
import { useFormatAmount } from './useFormatAmount';

/** The tooltips of what is available to cash out and of the fee, with the daily limit and the fee structure of the balance account. */
export const useCashOutTooltips = () => {
    const { i18n } = useCoreContext();
    const formatAmount = useFormatAmount();

    const availableForCashOutTooltip = (dailyLimit: ICashOutAmount | null | undefined) => {
        const tooltip = getAvailableForCashOutTooltip(dailyLimit);
        return 'dailyLimit' in tooltip ? i18n.get(tooltip.key, { values: { dailyLimit: formatAmount(tooltip.dailyLimit) } }) : i18n.get(tooltip.key);
    };

    const feeTooltip = (feeStructure: ICashOutEligibility['feeStructure']) => {
        const tooltip = getFeeTooltip(feeStructure);
        const values = {
            ...('fixedAmount' in tooltip && { fixedAmount: formatAmount(tooltip.fixedAmount) }),
            ...('basisPoints' in tooltip && { percentage: formatBasisPoints(tooltip.basisPoints, i18n.locale) }),
        };
        return Object.keys(values).length ? i18n.get(tooltip.key, { values }) : i18n.get(tooltip.key);
    };

    return { availableForCashOutTooltip, feeTooltip } as const;
};
