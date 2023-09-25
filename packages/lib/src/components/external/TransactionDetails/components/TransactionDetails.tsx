import useCoreContext from '@src/core/Context/useCoreContext';
import StatsBar from '@src/components/internal/StatsBar';
import Status from '@src/components/internal/Status';
import './TransactionDetails.scss';
import { TransactionDetailsComponentProps } from '../types';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { ITransaction } from '@src/types';
import Alert from '@src/components/internal/Alert';
import Spinner from '@src/components/internal/Spinner';

function TransactionsDetails({ transaction, transactionId }: TransactionDetailsComponentProps) {
    const { i18n } = useCoreContext();
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

    const { data, error, isFetching } = useFetch<ITransaction>(
        { url: `transactions/${transactionId}` },
        { enabled: !!transactionId && !transaction }
    );

    const transactionData = transaction ?? data;
    return (
        <div className="adyen-fp-transaction">
            <div className="adyen-fp-title">{i18n.get('transactionDetails')}</div>

            {isFetching && <Spinner />}

            {error && <Alert icon={'cross'}>{error.message ?? i18n.get('unableToLoadTransaction')}</Alert>}

            {transactionData && (
                <>
                    <div className="adyen-fp-details-container">
                        <StatsBar
                            items={[
                                {
                                    label: 'Original amount',
                                    value: i18n.amount(transactionData.amount.value, transactionData.amount.currency, { currencyDisplay: 'code' }),
                                },
                                ...(transactionData.instructedAmount
                                    ? [
                                          {
                                              label: 'Instructed amount',
                                              value: i18n.amount(transactionData.instructedAmount.value, transactionData.instructedAmount.currency, {
                                                  currencyDisplay: 'code',
                                              }),
                                          },
                                      ]
                                    : []),
                                {
                                    label: 'Date',
                                    value: i18n.fullDate(transactionData.createdAt),
                                },
                                {
                                    label: 'Status',
                                    value: <Status type={'success'} label={transactionData.status} />,
                                },
                            ]}
                        />
                        <div className="adyen-fp-details-section">
                            <div>
                                <div className="adyen-fp-subtitle">{i18n.get('processingInformation')}</div>

                                <div className="adyen-fp-field">
                                    <div className="adyen-fp-label">{i18n.get('paymentId')}</div>
                                    <div className="adyen-fp-value">{transactionData.id}</div>
                                </div>

                                <div className="adyen-fp-field">
                                    <div className="adyen-fp-label">{i18n.get('transferID')}</div>
                                    <div className="adyen-fp-value">{transactionData.transferId}</div>
                                </div>

                                <div className="adyen-fp-field">
                                    <div className="adyen-fp-label">{i18n.get('type')}</div>
                                    <div className="adyen-fp-value">{i18n.get(`txType.${transactionData.type}`)}</div>
                                </div>

                                <div className="adyen-fp-field">
                                    <div className="adyen-fp-label">{i18n.get('balanceAccount')}</div>
                                    <div className="adyen-fp-value">{transactionData.balanceAccountId}</div>
                                </div>

                                <div className="adyen-fp-field">
                                    <div className="adyen-fp-label">{i18n.get('reference')}</div>
                                    <div className="adyen-fp-value">{transactionData.reference}</div>
                                </div>

                                <div className="adyen-fp-field">
                                    <div className="adyen-fp-label">{i18n.get('category')}</div>
                                    <div className="adyen-fp-value">{getLabel(transactionData.category)}</div>
                                </div>

                                {!!transactionData.referenceForBeneficiary && (
                                    <div className="adyen-fp-field">
                                        <div className="adyen-fp-label">{i18n.get('referenceForBeneficiary')}</div>
                                        <div className="adyen-fp-value">{transactionData.referenceForBeneficiary}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <pre>
                        <code>{JSON.stringify(transactionData, null, 2)}</code>
                    </pre>
                </>
            )}
        </div>
    );
}

export default TransactionsDetails;
