import TransactionsOverviewList from './TransactionsOverviewList';
import TransactionsOverviewShell from './TransactionsOverviewShell';
import TransactionsOverviewInsights from './TransactionsOverviewInsights';
import { TransactionsOverviewProvider } from '../../context/TransactionsOverviewContext';
import { useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import { TransactionsOverviewProps } from '../../types';

const TransactionsOverviewContent = () => {
    const { isTransactionsView } = useTransactionsOverviewContext();
    // prettier-ignore
    return (
        <TransactionsOverviewShell>
            {isTransactionsView ? <TransactionsOverviewList /> : <TransactionsOverviewInsights />}
        </TransactionsOverviewShell>
    );
};

export const TransactionsOverview = (props: TransactionsOverviewProps) => (
    <TransactionsOverviewProvider {...props}>
        <TransactionsOverviewContent />
    </TransactionsOverviewProvider>
);
