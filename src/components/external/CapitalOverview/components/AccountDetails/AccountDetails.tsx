import cx from 'classnames';
import { IGrant } from '../../../../../types';
import { AccountDetail } from './AccountDetail';
import { Fragment, FunctionalComponent, h } from 'preact';
import { getAccountFieldFormattedValue, getAccountFieldTextToCopy, getAccountFieldTranslationKey } from './utils';
import { KeyOfRecord, ValueOfRecord } from '../../../../../utils/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import './AccountDetails.scss';

const BASE_CLASS = 'adyen-pe-capital-account-details';

const CLASS_NAMES = {
    detail: `${BASE_CLASS}__detail`,
    detailContent: `${BASE_CLASS}__detail-content`,
    detailLabel: `${BASE_CLASS}__detail-label`,
};

type AccountDetailEntry = [KeyOfRecord<AccountDetailsProps['bankAccount']>, ValueOfRecord<AccountDetailsProps['bankAccount']>];

export type AccountDetailsProps = {
    bankAccount: NonNullable<IGrant['unscheduledRepaymentAccounts']>[number];
    className?: h.JSX.HTMLAttributes['className'];
};

export const AccountDetails: FunctionalComponent<AccountDetailsProps> = ({ bankAccount, className }) => {
    const { i18n } = useCoreContext();
    return (
        <dl className={cx(BASE_CLASS, className)}>
            {(Object.entries(bankAccount) as AccountDetailEntry[]).map(([field, value]) => {
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
