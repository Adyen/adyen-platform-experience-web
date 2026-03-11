import { FunctionalComponent } from 'preact';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';

interface CashoutAmountDisplayProps {
    amount?: { value: number; currency: string };
    formatAmount: (amount: { value: number; currency: string }) => string;
    className: string;
}

export const CashoutAmountDisplay: FunctionalComponent<CashoutAmountDisplayProps> = ({ amount, formatAmount, className }) => {
    if (!amount) {
        return <div className="adyen-pe-cashout-overview__amount-skeleton" />;
    }

    return (
        <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.SUBTITLE} className={className} stronger>
            {formatAmount(amount)}
        </Typography>
    );
};
