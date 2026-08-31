import { ref } from 'vue';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { ErrorMessageInfo } from './getErrorMessage';
import { useDataOverviewError } from './useDataOverviewError';

type TestKey =
    | 'domain.actions.contactSupport.labels.reachOut'
    | 'domain.actions.copy.labels.done'
    | 'domain.actions.copy.labels.errorCode'
    | 'domain.actions.refresh.labels.default'
    | 'domain.errors.contactSupport'
    | 'domain.errors.retry'
    | 'domain.errors.somethingWentWrong'
    | 'domain.errors.unavailable';

const ACTION_KEYS = {
    contactSupport: 'domain.actions.contactSupport.labels.reachOut',
    copyDone: 'domain.actions.copy.labels.done',
    copyErrorCode: 'domain.actions.copy.labels.errorCode',
    refresh: 'domain.actions.refresh.labels.default',
} as const;

describe('useDataOverviewError', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('resolves domain copy and delegates refresh behavior', async () => {
        const errorInfo = ref<ErrorMessageInfo<TestKey>>({
            messages: ['domain.errors.unavailable', 'domain.errors.retry'],
            refreshComponent: true,
            title: 'domain.errors.somethingWentWrong',
        });
        const onRefresh = vi.fn();
        const translations: Record<string, string> = {
            'domain.actions.refresh.labels.default': 'Refresh',
            'domain.errors.contactSupport': 'Contact support',
            'domain.errors.retry': 'Try again',
            'domain.errors.somethingWentWrong': 'Something went wrong',
            'domain.errors.unavailable': 'The domain is unavailable',
        };

        const { presentation } = useDataOverviewError<TestKey>({
            actionKeys: ACTION_KEYS,
            errorInfo,
            onRefresh,
            translate: key => translations[key] ?? key,
        });

        expect(presentation.value).toMatchObject({
            action: { title: 'Refresh', variant: 'primary' },
            messages: ['The domain is unavailable', 'Try again'],
            title: 'Something went wrong',
        });

        await presentation.value.action?.event();
        expect(onRefresh).toHaveBeenCalledOnce();
    });

    test('prefers a provided contact-support action over the domain default', async () => {
        const onContactSupport = vi.fn();
        const errorInfo = ref<ErrorMessageInfo<TestKey>>({
            contactSupportLabel: 'domain.actions.contactSupport.labels.reachOut',
            messages: ['domain.errors.unavailable'],
            onContactSupport,
            refreshComponent: true,
        });

        const { presentation } = useDataOverviewError<TestKey>({
            actionKeys: ACTION_KEYS,
            errorInfo,
            onRefresh: vi.fn(),
            translate: key => key,
        });

        expect(presentation.value.action?.title).toBe('domain.actions.contactSupport.labels.reachOut');
        await presentation.value.action?.event();
        expect(onContactSupport).toHaveBeenCalledOnce();
    });

    test('tracks copied state for the current request only', async () => {
        const writeText = vi.fn();
        vi.stubGlobal('navigator', { clipboard: { writeText } });
        const errorInfo = ref<ErrorMessageInfo<TestKey>>({
            messages: ['domain.errors.unavailable'],
            requestId: 'REQUEST_1',
        });
        const { presentation } = useDataOverviewError<TestKey>({
            actionKeys: ACTION_KEYS,
            errorInfo,
            translate: key => key,
        });

        expect(presentation.value.action?.title).toBe('domain.actions.copy.labels.errorCode');
        await presentation.value.action?.event();
        expect(writeText).toHaveBeenCalledWith('REQUEST_1');
        expect(presentation.value.action?.title).toBe('domain.actions.copy.labels.done');

        errorInfo.value = { messages: ['domain.errors.unavailable'], requestId: 'REQUEST_2' };
        expect(presentation.value.action?.title).toBe('domain.actions.copy.labels.errorCode');
    });
});
