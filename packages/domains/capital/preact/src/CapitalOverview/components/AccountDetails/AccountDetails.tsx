import cx from 'classnames';
import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { AccountDetail } from './AccountDetail';
import { CapitalBankAccount, getBankAccountDetails } from '@integration-components/capital/domain';

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
    const accountDetails = useMemo(() => getBankAccountDetails(bankAccount), [bankAccount]);

    return (
        <dl className={cx(BASE_CLASS, className)} {...ariaAttributes}>
            {accountDetails.map(detail => (
                <AccountDetail
                    key={detail.field}
                    className={CLASS_NAMES.detail}
                    contentClassName={CLASS_NAMES.detailContent}
                    isPrimary={detail.isPrimary}
                    labelClassName={CLASS_NAMES.detailLabel}
                    label={detail.label}
                    copyButtonLabel={detail.copyButtonLabel}
                    content={detail.content}
                    textToCopy={detail.textToCopy}
                />
            ))}
        </dl>
    );
};
