import { lazy, Suspense } from 'preact/compat';
import Spinner from '@src/components/internal/Spinner';
import { SelectedDetail } from '@src/components';

const TransactionDetails = lazy(() => import('../../TransactionDetails/components/TransactionDetails'));
const AccountHolderDetails = lazy(() => import('../../AccountHolder/components/AccountHolderDetails'));
const BalanceAccountDetails = lazy(() => import('../../BalanceAccount/components/BalanceAccountDetails'));
function ModalContent({ selection }: SelectedDetail) {
    if (!selection) return null;
    return (
        <Suspense fallback={<Spinner size="medium" />}>
            {selection.type === 'transaction' && <TransactionDetails transactionId={selection.detail} />}
            {selection.type === 'accountHolder' && <AccountHolderDetails accountHolderId={selection.detail} />}
            {selection.type === 'balanceAccount' && <BalanceAccountDetails balanceAccountId={selection.detail} />}
        </Suspense>
    );
}
export default ModalContent;
