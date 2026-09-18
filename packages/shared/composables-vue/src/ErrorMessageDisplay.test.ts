import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { VNode } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { ErrorMessageDisplay } from './ErrorMessageDisplay';
import type { ErrorMessageInfo } from './getErrorMessage';

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('@adyen/bento-vue3', () => ({
    BentoButton: { name: 'BentoButton' },
    BentoEmptyState: { name: 'BentoEmptyState' },
}));

describe('ErrorMessageDisplay', () => {
    const i18n = {
        get: vi.fn((key: string, options?: { values?: { requestId?: string } }) =>
            options?.values?.requestId ? `${key}:${options.values.requestId}` : key
        ),
    };
    const refreshComponent = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n,
            refreshComponent,
        } as unknown as ReturnType<typeof useCoreContext>);
    });

    const renderWithInfo = (errorInfo: ErrorMessageInfo, extraProps: Record<string, unknown> = {}) => {
        const component = ErrorMessageDisplay as unknown as {
            setup: (props: Record<string, unknown>) => () => VNode;
        };
        return component.setup({
            absolutePosition: true,
            centered: false,
            condensed: false,
            dismissLabel: undefined,
            error: undefined,
            errorInfo,
            errorMessage: undefined,
            imageDesktop: undefined,
            imageMobile: undefined,
            notFoundMessage: undefined,
            onContactSupport: undefined,
            onDismiss: undefined,
            onRefresh: undefined,
            outlined: true,
            withBackground: true,
            withHeaderOffset: false,
            withImage: false,
            ...extraProps,
        });
    };

    test('renders a Bento empty state with translated messages and the request ID', () => {
        const view = renderWithInfo({
            title: 'common.errors.somethingWentWrong',
            messages: ['common.errors.errorCode', 'common.errors.retry'],
            requestId: 'REQUEST-1',
        });

        const children = view().children as VNode[];
        const emptyState = children[0]!;
        const description = (emptyState.children as { default: () => (VNode | string)[] }).default();

        expect(emptyState.type).toMatchObject({ name: 'BentoEmptyState' });
        expect(emptyState.props).toMatchObject({
            title: 'common.errors.somethingWentWrong',
            variant: 'basic',
        });
        expect(description).toEqual(expect.arrayContaining(['common.errors.errorCode:REQUEST-1', 'common.errors.retry:REQUEST-1']));
    });

    test('maps custom illustrations to the Bento no-results illustration', () => {
        const view = renderWithInfo(
            { messages: [] },
            {
                imageDesktop: 'desktop.svg',
                withImage: true,
            }
        );

        const emptyState = (view().children as VNode[])[0]!;

        expect(emptyState.props).toMatchObject({
            image: 'no-results-found',
            variant: 'full-page',
        });
    });

    test('renders a dismiss action alongside the Bento support action, with support taking precedence over refresh', () => {
        const onDismiss = vi.fn();
        const onContactSupport = vi.fn();
        const view = renderWithInfo(
            {
                messages: [],
                onContactSupport,
                refreshComponent: true,
            },
            {
                dismissLabel: 'common.actions.close',
                onDismiss,
            }
        );

        const [emptyState, buttonsContainer] = view().children as VNode[];
        const dismissButton = buttonsContainer!;
        const supportAction = emptyState!.props?.action;

        expect((dismissButton.children as VNode[])[0]!.type).toMatchObject({ name: 'BentoButton' });
        expect(supportAction).toMatchObject({ title: 'common.actions.contactSupport.labels.reachOut' });

        (dismissButton.children as VNode[])[0]!.props?.onClick();
        supportAction.event();

        expect(onDismiss).toHaveBeenCalledOnce();
        expect(onContactSupport).toHaveBeenCalledOnce();
        expect(refreshComponent).not.toHaveBeenCalled();
    });

    test('prefers an explicit refresh callback over the provider callback', () => {
        const onRefresh = vi.fn();
        const view = renderWithInfo(
            {
                messages: [],
                refreshComponent: true,
            },
            { onRefresh }
        );

        const emptyState = (view().children as VNode[])[0]!;
        emptyState.props?.action.event();

        expect(onRefresh).toHaveBeenCalledOnce();
        expect(refreshComponent).not.toHaveBeenCalled();
    });
});
