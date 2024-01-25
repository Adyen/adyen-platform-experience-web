import { lazy, Suspense } from 'preact/compat';
import Spinner from '@src/components/internal/Spinner';
import { SelectedDetail } from '@src/components';

const TransactionDetails = lazy(() => import('../../TransactionDetails/components/TransactionDetails'));

function ModalContent({ selection }: SelectedDetail) {
    if (!selection) return null;
    return (
        <Suspense fallback={<Spinner size="medium" />}>
            {selection.type === 'transaction' && <TransactionDetails transactionId={selection.detail} />}
        </Suspense>
    );
}
export default ModalContent;
