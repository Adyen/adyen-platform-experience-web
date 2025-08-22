import { useCallback } from 'preact/hooks';
import { useConfigContext } from '../../core/ConfigContext';
import useMutation from '../useMutation/useMutation';

export const usePushAnalyticEvent = () => {
    const { sendMixpanelEvent } = useConfigContext().endpoints;

    const { mutate: sendAnalytics } = useMutation({
        queryFn: sendMixpanelEvent,
    });

    const track = useCallback(
        (options: any) =>
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

    return (options: any) => {
        const formattedOptions = JSON.stringify(options);
        const encodedData = window.btoa(formattedOptions);
        const data = new URLSearchParams();
        data.append('data', encodedData);
        track(data);
    };
};
