import { ITransaction } from '@src/types';
import { hasOwnProperty } from '@src/utils/common';
import { lazy, Suspense } from 'preact/compat';
import Spinner from '@src/components/internal/Spinner';
import { BalanceAccountProps, SelectedDetail } from '@src/components';
import { useMemo } from 'preact/hooks';

const TransactionDetails = lazy(() => import('../../TransactionDetails/components/TransactionDetails'));

function ModalContent<T>({ selection }: SelectedDetail<T>) {
    const transactionProps = useMemo(() => {
        console.log(selection.detail);
        if (selection.type === 'transaction') {
            return hasOwnProperty(selection.detail, 'id')
                ? { transaction: selection.detail as ITransaction & BalanceAccountProps }
                : { transactionId: selection.detail as string };
        }
        return null;
    }, [selection]);

    return (
        <Suspense fallback={<Spinner size="medium" />}>
            {selection.type === 'transaction' && transactionProps && <TransactionDetails {...transactionProps} />}
        </Suspense>
    );
}
export default ModalContent;
