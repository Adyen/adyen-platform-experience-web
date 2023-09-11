import useCoreContext from '@src/core/Context/useCoreContext';
import StatsBar from '@src/components/internal/StatsBar';
import Status from '@src/components/internal/Status';
import './TransactionDetails.scss';
import { TransactionDetailsComponentProps } from '../types';

function TransactionsDetails(props: TransactionDetailsComponentProps) {
    const { i18n } = useCoreContext();
    const { transaction } = props;
    const labels = {
        internal: 'category.internal',
    } as const;

    const isKeyOfLabel = (key: any): key is keyof typeof labels => {
        return Boolean(labels[key as keyof typeof labels]);
    };
    const getLabel = (key: string) => {
        if (isKeyOfLabel(key)) {
            return i18n.get(labels[key]);
        }
        return key;
    };

    return (
        <div className="adyen-fp-transaction">
            <div className="adyen-fp-title">{i18n.get('transactionDetails')}</div>

            <div className="adyen-fp-details-container">
                <StatsBar
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
                        },
                    ]}
                />
                <div className="adyen-fp-details-section">
                    <div>
                        <div className="adyen-fp-subtitle">{i18n.get('processingInformation')}</div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">{i18n.get('paymentId')}</div>
                            <div className="adyen-fp-value">{transaction.id}</div>
                        </div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">{i18n.get('transferID')}</div>
                            <div className="adyen-fp-value">{transaction.transferId}</div>
                        </div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">{i18n.get('type')}</div>
                            <div className="adyen-fp-value">{i18n.get(`txType.${transaction.type}`)}</div>
                        </div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">{i18n.get('balanceAccount')}</div>
                            <div className="adyen-fp-value">{transaction.balanceAccountId}</div>
                        </div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">{i18n.get('reference')}</div>
                            <div className="adyen-fp-value">{transaction.reference}</div>
                        </div>

                        <div className="adyen-fp-field">
                            <div className="adyen-fp-label">{i18n.get('category')}</div>
                            <div className="adyen-fp-value">{getLabel(transaction.category)}</div>
                        </div>

                        {!!transaction.referenceForBeneficiary && (
                            <div className="adyen-fp-field">
                                <div className="adyen-fp-label">{i18n.get('referenceForBeneficiary')}</div>
                                <div className="adyen-fp-value">{transaction.referenceForBeneficiary}</div>
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
