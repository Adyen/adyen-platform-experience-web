import { DATE_FORMAT } from '../../../internal/DataOverviewDisplay/constants';
import { TransactionDetailData } from '../types';
import TransactionDataSkeleton from './TransactionDataSkeleton';
import { Image } from '../../../internal/Image/Image';
import { parsePaymentMethodType } from '../../TransactionsOverview/components/utils';
import { Tag } from '../../../internal/Tag/Tag';
import { TagVariant } from '../../../internal/Tag/types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';
import './TransactionData.scss';
export const TransactionData = ({ transaction, isFetching }: { transaction: TransactionDetailData; isFetching?: boolean }) => {
    const { i18n } = useCoreContext();
    const createdAt = useMemo(() => (transaction ? i18n.date(new Date(transaction.createdAt), DATE_FORMAT).toString() : ''), [transaction, i18n]);

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
                                        className={'adyen-pe-transaction-data__payment-method-logo-bank'}
                                    />
                                </div>

                                <div className={'adyen-pe-transaction-data__payment-method-detail'}>
                                    {transaction?.paymentMethod
                                        ? parsePaymentMethodType(transaction?.paymentMethod, 'detail')
                                        : transaction?.bankAccount?.accountNumberLastFourDigits}
                                </div>
                            </div>
                        )}
                        <div className={'adyen-pe-transaction-data__section adyen-pe-transaction-data__label'}>{createdAt}</div>
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
        </>
    );
};
