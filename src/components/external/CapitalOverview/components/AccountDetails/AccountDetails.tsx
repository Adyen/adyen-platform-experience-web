import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import { AccountDetail } from './AccountDetail';
import { Fragment, FunctionalComponent, h } from 'preact';
import { AccountDetailsProps, BankAccountField, BankAccountFieldValue } from './types';
import { getAccountFieldFormattedValue, getAccountFieldTextToCopy, getAccountFieldTranslationKey } from './utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import './AccountDetails.scss';

const BASE_CLASS = 'adyen-pe-capital-account-details';

const CLASS_NAMES = {
    detail: `${BASE_CLASS}__detail`,
    detailContent: `${BASE_CLASS}__detail-content`,
    detailLabel: `${BASE_CLASS}__detail-label`,
};

export const AccountDetails: FunctionalComponent<AccountDetailsProps> = ({ bankAccount, className }) => {
    const { i18n } = useCoreContext();

    const accountDetails = useMemo(() => {
        const { bankAccountIdentification, region } = bankAccount;
        return { ...bankAccountIdentification, region };
    }, [bankAccount]);

    return (
        <dl className={cx(BASE_CLASS, className)}>
            {(Object.entries(accountDetails) as [BankAccountField, BankAccountFieldValue][]).map(([field, value]) => {
                return field && value ? (
                    <Fragment key={field}>
                        <AccountDetail
                            className={CLASS_NAMES.detail}
                            contentClassName={CLASS_NAMES.detailContent}
                            labelClassName={CLASS_NAMES.detailLabel}
                            label={getAccountFieldTranslationKey(field)}
                            content={getAccountFieldFormattedValue(field, value, i18n)}
                            textToCopy={getAccountFieldTextToCopy(field, value)}
                        />
                    </Fragment>
                ) : null;
            })}
        </dl>
    );
};
