import { FunctionalComponent } from 'preact';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { ExternalUIComponentProps } from '../../../../types';
import { CashoutProps } from '../../types';
import './CashoutOverview.scss';
import { CASHOUT_OVERVIEW_CLASS_NAMES } from './constants';
import { useCashoutData } from './useCashoutData';
import { CashoutAccountSelector } from './components/CashoutAccountSelector';
import { CashoutBalanceCards } from './components/CashoutBalanceCards';
import { CashoutRow } from './components/CashoutRow';
import { CashoutButton } from './components/CashoutButton';
import classNames from 'classnames';

export const CashoutOverview: FunctionalComponent<ExternalUIComponentProps<CashoutProps>> = ({ accountKey, variant = 'full' }) => {
    const { i18n } = useCoreContext();
    const { configuration, formatAmount, activeBalanceAccount, balanceAccountSelectionOptions, onBalanceAccountSelection } =
        useCashoutData(accountKey);

    if (variant === 'button') {
        return (
            <div className={classNames(CASHOUT_OVERVIEW_CLASS_NAMES.base, `${CASHOUT_OVERVIEW_CLASS_NAMES.base}--button`)}>
                <CashoutButton disabled={!configuration?.isCashoutAvailable} />
            </div>
        );
    }

    if (variant === 'summary') {
        return (
            <div className={classNames(CASHOUT_OVERVIEW_CLASS_NAMES.base, `${CASHOUT_OVERVIEW_CLASS_NAMES.base}--summary`)}>
                <CashoutAccountSelector
                    activeBalanceAccount={activeBalanceAccount}
                    balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                    onBalanceAccountSelection={onBalanceAccountSelection}
                />
                <CashoutRow
                    availableForCashoutAmount={configuration?.availableForCashoutAmount}
                    isCashoutAvailable={configuration?.isCashoutAvailable}
                    formatAmount={formatAmount}
                />
            </div>
        );
    }

    return (
        <div className={CASHOUT_OVERVIEW_CLASS_NAMES.base}>
            <div className={CASHOUT_OVERVIEW_CLASS_NAMES.header}>
                <div>
                    <Typography el={TypographyElement.H2} variant={TypographyVariant.TITLE} className={CASHOUT_OVERVIEW_CLASS_NAMES.headerTitle}>
                        {i18n.get('cashout.overview.accountBalance')}
                    </Typography>
                    <Typography
                        el={TypographyElement.PARAGRAPH}
                        variant={TypographyVariant.CAPTION}
                        className={CASHOUT_OVERVIEW_CLASS_NAMES.headerSubtitle}
                    >
                        {i18n.get('cashout.overview.lastUpdated')}
                    </Typography>
                </div>
                <CashoutAccountSelector
                    activeBalanceAccount={activeBalanceAccount}
                    balanceAccountSelectionOptions={balanceAccountSelectionOptions}
                    onBalanceAccountSelection={onBalanceAccountSelection}
                />
            </div>

            <CashoutBalanceCards
                balanceAmount={configuration?.balanceAmount}
                pendingAmount={configuration?.pendingAmount}
                formatAmount={formatAmount}
            />

            <CashoutRow
                availableForCashoutAmount={configuration?.availableForCashoutAmount}
                isCashoutAvailable={configuration?.isCashoutAvailable}
                formatAmount={formatAmount}
            />
        </div>
    );
};
