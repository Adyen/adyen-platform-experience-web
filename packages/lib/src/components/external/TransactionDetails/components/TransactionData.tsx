import { ITransaction } from '@src/types';
import StatsBar from '@src/components/internal/StatsBar';
import Status from '@src/components/internal/Status';
import useCoreContext from '@src/core/Context/useCoreContext';
import StructuredList from '@src/components/internal/StructuredList';

export const TransactionData = ({ transaction }: { transaction: ITransaction }) => {
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
    return (
        <>
            <div className="adyen-fp-details-container">
                <StatsBar
                    items={[
                        {
                            label: i18n.get('originalAmount'),
                            value: i18n.amount(transaction.amount.value, transaction.amount.currency, { currencyDisplay: 'code' }),
                        },
                        ...(transaction.instructedAmount
                            ? [
                                  {
                                      label: i18n.get('instructedAmount'),
                                      value: i18n.amount(transaction.instructedAmount.value, transaction.instructedAmount.currency, {
                                          currencyDisplay: 'code',
                                      }),
                                  },
                              ]
                            : []),
                        {
                            label: i18n.get('date'),
                            value: i18n.fullDate(transaction.createdAt),
                        },
                        {
                            label: i18n.get('status'),
                            value: <Status type={'success'} label={transaction.status} />,
                        },
                    ]}
                />

                <div className="adyen-fp-details-section">
                    <div>
                        <div className="adyen-fp-subtitle">{i18n.get('processingInformation')}</div>

                        <StructuredList
                            layout={'3-9'}
                            items={{
                                paymentId: transaction.id,
                                transferID: transaction.transferId,
                                type: transaction.type && i18n.get(`txType.${transaction.type!}`),
                                balanceAccount: transaction.balanceAccountId,
                                reference: transaction.reference,
                                category: transaction.category && getLabel(transaction.category),
                                referenceForBeneficiary: transaction.referenceForBeneficiary,
                            }}
                            grid={false}
                        />
                    </div>
                </div>
            </div>

            <pre>
                <code>{JSON.stringify(transaction, null, 2)}</code>
            </pre>
        </>
    );
};
