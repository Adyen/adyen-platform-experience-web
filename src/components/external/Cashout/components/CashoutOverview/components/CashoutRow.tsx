import { FunctionalComponent } from 'preact';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import { CashoutAmountDisplay } from './CashoutAmountDisplay';
import { CashoutButton } from './CashoutButton';
import { CASHOUT_OVERVIEW_CLASS_NAMES } from '../constants';
import { Tooltip } from '../../../../../internal/Tooltip/Tooltip';

interface CashoutRowProps {
    availableForCashoutAmount?: { value: number; currency: string };
    isCashoutAvailable?: boolean;
    formatAmount: (amount: { value: number; currency: string }) => string;
    onCashoutClick?: () => void;
}

export const CashoutRow: FunctionalComponent<CashoutRowProps> = ({ availableForCashoutAmount, isCashoutAvailable, formatAmount, onCashoutClick }) => {
    const { i18n } = useCoreContext();

    return (
        <div className={CASHOUT_OVERVIEW_CLASS_NAMES.cashoutRow}>
            <div className={CASHOUT_OVERVIEW_CLASS_NAMES.cashoutInfo}>
                <Tooltip isUnderlineVisible content="{{Explanation on calculation}}">
                    <span>
                        <Typography
                            el={TypographyElement.SPAN}
                            variant={TypographyVariant.BODY}
                            className={CASHOUT_OVERVIEW_CLASS_NAMES.cashoutLabel}
                        >
                            {i18n.get('cashout.overview.availableForCashout')}
                        </Typography>
                    </span>
                </Tooltip>
                <CashoutAmountDisplay
                    amount={availableForCashoutAmount}
                    formatAmount={formatAmount}
                    className={CASHOUT_OVERVIEW_CLASS_NAMES.cashoutValue}
                />
            </div>
            <CashoutButton disabled={!isCashoutAvailable} onClick={onCashoutClick} />
        </div>
    );
};
