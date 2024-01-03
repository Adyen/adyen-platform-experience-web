import './AccountHolderDetails.scss';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import Spinner from '@src/components/internal/Spinner';
import Alert from '@src/components/internal/Alert';
import { AccountHolderInfo } from '@src/components/external/AccountHolder/components/AccountHolderInfo';
import type { AccountHolder } from '../../../../types';
import type { AccountHolderComponentProps } from '../types';
import { Tooltip } from '@src/components/internal/Tooltip/Tooltip';

const AccountHolderDetails = ({ accountHolderId, accountHolder, title }: AccountHolderComponentProps) => {
    const { i18n } = useCoreContext();

    const { data, error, isFetching } = useFetch<AccountHolder>({
        url: `accountHolders/${accountHolderId}`,
        fetchOptions: { enabled: !!accountHolderId && !accountHolder },
    });

    const accountHolderData = accountHolder ?? data;

    return (
        <div className="adyen-fp-account-holder">
            {title && <h1 className="adyen-fp-title">{i18n.get(title)}</h1>}

            {!data && isFetching ? (
                <Spinner />
            ) : error ? (
                <Alert icon={'cross'}>{error.message ?? i18n.get('unableToLoadAccountHolder')}</Alert>
            ) : accountHolderData ? (
                <AccountHolderInfo accountHolder={accountHolderData} />
            ) : null}
            <Tooltip content={'This is the meaning of payout'}>
                <span style={'margin-left: 250px'} role={'button'}>
                    {'value'}
                </span>
            </Tooltip>
        </div>
    );
};

export default AccountHolderDetails;
