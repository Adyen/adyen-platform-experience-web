import { useCoreContext } from '@integration-components/core/preact';
import { useMemo } from 'preact/hooks';
import { CapitalHighlightedFields } from './CapitalHighlightedFields/CapitalHighlightedFields';
import { IAmount } from '@integration-components/types';
import { getRenewalAmountBreakdown } from '@integration-components/capital/domain';

type RenewalHighlightedFieldsProps = {
    newGrantAmount: IAmount;
    remainingGrantAmount: IAmount;
};

export const RenewalHighlightedFields = ({ newGrantAmount, remainingGrantAmount }: RenewalHighlightedFieldsProps) => {
    const { i18n } = useCoreContext();

    const highlightedFields = useMemo(() => {
        const breakdown = getRenewalAmountBreakdown(newGrantAmount, remainingGrantAmount);
        const amountConfig = { minimumFractionDigits: 0 };

        return [
            {
                label: i18n.get('capital.offer.selection.earlyRenewal.newGrantAmount'),
                value: i18n.amount(breakdown.newGrantAmountValue, breakdown.currency, amountConfig),
            },
            {
                value: '-',
            },
            {
                label: i18n.get('capital.offer.selection.earlyRenewal.currentGrantAmount'),
                value: i18n.amount(breakdown.remainingGrantAmountValue, breakdown.currency, amountConfig),
            },
            {
                value: '=',
            },
            {
                label: i18n.get('capital.offer.selection.earlyRenewal.amountToReceive'),
                value: i18n.amount(breakdown.amountToReceive, breakdown.currency, amountConfig),
            },
        ];
    }, [i18n, newGrantAmount, remainingGrantAmount]);

    return <CapitalHighlightedFields fields={highlightedFields} />;
};
