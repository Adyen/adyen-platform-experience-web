import cx from 'classnames';
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
    return (
        <dl className={cx(BASE_CLASS, className)}>
            {bankAccount.order.map(field => {
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
