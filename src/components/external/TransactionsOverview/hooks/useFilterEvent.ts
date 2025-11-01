import { useMemo } from 'preact/hooks';
import { FilterType, MixpanelProperty } from '../../../../core/Analytics/analytics/user-events';
import useAnalyticsContext from '../../../../core/Context/analytics/useAnalyticsContext';

export interface UseFilterEventProps {
    category?: string;
    label?: FilterType;
}

const useFilterEvent = ({ category, label }: UseFilterEventProps) => {
    const analytics = useAnalyticsContext();

    const logEvent = useMemo(() => {
        if (category && label) {
            const defaultPayload = { actionType: 'reset', category, label } as const;

            return (actionType: 'reset' | 'update', value?: MixpanelProperty) => {
                try {
                    analytics.addModifyFilterEvent?.({
                        ...defaultPayload,
                        ...(actionType === 'update' ? { value } : {}),
                    });
                } catch (e) {
                    console.error(e);
                }
            };
        }
    }, [analytics, category, label]);

    return { logEvent } as const;
};

export default useFilterEvent;
