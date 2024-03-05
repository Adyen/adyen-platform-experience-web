import { TransactionDetailData } from '@src/components';
import TransactionDataSkeleton from '@src/components/external/TransactionDetails/components/TransactionDataSkeleton';
import { Image } from '@src/components/internal/Image/Image';
import { parsePaymentMethodType } from '@src/components/external/Transactions/components/utils';
import { Tag } from '@src/components/internal/Tag/Tag';
import { TagVariant } from '@src/components/internal/Tag/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';

export const TransactionData = ({ transaction, isFetching }: { transaction?: TransactionDetailData; isFetching?: boolean }) => {
    const { i18n } = useCoreContext();
    const creationDate = useMemo(
        () =>
            transaction
                ? i18n
                      .date(new Date(transaction.creationDate), {
                          weekday: 'long',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZoneName: 'shortOffset',
                      })
                      .toString()
                : '',
        [transaction, i18n]
    );

    return (
        <div className={'adyen-fp-transaction-data'}>
            <div className={'adyen-fp-transaction-data--container'}>
                {!transaction ? (
                    <TransactionDataSkeleton isLoading={isFetching} />
                ) : (
                    <div className={'adyen-fp-transaction-data-section adyen-fp-transaction-data--tag-container'}>
                        <Tag
                            label={i18n.get(transaction.status)}
                            variant={
                                transaction.status === 'Booked'
                                    ? TagVariant.SUCCESS
                                    : transaction.status === 'Rejected'
                                    ? TagVariant.ERROR
                                    : TagVariant.DEFAULT
                            }
                        />
                        <Tag label={i18n.get(`txType.${transaction.category}`)} variant={TagVariant.DEFAULT} />
                    </div>
                )}
                {!transaction ? (
                    <TransactionDataSkeleton isLoading={isFetching} />
                ) : (
                    <div className={'adyen-fp-transaction-data-section adyen-fp-transaction-data--amount'}>
                        {transaction?.amount
                            ? i18n.amount(transaction?.amount?.value, transaction?.amount?.currency, {
                                  currencyDisplay: 'symbol',
                              })
                            : null}
                    </div>
                )}
                {!transaction ? (
                    <TransactionDataSkeleton isLoading={isFetching} />
                ) : (
                    (transaction?.paymentMethod || transaction?.bankAccount) && (
                        <div className="adyen-fp-transaction-data-section adyen-fp-transaction-data__payment-method">
                            <div className="adyen-fp-transaction-data__payment-method-logo-container">
                                <Image
                                    name={transaction.paymentMethod ? transaction.paymentMethod.type : 'bankTransfer'}
                                    alt={transaction.paymentMethod ? transaction.paymentMethod.type : 'bankTransfer'}
                                    folder={'logos/'}
                                    className={'adyen-fp-transactions__payment-method-logo'}
                                />
                            </div>

                            {transaction?.paymentMethod
                                ? parsePaymentMethodType(transaction?.paymentMethod, 'detail')
                                : transaction?.bankAccount?.accountNumberLastFourDigits}
                        </div>
                    )
                )}
                {!transaction ? (
                    <span
                        className={
                            isFetching ? 'adyen-fp-transaction-data__skeleton-loading-content' : 'adyen-fp-transaction-data__skeleton-error-content'
                        }
                    />
                ) : (
                    <div className={'adyen-fp-transaction-data-section adyen-fp-transaction-data__label'}>{creationDate}</div>
                )}
            </div>
            {!transaction ? (
                <TransactionDataSkeleton isLoading={isFetching} />
            ) : (
                transaction?.balanceAccountDescription && (
                    <div className={'adyen-fp-transaction-data--container'}>
                        <div className={'adyen-fp-transaction-data__label'}>{i18n.get('account')}</div>
                        <div>{transaction.balanceAccountDescription}</div>
                    </div>
                )
            )}

            {!transaction ? (
                <TransactionDataSkeleton isLoading={isFetching} />
            ) : (
                <div className={'adyen-fp-transaction-data--container'}>
                    <div className={'adyen-fp-transaction-data__label'}>{i18n.get('referenceID')}</div>
                    <div>{transaction.id}</div>
                </div>
            )}
            {/*{transaction && <div className={'adyen-fp-transaction-data--container adyen-fp-transaction-data--action-buttons'}>*/}
            {/*    <Button aria-label={i18n.get('export')} variant={ButtonVariant.SECONDARY} onClick={() => {}}>*/}
            {/*        {i18n.get('export')}*/}
            {/*    </Button>*/}
            {/*</div>}*/}
        </div>
    );
};
