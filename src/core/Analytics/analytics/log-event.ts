import { LogConfig } from './types';

/**
 * Log event to Adyen
 * @param config - ready to be serialized and included in the request
 * @returns A log event function
 */
const logEvent = (config: LogConfig) => (event: Record<string, any>) => {
    const params: Record<string, any> = {
        version: process.env.VERSION,
        payload_version: 1,
        platform: 'web',
        locale: config.locale,
        ...event,
    };

    const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    new Image().src = `${config.loadingContext}images/analytics.png?${queryString}`;
};

export default logEvent;
