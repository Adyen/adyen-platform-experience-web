import './AccountHolderDetails.scss';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import Spinner from '@src/components/internal/Spinner';
import Alert from '@src/components/internal/Alert';
import { AccountHolderInfo } from '@src/components/external/AccountHolder/components/AccountHolderInfo';
import type { AccountHolder } from '@src/types';
import type { AccountHolderComponentProps } from '../types';

const AccountHolderDetails = ({ accountHolderId, accountHolder }: AccountHolderComponentProps) => {
    const { i18n } = useCoreContext();

    const { data, error, isFetching } = useFetch<AccountHolder>({
        url: `accountHolders/${accountHolderId}`,
        fetchOptions: { enabled: !!accountHolderId && !accountHolder },
    });

    const accountHolderData = accountHolder ?? data;

    return (
        <div className="adyen-fp-account-holder">
            <h1 className="adyen-fp-title">{i18n.get('accountHolder')}</h1>

            {!data && isFetching ? (
                <Spinner />
            ) : error ? (
                <Alert icon={'cross'}>{error.message ?? i18n.get('unableToLoadAccountHolder')}</Alert>
            ) : accountHolderData ? (
                <AccountHolderInfo accountHolder={accountHolderData} />
            ) : null}
        </div>
    );
};

export default AccountHolderDetails;
