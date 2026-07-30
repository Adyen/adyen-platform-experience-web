import { useCoreContext } from '@integration-components/core/preact';
import { useMemo } from 'preact/hooks';
import { CapitalHighlightedFields } from './CapitalHighlightedFields/CapitalHighlightedFields';
import { IAmount } from '@integration-components/types';

type RenewalHighlightedFieldsProps = {
    remainingGrantAmount: IAmount;
    newGrantAmount: IAmount;
};

export const RenewalHighlightedFields = ({ remainingGrantAmount, newGrantAmount }: RenewalHighlightedFieldsProps) => {
    const { i18n } = useCoreContext();

    const highlightedFields = useMemo(() => {
        const currency = newGrantAmount.currency;
        const newGrantValue = newGrantAmount.value;
        const remainingGrantValue = remainingGrantAmount.value;

        if (!currency || !newGrantValue || !remainingGrantValue) return [];

        const amountToReceive = newGrantValue - remainingGrantValue;
        const amountConfig = { minimumFractionDigits: 0 };

        return [
            {
                label: i18n.get('capital.offer.selection.earlyRenewal.newGrantAmount'),
                value: i18n.amount(newGrantValue, currency, amountConfig),
            },
            {
                value: '-',
            },
            {
                label: i18n.get('capital.offer.selection.earlyRenewal.currentGrantAmount'),
                value: i18n.amount(remainingGrantValue, currency, amountConfig),
            },
            {
                value: '=',
            },
            {
                label: i18n.get('capital.offer.selection.earlyRenewal.amountToReceive'),
                value: i18n.amount(amountToReceive, currency, amountConfig),
            },
        ];
    }, [i18n, newGrantAmount.currency, newGrantAmount.value, remainingGrantAmount.value]);

    return <CapitalHighlightedFields fields={highlightedFields} />;
};
