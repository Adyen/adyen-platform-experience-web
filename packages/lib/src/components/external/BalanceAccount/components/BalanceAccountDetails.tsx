import useCoreContext from '@src/core/Context/useCoreContext';
import './BalanceAccountDetails.scss';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import Spinner from '@src/components/internal/Spinner';
import Alert from '@src/components/internal/Alert';
import { BalanceAccountInfo } from '@src/components/external/BalanceAccount/components/BalanceAccountInfo';
import type { BalanceAccountComponentProps } from '../types';
import type { BalanceAccount } from '@src/types';

function BalanceAccountDetails({ balanceAccount, balanceAccountId }: BalanceAccountComponentProps) {
    const { i18n } = useCoreContext();

    const { data, error, isFetching } = useFetch<BalanceAccount>(
        { url: `balanceAccounts/${balanceAccountId}` },
        { enabled: !!balanceAccountId && !balanceAccount }
    );

    const balanceAccountData = balanceAccount ?? data;

    return (
        <div className="adyen-fp-balance-account">
            <div className="adyen-fp-title">{i18n.get('balanceAccount')}</div>

            {isFetching && <Spinner />}

            {error && <Alert icon={'cross'}>{error.message ?? i18n.get('unableToLoadBalanceAccount')} </Alert>}

            {balanceAccountData && <BalanceAccountInfo balanceAccount={balanceAccountData} />}
        </div>
    );
}

export default BalanceAccountDetails;
