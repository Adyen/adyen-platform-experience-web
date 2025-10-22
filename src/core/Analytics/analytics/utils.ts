import { EmbeddedEventItem } from '../../../hooks/useAnalytics/useAnalytics';

export const encodeAnalyticsEvent = (event: EmbeddedEventItem) => {
    const formattedOptions = JSON.stringify(event);
    const encodedData = window.btoa(formattedOptions);
    const data = new URLSearchParams();
    data.set('data', encodedData);
    return data;
};
