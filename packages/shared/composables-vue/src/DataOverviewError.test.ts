/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { VNode } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { DataOverviewError } from './DataOverviewError';
import type { ErrorMessageInfo } from './getErrorMessage';

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('@adyen/bento-vue3', () => ({
    BentoEmptyState: { name: 'BentoEmptyState' },
}));

describe('DataOverviewError', () => {
    const i18n = {
        get: vi.fn((key: string, options?: { values?: { requestId?: string } }) =>
            options?.values?.requestId ? `${key}:${options.values.requestId}` : key
        ),
    };
    const refreshComponent = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({ i18n, refreshComponent } as unknown as ReturnType<typeof useCoreContext>);
    });

    const renderWithInfo = (errorInfo: ErrorMessageInfo, extraProps: Record<string, unknown> = {}) => {
        const component = DataOverviewError as unknown as {
            setup: (props: Record<string, unknown>) => () => VNode;
        };
        return component.setup({
            copyIcon: undefined,
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
            title: 'common.errors.somethingWentWrong',
            messages: ['common.errors.errorCode', 'common.errors.retry'],
            requestId: 'REQUEST-1',
            refreshComponent: true,
            onContactSupport,
        });

        const rendered = view();
        const description = (rendered.children as { default: () => VNode[] }).default();

        expect(rendered.props?.title).toBe('common.errors.somethingWentWrong');
        expect(rendered.props?.action).toMatchObject({
            title: 'common.actions.contactSupport.labels.reachOut',
            variant: 'primary',
        });
        rendered.props?.action.event();
        expect(onContactSupport).toHaveBeenCalledOnce();
        expect(refreshComponent).not.toHaveBeenCalled();
        expect(description.map(node => (typeof node === 'object' ? node.children : node))).toContain('common.errors.errorCode:REQUEST-1');
    });

    test('uses the current component refresh action when requested', () => {
        const refreshIcon = {};
        const view = renderWithInfo(
            {
                messages: ['common.errors.retry'],
                refreshComponent: true,
            },
            { refreshIcon }
        );

        const action = view().props?.action;
        expect(action).toMatchObject({
            title: 'common.actions.refresh.labels.default',
            icon: refreshIcon,
            variant: 'primary',
        });

        action.event();
        expect(refreshComponent).toHaveBeenCalledOnce();
    });

    test('copies the request ID and updates the accessible action state', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText },
        });
        const view = renderWithInfo({
            messages: ['common.errors.errorCode'],
            requestId: 'REQUEST-2',
        });

        const action = view().props?.action;
        expect(action).toMatchObject({
            title: 'common.actions.copy.labels.errorCode',
            variant: 'secondary',
        });

        await action.event();

        expect(writeText).toHaveBeenCalledWith('REQUEST-2');
        expect(view().props?.action.title).toBe('common.actions.copy.labels.done');
    });
});
