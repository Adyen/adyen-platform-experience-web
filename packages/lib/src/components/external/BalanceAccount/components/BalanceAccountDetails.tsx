import useCoreContext from '@src/core/Context/useCoreContext';
import './BalanceAccountDetails.scss';
import StatsBar from '@src/components/internal/StatsBar';
import Status from '@src/components/internal/Status';
import Balances from './Balances';
import { BalanceAccountComponentProps } from '../types';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { BalanceAccount } from '@src/types';
import Spinner from '@src/components/internal/Spinner';
import Alert from '@src/components/internal/Alert';

function BalanceAccountDetails({ balanceAccount, balanceAccountId }: BalanceAccountComponentProps) {
    const { i18n } = useCoreContext();

    const { data, error, isFetching } = useFetch<BalanceAccount>(
        { url: `balanceAccounts/${balanceAccountId}` },
        { enabled: !!balanceAccountId && !balanceAccount }
    );

    const balanceAccountData = balanceAccount ?? data;

    return (
        <div className="adyen-fp-balance-account">
            <div className="adyen-fp-title">{i18n.get('balanceAccount')}</div>

            {isFetching && <Spinner />}

            {error && <Alert icon={'cross'}>{error.message ?? i18n.get('unableToLoadBalanceAccount')} </Alert>}

            {balanceAccountData && (
                <div className="adyen-fp-details-container">
                    <StatsBar
                        items={[
                            {
                                label: i18n.get('balanceAccountId'),
                                value: balanceAccountData.id,
                            },
                            {
                                label: i18n.get('defaultCurrency'),
                                value: balanceAccountData.defaultCurrencyCode,
                            },
                            {
                                label: i18n.get('created'),
                                value: 'N/A',
                            },
                            {
                                label: i18n.get('status'),
                                value: <Status type={'success'} label={balanceAccountData.status} />,
                            },
                        ]}
                    />
                    <div className="adyen-fp-details-section">
                        {!!balanceAccountData.balances.length && (
                            <Balances balances={balanceAccountData.balances} defaultCurrency={balanceAccountData.defaultCurrencyCode} />
                        )}

                        <div className="adyen-fp-balance-account__account">
                            <div className="adyen-fp-subtitle">{i18n.get('accountConfiguration')}</div>

                            <div className="adyen-fp-field">
                                <div className="adyen-fp-label">{i18n.get('accountHolderID')}</div>
                                <div className="adyen-fp-value">{balanceAccountData.accountHolderId}</div>
                            </div>

                            <div className="adyen-fp-field">
                                <div className="adyen-fp-label">{i18n.get('timezone')}</div>
                                <div className="adyen-fp-value">{balanceAccountData.timeZone}</div>
                            </div>

                            {!!balanceAccountData.platformPaymentConfiguration && (
                                <>
                                    <div className="adyen-fp-field">
                                        <div className="adyen-fp-label">{i18n.get('salesDayClosingTime')}</div>
                                        <div className="adyen-fp-value">{balanceAccountData.platformPaymentConfiguration.salesDayClosingTime}</div>
                                    </div>

                                    <div className="adyen-fp-field">
                                        <div className="adyen-fp-label">{i18n.get('settlementDelayDays')}</div>
                                        <div className="adyen-fp-value">{balanceAccountData.platformPaymentConfiguration.settlementDelayDays}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <pre>
                <code>{JSON.stringify(balanceAccountData, null, 2)}</code>
            </pre>
        </div>
    );
}

export default BalanceAccountDetails;
