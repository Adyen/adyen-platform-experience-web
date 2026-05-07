import { TRANSACTION_ANALYTICS_CATEGORY, TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS } from '../../constants';
import { useDurationEvent } from '@integration-components/hooks-preact/useEventDispatcher/useDurationEvent';
import { useLandedPageEvent } from '@integration-components/hooks-preact/useEventDispatcher/useLandedPageEvent';
import { useTransactionsOverviewContext } from '../../context/TransactionsOverviewContext';
import InsightsTotals from '../InsightsTotals/InsightsTotals';

const sharedAnalyticsEventProperties = {
    category: TRANSACTION_ANALYTICS_CATEGORY,
    subCategory: TRANSACTION_ANALYTICS_SUBCATEGORY_INSIGHTS,
} as const;

const TransactionsOverviewInsights = () => {
    const { currenciesLookupResult, insightsCurrency, insightsTotalsResult } = useTransactionsOverviewContext();

    useLandedPageEvent(sharedAnalyticsEventProperties);
    useDurationEvent(sharedAnalyticsEventProperties);

    return (
        <InsightsTotals currency={insightsCurrency} currenciesLookupResult={currenciesLookupResult} transactionsTotalsResult={insightsTotalsResult} />
    );
};

export default TransactionsOverviewInsights;
