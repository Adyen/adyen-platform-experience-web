import { FunctionalComponent } from 'preact';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import { CashoutAmountDisplay } from './CashoutAmountDisplay';
import { CASHOUT_OVERVIEW_CLASS_NAMES } from '../constants';

interface CashoutBalanceCardsProps {
    balanceAmount?: { value: number; currency: string };
    pendingAmount?: { value: number; currency: string };
    formatAmount: (amount: { value: number; currency: string }) => string;
}

export const CashoutBalanceCards: FunctionalComponent<CashoutBalanceCardsProps> = ({ balanceAmount, pendingAmount, formatAmount }) => {
    const { i18n } = useCoreContext();

    return (
        <div className={CASHOUT_OVERVIEW_CLASS_NAMES.cards}>
            <div className={CASHOUT_OVERVIEW_CLASS_NAMES.card}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} className={CASHOUT_OVERVIEW_CLASS_NAMES.cardLabel}>
                    {i18n.get('cashout.overview.balance')}
                </Typography>
                <CashoutAmountDisplay amount={balanceAmount} formatAmount={formatAmount} className={CASHOUT_OVERVIEW_CLASS_NAMES.cardValue} />
            </div>
            <div className={CASHOUT_OVERVIEW_CLASS_NAMES.card}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} className={CASHOUT_OVERVIEW_CLASS_NAMES.cardLabel}>
                    {i18n.get('cashout.overview.pending')}
                </Typography>
                <CashoutAmountDisplay amount={pendingAmount} formatAmount={formatAmount} className={CASHOUT_OVERVIEW_CLASS_NAMES.cardValue} />
            </div>
        </div>
    );
};
