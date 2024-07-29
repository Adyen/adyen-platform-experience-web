import { useMemo } from 'preact/hooks';
import { parsePaymentMethodType } from '../../TransactionsOverview/components/utils';
import { DATE_FORMAT_TRANSACTION_DETAILS } from '../../../internal/DataOverviewDisplay/constants';
import { Image } from '../../../internal/Image/Image';
import { Tag } from '../../../internal/Tag/Tag';
import { TagVariant } from '../../../internal/Tag/types';
import type { TransactionDetailData } from '../types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import './TransactionData.scss';

const getTransactionAmountStyleByStatus = (status?: TransactionDetailData['status']) => {
    switch (status) {
        case 'Booked':
            return 'default';
        case 'Reversed':
            return 'error';
        default:
            return 'pending';
    }
};

const getTransactionTagVariantByStatus = (status?: TransactionDetailData['status']) => {
    switch (status) {
        case 'Booked':
            return TagVariant.SUCCESS;
        case 'Reversed':
            return TagVariant.ERROR;
        default:
            return TagVariant.DEFAULT;
    }
};

export const TransactionDataView = ({ transaction }: { transaction: TransactionDetailData }) => {
    const { i18n } = useCoreContext();
    const amountStyle = useMemo(() => getTransactionAmountStyleByStatus(transaction?.status), [transaction]);
    const tagVariant = useMemo(() => getTransactionTagVariantByStatus(transaction?.status), [transaction]);

    const createdAt = useMemo(
        () => (transaction ? i18n.date(new Date(transaction.createdAt), DATE_FORMAT_TRANSACTION_DETAILS).toString() : ''),
        [transaction, i18n]
    );

    return (
        <div className={'adyen-pe-transaction-data'}>
            <div className={'adyen-pe-transaction-data__container'}>
                {(transaction?.status || transaction?.category) && (
                    <div className={'adyen-pe-transaction-data__section adyen-pe-transaction-data__tag-container'}>
                        {transaction?.status && <Tag label={i18n.get(transaction.status)} variant={tagVariant} />}
                        {transaction.category && <Tag label={i18n.get(`txType.${transaction.category}`)} variant={TagVariant.DEFAULT} />}
                    </div>
                )}
                <div
                    className={`adyen-pe-transaction-data__section adyen-pe-transaction-data__amount adyen-pe-transaction-data__amount--${amountStyle}`}
                >
                    {transaction.amount
                        ? `${i18n.amount(transaction.amount.value, transaction.amount.currency, {
                              hideCurrency: true,
                          })} ${transaction.amount.currency}`
                        : null}
                </div>
                {(transaction?.paymentMethod || transaction?.bankAccount) && (
                    <div className="adyen-pe-transaction-data__section adyen-pe-transaction-data__payment-method">
                        <div className="adyen-pe-transaction-data__payment-method-logo-container">
                            <Image
                                name={transaction.paymentMethod ? transaction.paymentMethod.type : 'bankTransfer'}
                                alt={transaction.paymentMethod ? transaction.paymentMethod.type : 'bankTransfer'}
                                folder={'logos/'}
                                className={'adyen-pe-transaction-data__payment-method-logo'}
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
    );
};

export default TransactionDataView;
