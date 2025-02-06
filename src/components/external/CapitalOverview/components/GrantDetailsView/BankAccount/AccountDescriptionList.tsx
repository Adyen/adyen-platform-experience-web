import cx from 'classnames';
import { Fragment, FunctionalComponent, h } from 'preact';
import { AccountDescription } from './AccountDescription';
import { getAccountFieldCopyTextConfig, getAccountFieldFormattedValue, getAccountFieldTranslationKey } from './utils';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import type { IGrant } from '../../../../../../types';
import './AccountDescriptionList.scss';

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

export const AccountDescriptionList: FunctionalComponent<BankAccountDescriptionListProps> = ({ bankAccount, className }) => {
    const { i18n } = useCoreContext();
    const { region } = bankAccount;

    return (
        <dl className={cx(CLASS_NAMES.list, className)}>
            {Object.entries(bankAccount).map(([field, value]) => {
                return field ? (
                    <Fragment key={field}>
                        <AccountDescription
                            className={CLASS_NAMES.listItem}
                            contentClassName={CLASS_NAMES.itemContent}
                            labelClassName={CLASS_NAMES.itemLabel}
                            label={getAccountFieldTranslationKey(field, region)}
                            content={getAccountFieldFormattedValue(field, value, i18n, region)}
                            copyTextConfig={getAccountFieldCopyTextConfig(field, value, i18n, region)}
                        />
                    </Fragment>
                ) : null;
            })}
        </dl>
    );
};
