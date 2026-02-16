import { TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS } from '../../constants';
import { useDurationEvent } from '../../../../../hooks/useAnalytics/useDurationEvent';
import { useLandedPageEvent } from '../../../../../hooks/useAnalytics/useLandedPageEvent';
import useTransactionsTotals from '../../hooks/useTransactionsTotals';
import useCurrenciesLookup from '../../hooks/useCurrenciesLookup';
import InsightsTotals from '../InsightsTotals/InsightsTotals';

const sharedAnalyticsEventProperties = {
    category: TRANSACTION_ANALYTICS_CATEGORY,
    subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS,
} as const;

export interface TransactionsOverviewInsightsProps {
    currency?: string;
    currenciesLookupResult: ReturnType<typeof useCurrenciesLookup>;
    transactionsTotalsResult: ReturnType<typeof useTransactionsTotals>;
}

const TransactionsOverviewInsights = (props: TransactionsOverviewInsightsProps) => {
    useLandedPageEvent(sharedAnalyticsEventProperties);
    useDurationEvent(sharedAnalyticsEventProperties);
    return <InsightsTotals {...props} />;
};

export default TransactionsOverviewInsights;
