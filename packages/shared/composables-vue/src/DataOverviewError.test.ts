/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp } from 'vue';
import type { VNode } from 'vue';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { DataOverviewError } from './DataOverviewError';
import type { ErrorMessageInfo } from '@integration-components/core/vue';

vi.mock('@integration-components/core/vue', async () => {
    const { computed } = await import('vue');
    const useCoreContext = vi.fn();
    const useConfigContext = vi.fn(() => ({ hasError: false }));

    return {
        getSafeDomainTranslationKey: (domain: string, key: string) => `${domain}.${key}`,
        getErrorMessage: vi.fn(),
        useCoreContext,
        useConfigContext,
        useShouldHideIllustrations: () => {
            const coreContext = useCoreContext() as { appearance?: { illustrations?: string } };
            return computed(() => coreContext.appearance?.illustrations === 'hidden');
        },
    };
});

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    return {
        BentoEmptyState: (props: { image?: string }) => h('div', { 'data-image': props.image }),
    };
});

test('does not pass an image to data overview errors when illustrations are hidden globally', () => {
    vi.mocked(useCoreContext).mockReturnValue({
        i18n: { get: vi.fn() } as unknown as ReturnType<typeof useCoreContext>['i18n'],
        appearance: { illustrations: 'hidden' },
        translationDomain: 'transactions',
    });

    const target = document.createElement('div');
    const app = createApp(DataOverviewError, { errorInfo: { messages: [] } });
    app.mount(target);

    expect(target.firstElementChild?.getAttribute('data-image')).toBeNull();

    app.unmount();
});

describe('DataOverviewError', () => {
    const i18n = {
        get: vi.fn((key: string, options?: { values?: { requestId?: string } }) =>
            options?.values?.requestId ? `${key}:${options.values.requestId}` : key
        ),
    };
    const refreshComponent = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({ i18n, refreshComponent, translationDomain: 'transactions' } as unknown as ReturnType<
            typeof useCoreContext
        >);
        vi.mocked(useConfigContext).mockReturnValue({ hasError: false } as unknown as ReturnType<typeof useConfigContext>);
    });

    const renderWithInfo = (errorInfo: ErrorMessageInfo, extraProps: Record<string, unknown> = {}) => {
        const component = DataOverviewError as unknown as {
            setup: (props: Record<string, unknown>) => () => VNode;
        };
        return component.setup({
            error: undefined,
            errorInfo,
            errorMessage: undefined,
            image: 'wrong-environment',
            notFoundMessage: undefined,
            onContactSupport: undefined,
            refreshIcon: undefined,
            variant: 'embedded',
            ...extraProps,
        });
    };

    test('translates the error and prioritizes its contact-support action', () => {
        const onContactSupport = vi.fn();
        const view = renderWithInfo({
            title: 'transactions.common.errors.somethingWentWrong',
            messages: ['transactions.common.errors.errorCode', 'transactions.common.errors.retry'],
            requestId: 'REQUEST-1',
            refreshComponent: true,
            onContactSupport,
        });

        const rendered = view();
        const description = (rendered.children as { default: () => VNode[] }).default();

        expect(rendered.props?.title).toBe('transactions.common.errors.somethingWentWrong');
        expect(rendered.props?.action).toMatchObject({
            title: 'transactions.common.contactSupport.label',
            variant: 'primary',
        });
        rendered.props?.action.event();
        expect(onContactSupport).toHaveBeenCalledOnce();
        expect(refreshComponent).not.toHaveBeenCalled();
        expect(description.map(node => (typeof node === 'object' ? node.children : node))).toContain(
            'transactions.common.errors.errorCode:REQUEST-1'
        );
    });

    test('uses the current component refresh action when requested', () => {
        const refreshIcon = {};
        const view = renderWithInfo(
            {
                messages: ['transactions.common.errors.retry'],
                refreshComponent: true,
            },
            { refreshIcon }
        );

        const action = view().props?.action;
        expect(action).toMatchObject({
            title: 'transactions.common.refresh.label',
            icon: refreshIcon,
            variant: 'primary',
        });

        action.event();
        expect(refreshComponent).toHaveBeenCalledOnce();
    });

    test('re-fetches the data through onRefresh when it is provided', () => {
        const onRefresh = vi.fn();
        const view = renderWithInfo(
            {
                messages: ['transactions.common.errors.retry'],
                refreshComponent: true,
            },
            { onRefresh }
        );

        const action = view().props?.action;
        expect(action).toMatchObject({
            title: 'transactions.common.refresh.label',
            variant: 'primary',
        });

        action.event();
        expect(onRefresh).toHaveBeenCalledOnce();
        expect(refreshComponent).not.toHaveBeenCalled();
    });

    test('falls back to remounting the component when the config session is in an error state', () => {
        vi.mocked(useConfigContext).mockReturnValue({ hasError: true } as unknown as ReturnType<typeof useConfigContext>);
        const onRefresh = vi.fn();
        const view = renderWithInfo(
            {
                messages: ['transactions.common.errors.retry'],
                refreshComponent: true,
            },
            { onRefresh }
        );

        view().props?.action.event();

        expect(refreshComponent).toHaveBeenCalledOnce();
        expect(onRefresh).not.toHaveBeenCalled();
    });

    test('falls back to remounting the component when the config session errors after the error state renders', () => {
        const configContext = { hasError: false };
        vi.mocked(useConfigContext).mockReturnValue(configContext as unknown as ReturnType<typeof useConfigContext>);
        const onRefresh = vi.fn();
        const view = renderWithInfo(
            {
                messages: ['transactions.common.errors.retry'],
                refreshComponent: true,
            },
            { onRefresh }
        );

        const action = view().props?.action;
        configContext.hasError = true; // e.g. the session refresh triggered by the failing request fails afterwards

        action.event();

        expect(refreshComponent).toHaveBeenCalledOnce();
        expect(onRefresh).not.toHaveBeenCalled();
    });

    test('does not offer an action when the error has only a request ID', () => {
        const view = renderWithInfo({
            messages: ['transactions.common.errors.errorCode'],
            requestId: 'REQUEST-2',
        });

        expect(view().props?.action).toBeUndefined();
    });
});
