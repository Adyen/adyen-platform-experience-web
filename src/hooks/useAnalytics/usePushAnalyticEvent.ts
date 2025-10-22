import { useCallback } from 'preact/hooks';
import { useConfigContext } from '../../core/ConfigContext';
import useMutation from '../useMutation/useMutation';
import { EmbeddedEventItem } from './useAnalytics';
import { ExternalComponentType } from '../../components/types';
import { EMPTY_OBJECT } from '../../utils';

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
            const componentName = (options.properties.componentName as ExternalComponentType) ?? '';
            const formattedOptions = JSON.stringify(options);
            const encodedData = window.btoa(formattedOptions);
            const data = new URLSearchParams();
            data.set('data', encodedData);
            track(data, componentName);
        },
        [track]
    );
};
