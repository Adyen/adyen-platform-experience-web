import { TransactionDetailData } from '@src/components';
import TransactionDataSkeleton from '@src/components/external/TransactionDetails/components/TransactionDataSkeleton';
import { Image } from '@src/components/internal/Image/Image';
import { parsePaymentMethodType } from '@src/components/external/TransactionsOverview/components/utils';
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

    const amountStyle = transaction?.status === 'Booked' ? 'default' : transaction?.status === 'Reversed' ? 'error' : 'pending';

    return (
        <>
            {!transaction ? (
                <TransactionDataSkeleton isLoading={isFetching} skeletonRowNumber={6} />
            ) : (
                <div className={'adyen-pe-transaction-data'}>
                    <div className={'adyen-pe-transaction-data__container'}>
                        {(transaction?.status || transaction?.category) && (
                            <div className={'adyen-pe-transaction-data__section adyen-pe-transaction-data__tag-container'}>
                                {transaction?.status && (
                                    <Tag
                                        label={i18n.get(transaction.status)}
                                        variant={
                                            transaction.status === 'Booked'
                                                ? TagVariant.SUCCESS
                                                : transaction.status === 'Reversed'
                                                ? TagVariant.ERROR
                                                : TagVariant.DEFAULT
                                        }
                                    />
                                )}
                                {transaction.category && <Tag label={i18n.get(`txType.${transaction.category}`)} variant={TagVariant.DEFAULT} />}
                            </div>
                        )}
                        <div
                            className={`adyen-pe-transaction-data__section adyen-pe-transaction-data__amount adyen-pe-transaction-data__amount--${amountStyle}`}
                        >
                            {transaction.amount
                                ? i18n.amount(transaction.amount.value, transaction.amount.currency, {
                                      currencyDisplay: 'symbol',
                                  })
                                : null}
                        </div>
                        {(transaction?.paymentMethod || transaction?.bankAccount) && (
                            <div className="adyen-pe-transaction-data__section adyen-pe-transaction-data__payment-method">
                                <div className="adyen-pe-transaction-data__payment-method-logo-container">
                                    <Image
                                        name={transaction.paymentMethod ? transaction.paymentMethod.type : 'bankTransfer'}
                                        alt={transaction.paymentMethod ? transaction.paymentMethod.type : 'bankTransfer'}
                                        folder={'logos/'}
                                        className={'adyen-pe-transactions__payment-method-logo'}
                                    />
                                </div>

                                <div className={'adyen-pe-transaction-data__payment-method-detail'}>
                                    {transaction?.paymentMethod
                                        ? parsePaymentMethodType(transaction?.paymentMethod, 'detail')
                                        : transaction?.bankAccount?.accountNumberLastFourDigits}
                                </div>
                            </div>
                        )}
                        <div className={'adyen-pe-transaction-data__section adyen-pe-transaction-data__label'}>{creationDate}</div>
                    </div>

                    {transaction?.balanceAccountDescription && (
                        <div className={'adyen-pe-transaction-data__container'}>
                            <div className={'adyen-pe-transaction-data__label'}>{i18n.get('account')}</div>
                            <div>{transaction.balanceAccountDescription}</div>
                        </div>
                    )}
                    <div className={'adyen-pe-transaction-data__container'}>
                        <div className={'adyen-pe-transaction-data__label'}>{i18n.get('referenceID')}</div>
                        <div aria-label={i18n.get('referenceID')}>{transaction.id}</div>
                    </div>
                </div>
            )}
            {/*{transaction && <div className={'adyen-pe-transaction-data__container adyen-pe-transaction-data__action-buttons'}>*/}
            {/*    <Button aria-label={i18n.get('export')} variant={ButtonVariant.SECONDARY} onClick={() => {}}>*/}
            {/*        {i18n.get('export')}*/}
            {/*    </Button>*/}
            {/*</div>}*/}
        </>
    );
};
