import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import { FunctionalComponent, h } from 'preact';
import { BankAccountDescription } from './BankAccountDescription';
import { getFormattedBankAccountNumber } from './utils';
import { EMPTY_OBJECT } from '../../../../../utils';
import { IGrant } from '../../../../../types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import './BankAccountDescriptionList.scss';

const BASE_CLASS = 'adyen-pe-capital-bank-account-description-list';

const CLASS_NAMES = {
    list: BASE_CLASS,
    listItem: `${BASE_CLASS}__item`,
    itemContent: `${BASE_CLASS}__item-content`,
    itemLabel: `${BASE_CLASS}__item-label`,
};

export type BankAccountDescriptionListProps = {
    bankAccount: NonNullable<IGrant['earlyRepaymentAccounts']>[number];
    className?: h.JSX.HTMLAttributes['className'];
};

export const BankAccountDescriptionList: FunctionalComponent<BankAccountDescriptionListProps> = ({ bankAccount, className }) => {
    const { accountNumber, routingNumber, region, bankName } = bankAccount;
    const { i18n } = useCoreContext();

    const formattedCountryOrRegion = useMemo(() => {
        return region === 'US' ? i18n.get('country.unitedStates') : region;
    }, [i18n, region]);

    return (
        <dl className={cx(CLASS_NAMES.list, className)}>
            {accountNumber && (
                <BankAccountDescription
                    className={CLASS_NAMES.listItem}
                    contentClassName={CLASS_NAMES.itemContent}
                    labelClassName={CLASS_NAMES.itemLabel}
                    label="capital.bankAccountNumber"
                    content={getFormattedBankAccountNumber(accountNumber)}
                    copyTextConfig={{ textToCopy: accountNumber }}
                />
            )}
            {routingNumber && (
                <BankAccountDescription
                    className={CLASS_NAMES.listItem}
                    contentClassName={CLASS_NAMES.itemContent}
                    labelClassName={CLASS_NAMES.itemLabel}
                    label="capital.bankRoutingNumber"
                    content={routingNumber}
                    copyTextConfig={EMPTY_OBJECT}
                />
            )}
            <BankAccountDescription
                className={CLASS_NAMES.listItem}
                contentClassName={CLASS_NAMES.itemContent}
                labelClassName={CLASS_NAMES.itemLabel}
                label="capital.bankCountryOrRegion"
                content={formattedCountryOrRegion}
            />
            <BankAccountDescription
                className={CLASS_NAMES.listItem}
                contentClassName={CLASS_NAMES.itemContent}
                labelClassName={CLASS_NAMES.itemLabel}
                label="capital.bankName"
                content={bankName}
            />
        </dl>
    );
};
