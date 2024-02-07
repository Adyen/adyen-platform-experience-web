import { ITransaction } from '@src/types';
import StatsBar from '@src/components/internal/StatsBar';
import Status from '@src/components/internal/Status';
import useCoreContext from '@src/core/Context/useCoreContext';
import StructuredList from '@src/components/internal/StructuredList';

export const TransactionData = ({ transaction }: { transaction: ITransaction }) => {
    const { i18n } = useCoreContext();

    return (
        <>
            <div className="adyen-fp-details-container">
                <StatsBar
                    items={[
                        {
                            label: i18n.get('originalAmount'),
                            value: i18n.amount(transaction.amount.value, transaction.amount.currency, { currencyDisplay: 'code' }),
                        },
                        ...(transaction.amount
                            ? [
                                  {
                                      label: i18n.get('instructedAmount'),
                                      value: i18n.amount(transaction.amount.value, transaction.amount.currency, {
                                          currencyDisplay: 'code',
                                      }),
                                  },
                              ]
                            : []),
                        {
                            label: i18n.get('date'),
                            value: i18n.fullDate(transaction.creationDate),
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
                                category: transaction.category && i18n.get(`txType.${transaction.category!}`),
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
