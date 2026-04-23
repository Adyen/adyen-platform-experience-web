import { useCallback } from 'preact/hooks';
import { useConfigContext } from '../ConfigContext';
import useMutation from '../useMutation/useMutation';
import { EmbeddedEventItem } from '../../Analytics/analytics/user-events';
import { encodeAnalyticsEvent } from '../../Analytics/analytics/utils';
import type { ExternalComponentType } from '@integration-components/types';
import { EMPTY_OBJECT } from '@integration-components/utils';

export const usePushAnalyticEvent = () => {
    const { sendTrackEvent } = useConfigContext().endpoints;

    const { mutate: sendAnalytics } = useMutation({
        queryFn: sendTrackEvent,
    });

    const track = useCallback(
        (options: URLSearchParams, componentName?: ExternalComponentType) =>
            sendAnalytics?.(
                {
                    body: options.toString(),
                    contentType: 'application/x-www-form-urlencoded',
                    keepalive: true,
                },
                {
                    ...(componentName
                        ? {
                            query: {
                                component: componentName,
                            },
                        }
                        : EMPTY_OBJECT),
                }
            ),
        [sendAnalytics]
    );

    return useCallback(
        (options: EmbeddedEventItem) => {
            const componentName = options.properties.componentName as ExternalComponentType;
            const data = encodeAnalyticsEvent(options);
            if (data) {
                track(data, componentName);
            }
        },
        [track]
    );
};
