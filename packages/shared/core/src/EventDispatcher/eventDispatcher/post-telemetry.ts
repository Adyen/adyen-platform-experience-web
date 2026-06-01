import { httpPost } from '../../Http/http';
import { LogConfig } from './types';
import { getCurrentUrl, getScreenWidth, getUserAgent } from '../../runtime';

/**
 * Log event to Adyen
 * @param config -
 */
const logTelemetry = (config: LogConfig) => (event: Record<string, any>) => {
    const options = {
        errorLevel: 'silent' as const,
        loadingContext: config.loadingContext,
        path: 'v2/analytics/log',
    };

    const telemetryEvent = {
        version: process.env.VERSION,
        channel: 'Web',
        locale: config.locale,
        flavor: 'components',
        userAgent: getUserAgent(),
        referrer: getCurrentUrl(),
        screenWidth: getScreenWidth(),
        ...event,
    };

    return httpPost({ ...options, body: telemetryEvent });
};

export default logTelemetry;
