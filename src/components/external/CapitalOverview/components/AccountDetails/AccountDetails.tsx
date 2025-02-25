import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import { AccountDetail } from './AccountDetail';
import { EMPTY_OBJECT } from '../../../../../utils';
import { Fragment, FunctionalComponent, h } from 'preact';
import { AccountDetailsProps, BankAccountField, BankAccountFieldValue, BankAccountIdentification } from './types';
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
        const { accountIdentification = EMPTY_OBJECT as BankAccountIdentification, region } = bankAccount;
        const { accountNumber, iban, ...restAccountDetails } = accountIdentification;
        // Minor re-ordering of displayable account fields
        return { iban, accountNumber, ...restAccountDetails, region };
    }, [bankAccount]);

    return (
        <dl className={cx(BASE_CLASS, className)}>
            {(Object.entries(accountDetails) as [BankAccountField, BankAccountFieldValue][]).map(([field, value]) => {
                // Will be `undefined` if no translation key has been registered for the account field.
                // The existence of this value serves as a whitelisting criteria for displayable fields.
                //
                // To make an account field displayable, define a translation key for it.
                // To prevent an account field from being displayed, unregister its translation key.
                // @see {@link getAccountFieldTranslationKey}
                const fieldLabel = getAccountFieldTranslationKey(field);

                // Only render account fields with a visible label (translation key) and non-empty value
                return fieldLabel && value ? (
                    <Fragment key={field}>
                        <AccountDetail
                            className={CLASS_NAMES.detail}
                            contentClassName={CLASS_NAMES.detailContent}
                            labelClassName={CLASS_NAMES.detailLabel}
                            label={fieldLabel}
                            content={getAccountFieldFormattedValue(field, value, i18n)}
                            textToCopy={getAccountFieldTextToCopy(field, value)}
                        />
                    </Fragment>
                ) : null;
            })}
        </dl>
    );
};
