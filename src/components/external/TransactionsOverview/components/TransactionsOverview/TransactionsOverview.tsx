import TransactionsOverviewList from './TransactionsOverviewList';
import TransactionsOverviewShell from './TransactionsOverviewShell';
import TransactionsOverviewInsights from './TransactionsOverviewInsights';
import { TransactionsOverviewProvider } from '../../context/TransactionsOverviewContext';
import { useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import { TransactionsOverviewProps } from '../../types';

export const TransactionsOverview = (props: TransactionsOverviewProps) => (
    <TransactionsOverviewProvider {...props}>
        <TransactionsOverview.Content />
    </TransactionsOverviewProvider>
);

TransactionsOverview.Content = () => {
    const { isTransactionsView } = useTransactionsOverviewContext();
    // prettier-ignore
    return (
        <TransactionsOverviewShell>
            {isTransactionsView ? <TransactionsOverviewList /> : <TransactionsOverviewInsights />}
        </TransactionsOverviewShell>
    );
};
