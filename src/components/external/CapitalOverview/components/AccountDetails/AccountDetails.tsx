import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import { AccountDetail } from './AccountDetail';
import { Fragment, FunctionalComponent, h } from 'preact';
import { AccountDetailsProps, BankAccountField } from './types';
import { getAccountFieldFormattedValue, getAccountFieldTextToCopy, getAccountFieldTranslationKey } from './utils';
import './AccountDetails.scss';

const BASE_CLASS = 'adyen-pe-capital-account-details';

const CLASS_NAMES = {
    detail: `${BASE_CLASS}__detail`,
    detailContent: `${BASE_CLASS}__detail-content`,
    detailLabel: `${BASE_CLASS}__detail-label`,
};

export const AccountDetails: FunctionalComponent<AccountDetailsProps> = ({ bankAccount, className }) => {
    const orderedBankAccountFields = useMemo(() => {
        const { accountNumber, iban, order, region, ...accountDetails } = bankAccount;
        const accountFields = Object.keys({ iban, accountNumber, ...accountDetails, region });
        const orderedFields = Array.isArray(order) ? order.filter(field => accountFields.includes(field)) : accountFields;
        return [...new Set(orderedFields)];
    }, [bankAccount]);

    return (
        <dl className={cx(BASE_CLASS, className)}>
            {orderedBankAccountFields.map(field => {
                const fieldValue = bankAccount[field as BankAccountField];
                return fieldValue ? (
                    <Fragment key={field}>
                        <AccountDetail
                            className={CLASS_NAMES.detail}
                            contentClassName={CLASS_NAMES.detailContent}
                            labelClassName={CLASS_NAMES.detailLabel}
                            label={getAccountFieldTranslationKey(field)}
                            content={getAccountFieldFormattedValue(field, fieldValue)!}
                            textToCopy={getAccountFieldTextToCopy(field, fieldValue)}
                        />
                    </Fragment>
                ) : null;
            })}
        </dl>
    );
};
