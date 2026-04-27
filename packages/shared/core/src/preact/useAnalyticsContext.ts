import { useContext } from 'preact/hooks';

import { AnalyticsContext } from './AnalyticsContext';

const useAnalyticsContext = () => {
    const context = useContext(AnalyticsContext);

    if (!context) {
        throw new Error('Cannot use AnalyticsContext without <AnalyticsProvider>');
    }

    return context;
};

export default useAnalyticsContext;
