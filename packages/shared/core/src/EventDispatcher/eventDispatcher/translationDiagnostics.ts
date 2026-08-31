import { encodeAnalyticsEvent, getEventInsertId, getEventTime } from './utils';
import { getUserAgent } from '../../runtime';
import type { TranslationDiagnostic } from '../../translation-contract';

export const getTranslationDiagnosticAnalyticsPayload = (diagnostic: TranslationDiagnostic): URLSearchParams | null => {
    return encodeAnalyticsEvent({
        event: 'Translation contract diagnostic',
        properties: {
            category: 'PIE',
            subCategory: 'Core',
            code: diagnostic.code,
            ...(diagnostic.domain && { domain: diagnostic.domain }),
            ...(diagnostic.publicKey && { publicKey: diagnostic.publicKey }),
            ...(diagnostic.targetKey && { targetKey: diagnostic.targetKey }),
            sdkVersion: process.env.SDK_VERSION,
            time: getEventTime(),
            userAgent: getUserAgent(),
            $insert_id: getEventInsertId(),
        },
    });
};
