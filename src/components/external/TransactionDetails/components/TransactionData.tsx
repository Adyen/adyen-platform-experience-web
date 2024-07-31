import TransactionDataContainer from './TransactionDataContainer';
import { TransactionDataContextProvider, TransactionDataContextProviderProps } from '../context';
import './TransactionData.scss';

export const TransactionData = (props: Omit<TransactionDataContextProviderProps, 'children'>) => (
    <TransactionDataContextProvider {...props}>
        <TransactionDataContainer />
    </TransactionDataContextProvider>
);
