import Button from '@src/components/internal/Button';
import { ButtonVariant } from '@src/components/internal/Button/types';
import { Image } from '@src/components/internal/Image/Image';
import { parsePaymentMethodType } from '@src/components/external/Transactions/components/utils';
import { Tag } from '@src/components/internal/Tag/Tag';
import { TagVariant } from '@src/components/internal/Tag/types';
import { TransactionDataProps } from '@src/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';

export const TransactionData = ({ transaction }: { transaction: TransactionDataProps }) => {
    const { i18n } = useCoreContext();
    const creationDate = useMemo(
        () =>
            i18n
                .date(new Date(transaction.creationDate), {
                    weekday: 'long',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'shortOffset',
                })
                .toString(),
        [transaction.creationDate, i18n]
    );

    return (
        <div className={'adyen-fp-transaction-data'}>
            <div className={'adyen-fp-transaction-data--container'}>
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
                <div className={'adyen-fp-transaction-data-section adyen-fp-transaction-data--amount'}>
                    {transaction?.amount
                        ? i18n.amount(transaction?.amount?.value, transaction?.amount?.currency, {
                              currencyDisplay: 'symbol',
                          })
                        : null}
                </div>
                <div className="adyen-fp-transaction-data-section adyen-fp-transaction-data__payment-method">
                    <div className="adyen-fp-transaction-data__payment-method-logo-container">
                        <Image
                            name={transaction.paymentMethod.type}
                            alt={transaction.paymentMethod.type}
                            folder={'logos/'}
                            className={'adyen-fp-transactions__payment-method-logo'}
                        />
                    </div>
                    {parsePaymentMethodType(transaction.paymentMethod, 'detail')}
                </div>
                <div className={'adyen-fp-transaction-data-section adyen-fp-transaction-data__label'}>{creationDate}</div>
            </div>
            {transaction?.balanceAccountDescription && (
                <div className={'adyen-fp-transaction-data--container'}>
                    <div className={'adyen-fp-transaction-data__label'}>{i18n.get('account')}</div>
                    <div>{transaction.balanceAccountDescription}</div>
                </div>
            )}
            <div className={'adyen-fp-transaction-data--container'}>
                <div className={'adyen-fp-transaction-data__label'}>{i18n.get('referenceID')}</div>
                <div>{transaction.id}</div>
            </div>
            <div className={'adyen-fp-transaction-data--container adyen-fp-transaction-data--action-buttons'}>
                <Button aria-label={i18n.get('export')} variant={ButtonVariant.SECONDARY} onClick={() => {}}>
                    {i18n.get('export')}
                </Button>
            </div>
        </div>
    );
};
