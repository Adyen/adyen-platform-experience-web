import { BalanceAccountProps, SelectedDetail } from '@src/components';
import TransactionDetails from '@src/components/external/TransactionDetails/components/TransactionDetails';
import Spinner from '@src/components/internal/Spinner';
import { ITransaction } from '@src/types';
import { hasOwnProperty } from '@src/utils/common';
import { Suspense } from 'preact/compat';
import { useMemo } from 'preact/hooks';

function ModalContent<T>({ selection }: SelectedDetail<T>) {
    const transactionProps = useMemo(() => {
        return hasOwnProperty(selection, 'id')
            ? { transaction: selection as ITransaction & BalanceAccountProps }
            : { transactionId: selection as string };
    }, [selection]);

    return <Suspense fallback={<Spinner size="medium" />}>{transactionProps && <TransactionDetails {...transactionProps} />}</Suspense>;
}
export default ModalContent;
