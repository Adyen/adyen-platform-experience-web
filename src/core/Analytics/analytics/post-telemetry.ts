import { httpPost } from '../../Http/http';
import { LogConfig } from './types';

/**
 * Log event to Adyen
 * @param config -
 */
const logTelemetry = (config: LogConfig) => (event: Record<string, any>) => {
    const options = {
        errorLevel: 'silent' as const,
        loadingContext: config.loadingContext,
        path: `v2/analytics/log`,
    };

    const telemetryEvent = {
        version: process.env.VERSION,
        channel: 'Web',
        locale: config.locale,
        flavor: 'components',
        userAgent: navigator.userAgent,
        referrer: window.location.href,
        screenWidth: window.screen.width,
        ...event,
    };

    return httpPost({ ...options, body: telemetryEvent });
};

export default logTelemetry;
