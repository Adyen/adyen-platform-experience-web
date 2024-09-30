import { DATE_FORMAT_TRANSACTION_DETAILS } from '../../../../constants';
import { TransactionDetailData } from '../types';
import TransactionDataSkeleton from './TransactionDataSkeleton';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
import { Image } from '../../../internal/Image/Image';
import { parsePaymentMethodType } from '../../TransactionsOverview/components/utils';
import { Tag } from '../../../internal/Tag/Tag';
import { TagVariant } from '../../../internal/Tag/types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';
import './TransactionData.scss';
import { PropsWithChildren } from 'preact/compat';
import { FunctionalComponent } from 'preact';
import { TRANSACTION_FIELDS } from '../../TransactionsOverview/components/TransactionsTable/TransactionsTable';
import cx from 'classnames';

const TransactionDataContainer: FunctionalComponent<PropsWithChildren> = ({ children }) => (
    <div className={'adyen-pe-transaction-data__container'}>{children}</div>
);

const DETAILS_FIELDS = [
    'status',
    'category',
    'paymentMethod',
    'bankAccount',
    'balanceAccount',
    'id',
    'balanceAccountId',
] satisfies (keyof TransactionDetailData)[];

export const TransactionData = ({
    transaction,
    isFetching,
    error,
}: {
    transaction?: TransactionDetailData & Record<string, any>;
    isFetching?: boolean;
    error?: boolean;
}) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(transaction?.balanceAccount?.timeZone);
    const createdAt = useMemo(
        () => (transaction ? dateFormat(new Date(transaction.createdAt), DATE_FORMAT_TRANSACTION_DETAILS) : ''),
        [transaction, dateFormat]
    );

    const amountStyle = transaction?.status === 'Booked' ? 'default' : transaction?.status === 'Reversed' ? 'error' : 'pending';

    const customColumns = useMemo(() => {
        const fields = new Set([...DETAILS_FIELDS, ...TRANSACTION_FIELDS]);
        return Object.entries(transaction || {})
            .filter(([key]) => !fields.has(key as any))
            .map(([key, value]) => ({ key, value }));
    }, [transaction]);

    return (
        <>
            {(!transaction && !error) || isFetching ? (
                <TransactionDataSkeleton isLoading={isFetching} skeletonRowNumber={5} />
            ) : transaction ? (
                <div className={'adyen-pe-transaction-data'}>
                    <TransactionDataContainer>
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
                            {transaction?.amount
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
                    </TransactionDataContainer>

                    {transaction?.balanceAccount?.description && (
                        <TransactionDataContainer>
                            <div className={'adyen-pe-transaction-data__label'}>{i18n.get('account')}</div>
                            <div>{transaction.balanceAccount.description}</div>
                        </TransactionDataContainer>
                    )}
                    <TransactionDataContainer>
                        <div className={'adyen-pe-transaction-data__label'}>{i18n.get('referenceID')}</div>
                        <div aria-label={i18n.get('referenceID')}>{transaction?.id}</div>
                    </TransactionDataContainer>
                    {customColumns.map(({ key, value }) => {
                        return (
                            <TransactionDataContainer key={key}>
                                <div className={'adyen-pe-transaction-data__label'}>{i18n.get(key as any)}</div>
                                <div aria-label={i18n.get(key as any)}>{value}</div>
                            </TransactionDataContainer>
                        );
                    })}
                </div>
            ) : null}
        </>
    );
};
