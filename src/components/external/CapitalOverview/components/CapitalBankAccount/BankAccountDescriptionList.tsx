import cx from 'classnames';
import { FunctionalComponent, h } from 'preact';
import { BankAccountDescription } from './BankAccountDescription';
import { getFormattedBankAccountNumber, getFormattedBankAccountRegion } from './utils';
import { EMPTY_OBJECT } from '../../../../../utils';
import { TranslationKey } from '../../../../../translations';
import { IGrant } from '../../../../../types';
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
    return (
        <dl className={cx(CLASS_NAMES.list, className)}>
            {accountNumber && (
                <BankAccountDescription
                    className={CLASS_NAMES.listItem}
                    contentClassName={CLASS_NAMES.itemContent}
                    labelClassName={CLASS_NAMES.itemLabel}
                    label={'Account number' as TranslationKey} // [TODO]: Create translation key
                    value={getFormattedBankAccountNumber(accountNumber)}
                    copyTextConfig={{ textToCopy: accountNumber }}
                />
            )}
            {routingNumber && (
                <BankAccountDescription
                    className={CLASS_NAMES.listItem}
                    contentClassName={CLASS_NAMES.itemContent}
                    labelClassName={CLASS_NAMES.itemLabel}
                    label={'Routing number' as TranslationKey} // [TODO]: Create translation key
                    value={routingNumber}
                    copyTextConfig={EMPTY_OBJECT}
                />
            )}
            <BankAccountDescription
                className={CLASS_NAMES.listItem}
                contentClassName={CLASS_NAMES.itemContent}
                labelClassName={CLASS_NAMES.itemLabel}
                label={'Country/region' as TranslationKey} // [TODO]: Create translation key
                value={getFormattedBankAccountRegion(region)}
            />
            <BankAccountDescription
                className={CLASS_NAMES.listItem}
                contentClassName={CLASS_NAMES.itemContent}
                labelClassName={CLASS_NAMES.itemLabel}
                label={'Bank name' as TranslationKey} // [TODO]: Create translation key
                value={bankName}
            />
        </dl>
    );
};
