import { Fragment, h } from 'preact';
import useCoreContext from 'src/core/Context/useCoreContext';
import './BalanceAccountDetails.scss';
import StatsBar from 'src/components/internal/StatsBar';
import Status from 'src/components/internal/Status';
import Balances from './Balances';

function BalanceAccountDetails(props) {
    const { i18n } = useCoreContext();
    const { balanceAccount } = props;

    return (
        <div class="adyen-fp-balance-account">
            <div class="adyen-fp-title">Balance account</div>

            <div className="adyen-fp-details-container">
                <StatsBar
                    featured={true}
                    items={[
                        {
                            label: 'Balance account ID',
                            value: balanceAccount.id,
                        },
                        {
                            label: 'Default currency',
                            value: balanceAccount.defaultCurrencyCode,
                        },
                        {
                            label: 'Created',
                            value: 'N/A',
                        },
                        {
                            label: 'Status',
                            value: <Status type={'success'} label={balanceAccount.status} />,
                        },
                    ]}
                />
                <div className="adyen-fp-details-section">
                    {!!balanceAccount.balances.length && (
                        <Balances balances={balanceAccount.balances} defaultCurrency={balanceAccount.defaultCurrencyCode} />
                    )}

                    <div class="adyen-fp-balance-account__account">
                        <div class="adyen-fp-subtitle">Account configuration</div>

                        <div class="adyen-fp-field">
                            <div class="adyen-fp-label">Account holder ID</div>
                            <div class="adyen-fp-value">{balanceAccount.accountHolderId}</div>
                        </div>

                        <div class="adyen-fp-field">
                            <div class="adyen-fp-label">Timezone</div>
                            <div class="adyen-fp-value">{balanceAccount.timeZone}</div>
                        </div>

                        {!!balanceAccount.platformPaymentConfiguration && (
                            <Fragment>
                                <div class="adyen-fp-field">
                                    <div class="adyen-fp-label">Sales day closing time</div>
                                    <div class="adyen-fp-value">{balanceAccount.platformPaymentConfiguration.salesDayClosingTime}</div>
                                </div>

                                <div class="adyen-fp-field">
                                    <div class="adyen-fp-label">Settlement delay days</div>
                                    <div class="adyen-fp-value">{balanceAccount.platformPaymentConfiguration.settlementDelayDays}</div>
                                </div>
                            </Fragment>
                        )}

                        {!!balanceAccount.referenceForBeneficiary && (
                            <div class="adyen-fp-field">
                                <div class="adyen-fp-label">{i18n.get('referenceForBeneficiary')}</div>
                                <div class="adyen-fp-value">{balanceAccount.referenceForBeneficiary}</div>
                            </div>
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
