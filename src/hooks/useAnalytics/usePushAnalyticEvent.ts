import { useCallback } from 'preact/hooks';
import { useConfigContext } from '../../core/ConfigContext';
import useMutation from '../useMutation/useMutation';
import { EmbeddedEventItem } from './useAnalytics';
import { ExternalComponentType } from '../../components/types';

export const usePushAnalyticEvent = () => {
    const { sendTrackEvent } = useConfigContext().endpoints;

    const { mutate: sendAnalytics } = useMutation({
        queryFn: sendTrackEvent,
    });

    const track = useCallback(
        (options: URLSearchParams, componentName: ExternalComponentType) =>
            sendAnalytics?.(
                {
                    body: options.toString(),
                    contentType: 'application/x-www-form-urlencoded',
                },
                {
                    query: {
                        component: componentName,
                    },
                }
            ),
        [sendAnalytics]
    );

    return useCallback(
        (options: EmbeddedEventItem) => {
            const componentName = options.properties.componentName as ExternalComponentType;
            const formattedOptions = JSON.stringify(options);
            const encodedData = window.btoa(formattedOptions);
            const data = new URLSearchParams();
            data.set('data', encodedData);
            track(data, componentName);
        },
        [track]
    );
};
