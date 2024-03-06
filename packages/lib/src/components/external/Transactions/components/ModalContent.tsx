import { BalanceAccountProps, SelectedDetail } from '@src/components';
import TransactionDetails from '@src/components/external/TransactionDetails/components/TransactionDetails';
import { ITransaction } from '@src/types';
import { hasOwnProperty } from '@src/utils/common';
import { useMemo } from 'preact/hooks';

function ModalContent<T>({ data }: SelectedDetail<T>) {
    const transactionProps = useMemo(() => {
        return hasOwnProperty(data, 'id') ? { transaction: data as ITransaction & BalanceAccountProps } : { transactionId: data as string };
    }, [data]);

    return <>{transactionProps && <TransactionDetails {...transactionProps} />}</>;
}
export default ModalContent;
