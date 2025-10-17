import cx from 'classnames';
import { Fragment } from 'preact';
import { useMemo } from 'preact/hooks';
import { AccountDetail } from './AccountDetail';
import { AccountDetailsProps, BankAccountField } from './types';
import {
    getAccountFieldCopyButtonLabelKey,
    getAccountFieldFormattedValue,
    getAccountFieldTextToCopy,
    getAccountFieldTranslationKey,
    isAccountFieldPrimary,
} from './utils';
import './AccountDetails.scss';

const BASE_CLASS = 'adyen-pe-capital-account-details';

const CLASS_NAMES = {
    detail: `${BASE_CLASS}__detail`,
    detailContent: `${BASE_CLASS}__detail-content`,
    detailLabel: `${BASE_CLASS}__detail-label`,
};

export const AccountDetails = ({ bankAccount, className, ...ariaAttributes }: AccountDetailsProps) => {
    const orderedBankAccountFields = useMemo(() => {
        const { accountNumber, iban, order, region, ...accountDetails } = bankAccount;
        const accountFields = Object.keys({ iban, accountNumber, ...accountDetails, region });
        const orderedFields = Array.isArray(order) ? order.filter(field => accountFields.includes(field)) : accountFields;
        return [...new Set(orderedFields)];
    }, [bankAccount]);

    return (
        <dl className={cx(BASE_CLASS, className)} {...ariaAttributes}>
            {orderedBankAccountFields.map(field => {
                const fieldValue = bankAccount[field as BankAccountField];
                return fieldValue ? (
                    <Fragment key={field}>
                        <AccountDetail
                            className={CLASS_NAMES.detail}
                            contentClassName={CLASS_NAMES.detailContent}
                            isPrimary={isAccountFieldPrimary(field)}
                            labelClassName={CLASS_NAMES.detailLabel}
                            label={getAccountFieldTranslationKey(field)}
                            copyButtonLabel={getAccountFieldCopyButtonLabelKey(field)}
                            content={getAccountFieldFormattedValue(field, fieldValue)!}
                            textToCopy={getAccountFieldTextToCopy(field, fieldValue)}
                        />
                    </Fragment>
                ) : null;
            })}
        </dl>
    );
};
