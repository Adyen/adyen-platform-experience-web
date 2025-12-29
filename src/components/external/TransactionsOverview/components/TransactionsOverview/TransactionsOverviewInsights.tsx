import { TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS } from '../../constants';
import { useDurationEvent } from '../../../../../hooks/useAnalytics/useDurationEvent';
import { useLandedPageEvent } from '../../../../../hooks/useAnalytics/useLandedPageEvent';
import useTransactionsTotals from '../../hooks/useTransactionsTotals';
import InsightsTotals from '../InsightsTotals/InsightsTotals';

const sharedAnalyticsEventProperties = {
    category: TRANSACTION_ANALYTICS_CATEGORY,
    subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS,
} as const;

interface TransactionsOverviewInsightsProps {
    currency?: string;
    transactionsTotalsResult: ReturnType<typeof useTransactionsTotals>;
}

const TransactionsOverviewInsights = ({ currency, transactionsTotalsResult }: TransactionsOverviewInsightsProps) => {
    const { isWaiting: loadingTotals, totalsLookup: totals } = transactionsTotalsResult;
    useLandedPageEvent(sharedAnalyticsEventProperties);
    useDurationEvent(sharedAnalyticsEventProperties);
    return <InsightsTotals currency={currency} loadingTotals={loadingTotals} totals={totals} />;
};

export default TransactionsOverviewInsights;
