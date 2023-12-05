import useCoreContext from '@src/core/Context/useCoreContext';
import './TransactionDetails.scss';
import { TransactionDetailsComponentProps } from '../types';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { ITransaction } from '@src/types';
import Alert from '@src/components/internal/Alert';
import Spinner from '@src/components/internal/Spinner';
import { TransactionData } from '@src/components/external/TransactionDetails/components/TransactionData';
import { ExternalUIComponentProps } from '../../../types';

export default function TransactionDetails({ transaction, transactionId, title }: ExternalUIComponentProps<TransactionDetailsComponentProps>) {
    const { i18n } = useCoreContext();

    const { data, error, isFetching } = useFetch<ITransaction>({
        url: `transactions/${transactionId}`,
        fetchOptions: { enabled: !!transactionId && !transaction },
    });

    const transactionData = transaction ?? data;
    return (
        <div className="adyen-fp-transaction">
            {title && <div className="adyen-fp-title">{i18n.get(title)}</div>}

            {isFetching && <Spinner />}

            {error && <Alert icon={'cross'}>{error.message ?? i18n.get('unableToLoadTransaction')}</Alert>}

            {transactionData && <TransactionData transaction={transactionData} />}
        </div>
    );
}
