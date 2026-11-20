/**
 * @vitest-environment jsdom
 */
import type { VNode } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ErrorIcon from '@adyen/ui-assets-icons-24/vue/cross-circle';
import { useCoreContext } from './Context';
import { ErrorMessageDisplay } from './ErrorMessageDisplay';
import styles from './ErrorMessageDisplay.module.scss';
import type { ErrorMessageInfo } from '../errors/domainErrorResolver';

vi.mock('@adyen/bento-vue3', () => ({
    BentoButton: { name: 'BentoButton' },
    BentoTypography: { name: 'BentoTypography' },
}));
vi.mock('./Context', () => ({
    useCoreContext: vi.fn(),
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
            translationDomain: 'transactions',
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
            error: undefined,
            errorInfo,
            errorMessage: undefined,
            notFoundMessage: undefined,
            onContactSupport: undefined,
            onRefresh: undefined,
            outlined: true,
            withBackground: true,
            withHeaderOffset: false,
            withErrorIcon: false,
            ...extraProps,
        });
    };

    test('renders translated title and messages with the request ID', () => {
        const view = renderWithInfo({
            title: 'transactions.common.errors.somethingWentWrong',
            messages: ['transactions.common.errors.errorCode', 'transactions.common.errors.retry'],
            requestId: 'REQUEST-1',
        });

        const children = view().children as VNode[];
        const title = children[1]!;
        const message = children[2]!;

        expect((title.children as { default: () => string }).default()).toBe('transactions.common.errors.somethingWentWrong');
        expect((message.children as { default: () => (VNode | string)[] }).default()).toEqual(
            expect.arrayContaining(['transactions.common.errors.errorCode:REQUEST-1', 'transactions.common.errors.retry:REQUEST-1'])
        );
    });

    test('renders the critical error icon when withErrorIcon is set', () => {
        const view = renderWithInfo({ messages: [] }, { withErrorIcon: true });
        const icon = (view().children as VNode[])[0]!;

        expect(icon.type).toBe(ErrorIcon);
        expect(icon.props).toMatchObject({ 'aria-hidden': 'true', class: styles.iconCritical });
    });

    test('does not render the error icon by default', () => {
        const view = renderWithInfo({ messages: [] });

        expect((view().children as VNode[])[0]).toBeNull();
    });

    test('renders only the support action when support takes precedence over refresh', () => {
        const onContactSupport = vi.fn();
        const view = renderWithInfo({
            messages: [],
            onContactSupport,
            refreshComponent: true,
        });

        const buttonsContainer = (view().children as VNode[])[3]!;
        const buttons = buttonsContainer.children as VNode[];
        const [supportButton] = buttons;

        expect(buttons).toHaveLength(1);
        expect((supportButton!.children as { default: () => string }).default()).toBe('transactions.common.contactSupport.label');

        supportButton!.props?.onClick();

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

        const buttonsContainer = (view().children as VNode[])[3]!;
        const [refreshButton] = buttonsContainer.children as VNode[];
        refreshButton!.props?.onClick();

        expect(onRefresh).toHaveBeenCalledOnce();
        expect(refreshComponent).not.toHaveBeenCalled();
    });
});
