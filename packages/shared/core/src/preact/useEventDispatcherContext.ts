import { useContext } from 'preact/hooks';

import { EventDispatcherContext } from './EventDispatcherContext';

const useEventDispatcherContext = () => {
    const context = useContext(EventDispatcherContext);

    if (!context) {
        throw new Error('Cannot use EventDispatcherContext without <AnalyticsProvider>');
    }

    return context;
};

export default useEventDispatcherContext;
