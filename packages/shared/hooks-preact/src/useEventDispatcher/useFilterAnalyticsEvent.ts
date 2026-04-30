import { useMemo } from 'preact/hooks';
import { FilterType, MixpanelProperty } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';
import { useEventDispatcherContext } from '@integration-components/core/preact';

export interface UseFilterAnalyticsEventProps {
    category?: string;
    subCategory?: string;
    label?: FilterType;
}

const useFilterAnalyticsEvent = ({ category, label, subCategory }: UseFilterAnalyticsEventProps) => {
    const analytics = useEventDispatcherContext();

    const logEvent = useMemo(() => {
        if (category && label) {
            const defaultPayload = {
                ...(subCategory && { subCategory }),
                actionType: 'reset',
                category,
                label,
            } as const;

            return (actionType: 'reset' | 'update', value?: MixpanelProperty) => {
                try {
                    analytics.addModifyFilterEvent?.({
                        ...defaultPayload,
                        ...(actionType === 'update' ? { actionType, value } : {}),
                    });
                } catch (err) {
                    console.error(err);
                }
            };
        }
    }, [analytics, category, label, subCategory]);

    return { logEvent } as const;
};

export default useFilterAnalyticsEvent;
