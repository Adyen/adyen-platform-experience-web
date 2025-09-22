import { useCallback } from 'preact/hooks';
import { useConfigContext } from '../../core/ConfigContext';
import useMutation from '../useMutation/useMutation';
import { EmbeddedEventItem } from './useAnalytics';

export const usePushAnalyticEvent = () => {
    const { sendUxdsEvent } = useConfigContext().endpoints;

    const { mutate: sendAnalytics } = useMutation({
        queryFn: sendUxdsEvent,
    });

    const track = useCallback(
        (options: URLSearchParams) =>
            sendAnalytics?.(
                {
                    body: options.toString(),
                    contentType: 'application/x-www-form-urlencoded',
                },
                {
                    path: { apipath: 'track' },
                }
            ),
        [sendAnalytics]
    );

    return useCallback(
        (options: EmbeddedEventItem) => {
            const formattedOptions = JSON.stringify(options);
            const encodedData = window.btoa(formattedOptions);
            const data = new URLSearchParams();
            data.set('data', encodedData);
            track(data);
        },
        [track]
    );
};
