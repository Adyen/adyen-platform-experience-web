import TransactionDataContainer from './TransactionDataContainer';
import TransactionDataProvider, { TransactionDataProviderProps } from './TransactionDataProvider';
import './TransactionData.scss';

export const TransactionData = (props: Omit<TransactionDataProviderProps, 'children'>) => (
    <TransactionDataProvider {...props}>
        <TransactionDataContainer />
    </TransactionDataProvider>
);
