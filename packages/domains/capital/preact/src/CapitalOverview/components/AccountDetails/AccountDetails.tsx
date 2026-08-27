import cx from 'classnames';
import { Fragment, h } from 'preact';
import { useMemo } from 'preact/hooks';
import { AccountDetail } from './AccountDetail';
import {
    CapitalBankAccount,
    CapitalBankAccountField,
    getBankAccountFieldCopyButtonTranslationKey,
    getBankAccountFieldFormattedValue,
    getBankAccountFields,
    getBankAccountFieldTextToCopy,
    getBankAccountFieldTranslationKey,
    isBankAccountFieldPrimary,
} from '@integration-components/capital/domain';

import './AccountDetails.scss';
import { AriaAttributes } from 'preact/compat';

const BASE_CLASS = 'adyen-pe-capital-account-details';

const CLASS_NAMES = {
    detail: `${BASE_CLASS}__detail`,
    detailContent: `${BASE_CLASS}__detail-content`,
    detailLabel: `${BASE_CLASS}__detail-label`,
};

export interface AccountDetailsProps extends Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'> {
    bankAccount: CapitalBankAccount;
    className?: h.JSX.HTMLAttributes['className'];
}

export const AccountDetails = ({ bankAccount, className, ...ariaAttributes }: AccountDetailsProps) => {
    const bankAccountFields = useMemo(() => getBankAccountFields(bankAccount), [bankAccount]);

    return (
        <dl className={cx(BASE_CLASS, className)} {...ariaAttributes}>
            {bankAccountFields.map(field => {
                const fieldValue = bankAccount[field as CapitalBankAccountField];
                return fieldValue ? (
                    <Fragment key={field}>
                        <AccountDetail
                            className={CLASS_NAMES.detail}
                            contentClassName={CLASS_NAMES.detailContent}
                            isPrimary={isBankAccountFieldPrimary(field)}
                            labelClassName={CLASS_NAMES.detailLabel}
                            label={getBankAccountFieldTranslationKey(field)}
                            copyButtonLabel={getBankAccountFieldCopyButtonTranslationKey(field)}
                            content={getBankAccountFieldFormattedValue(field, fieldValue)!}
                            textToCopy={getBankAccountFieldTextToCopy(field, fieldValue)}
                        />
                    </Fragment>
                ) : null;
            })}
        </dl>
    );
};
