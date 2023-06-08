import useCoreContext from '@src/core/Context/useCoreContext';
import './BalanceAccountDetails.scss';
import StatsBar from '@src/components/internal/StatsBar';
import Status from '@src/components/internal/Status';
import Balances from './Balances';
import { BalanceAccountDetailsProps } from '../types';

function BalanceAccountDetails(props: BalanceAccountDetailsProps) {
    const { i18n } = useCoreContext();
    const { balanceAccount } = props;

    return (
        <div className="adyen-fp-balance-account">
            <div className="adyen-fp-title">Balance account</div>

            <div className="adyen-fp-details-container">
                <StatsBar
                    featured={true}
                    items={[
                        {
                            label: i18n.get('balanceAccountId'),
                            value: balanceAccount.id,
                        },
                        {
                            label: i18n.get('defaultCurrency'),
                            value: balanceAccount.defaultCurrencyCode,
                        },
                        {
                            label: i18n.get('created'),
                            value: 'N/A',
                        },
                        {
                            label: i18n.get('status'),
                            value: <Status type={'success'} label={balanceAccount.status} />,
                        },
                    ]}
                />
                <div className="adyen-fp-details-section">
                    {!!balanceAccount.balances.length && (
                        <Balances balances={balanceAccount.balances} defaultCurrency={balanceAccount.defaultCurrencyCode} />
                    )}

                    <div className="adyen-fp-balance-account__account">
                        <div className="adyen-fp-subtitle">Account configuration</div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">Account holder ID</div>
                            <div className="adyen-fp-value">{balanceAccount.accountHolderId}</div>
                        </div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">Timezone</div>
                            <div className="adyen-fp-value">{balanceAccount.timeZone}</div>
                        </div>

                        {!!balanceAccount.platformPaymentConfiguration && (
                            <>
                                <div className="adyen-fp-field">
                                    <div className="adyen-fp-label">Sales day closing time</div>
                                    <div className="adyen-fp-value">{balanceAccount.platformPaymentConfiguration.salesDayClosingTime}</div>
                                </div>

                                <div className="adyen-fp-field">
                                    <div className="adyen-fp-label">Settlement delay days</div>
                                    <div className="adyen-fp-value">{balanceAccount.platformPaymentConfiguration.settlementDelayDays}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <pre>
                <code>{JSON.stringify(balanceAccount, null, 2)}</code>
            </pre>
        </div>
    );
}

export default BalanceAccountDetails;
