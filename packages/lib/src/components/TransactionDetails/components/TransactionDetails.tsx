import useCoreContext from 'src/core/Context/useCoreContext';
import StatsBar from 'src/components/internal/StatsBar';
import Status from 'src/components/internal/Status';
import './TransactionDetails.scss';

function TransactionsDetails(props) {
    const { i18n } = useCoreContext();
    const { transaction } = props;

    const getLabel = key => {
        const labels = {
            internal: 'category.internal',
        };

        return labels[key] || key;
    };

    return (
        <div class="adyen-fp-transaction">
            <div class="adyen-fp-title">Transaction details</div>

            <div className="adyen-fp-details-container">
                <StatsBar
                    featured={true}
                    items={[
                        {
                            label: 'Original amount',
                            value: i18n.amount(transaction.amount.value, transaction.amount.currency, { currencyDisplay: 'code' }),
                        },
                        ...(transaction.instructedAmount
                            ? [
                                  {
                                      label: 'Instructed amount',
                                      value: i18n.amount(transaction.instructedAmount.value, transaction.instructedAmount.currency, {
                                          currencyDisplay: 'code',
                                      }),
                                  },
                              ]
                            : []),
                        {
                            label: 'Date',
                            value: i18n.fullDate(transaction.createdAt),
                        },
                        {
                            label: 'Status',
                            value: <Status type={'success'} label={transaction.status} />,
                            highlight: true,
                        },
                    ]}
                />
                <div class="adyen-fp-details-section">
                    <div>
                        <div class="adyen-fp-subtitle">Processing information</div>

                        <div class="adyen-fp-field">
                            <div class="adyen-fp-label">{i18n.get('paymentId')}</div>
                            <div class="adyen-fp-value">{transaction.id}</div>
                        </div>

                        <div class="adyen-fp-field">
                            <div class="adyen-fp-label">Transfer ID</div>
                            <div class="adyen-fp-value">{transaction.transferId}</div>
                        </div>

                        <div class="adyen-fp-field">
                            <div class="adyen-fp-label">Type</div>
                            <div class="adyen-fp-value">{i18n.get(`txType.${transaction.type}`)}</div>
                        </div>

                        <div class="adyen-fp-field">
                            <div class="adyen-fp-label">{i18n.get('balanceAccount')}</div>
                            <div class="adyen-fp-value">{transaction.balanceAccountId}</div>
                        </div>

                        <div class="adyen-fp-field">
                            <div class="adyen-fp-label">{i18n.get('Reference')}</div>
                            <div class="adyen-fp-value">{i18n.get(transaction.reference)}</div>
                        </div>

                        <div class="adyen-fp-field">
                            <div class="adyen-fp-label">{i18n.get('Category')}</div>
                            <div class="adyen-fp-value">{i18n.get(`category.${transaction.category}`)}</div>
                        </div>

                        {!!transaction.referenceForBeneficiary && (
                            <div class="adyen-fp-field">
                                <div class="adyen-fp-label">{i18n.get('referenceForBeneficiary')}</div>
                                <div class="adyen-fp-value">{transaction.referenceForBeneficiary}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <pre>
                <code>{JSON.stringify(transaction, null, 2)}</code>
            </pre>
        </div>
    );
}

export default TransactionsDetails;
