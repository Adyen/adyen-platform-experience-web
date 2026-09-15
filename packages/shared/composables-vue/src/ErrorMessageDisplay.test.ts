/**
 * @vitest-environment jsdom
 */
import { createApp } from 'vue';
import type { VNode } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useCoreContext } from '@integration-components/core/vue';
import { DataOverviewError } from './DataOverviewError';
import { ErrorMessageDisplay } from './ErrorMessageDisplay';
import type { ErrorMessageInfo } from './getErrorMessage';

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    return {
        BentoButton: { name: 'BentoButton' },
        BentoTypography: { name: 'BentoTypography' },
        BentoEmptyState: (props: { image?: string }) => h('div', { 'data-image': props.image }),
    };
});
vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

test('does not pass an image to data overview errors when illustrations are hidden globally', () => {
    vi.mocked(useCoreContext).mockReturnValue({
        i18n: { get: vi.fn() } as unknown as ReturnType<typeof useCoreContext>['i18n'],
        appearance: { illustrations: 'hidden' },
    });

    const target = document.createElement('div');
    const app = createApp(DataOverviewError, { errorInfo: { messages: [] } });
    app.mount(target);

    expect(target.firstElementChild?.getAttribute('data-image')).toBeNull();

    app.unmount();
});

test('does not render illustrations when they are hidden globally', () => {
    const getImageAsset = vi.fn(() => 'default-image.svg');
    vi.mocked(useCoreContext).mockReturnValue({
        i18n: { get: vi.fn() } as unknown as ReturnType<typeof useCoreContext>['i18n'],
        appearance: { illustrations: 'hidden' },
        getImageAsset,
    });

    const target = document.createElement('div');
    const app = createApp(ErrorMessageDisplay, { errorInfo: { messages: [] }, withImage: true });
    app.mount(target);

    expect(target.querySelector('picture')).toBeNull();
    expect(target.querySelector('img')).toBeNull();
    expect(getImageAsset).not.toHaveBeenCalled();

    app.unmount();
});

describe('ErrorMessageDisplay', () => {
    const i18n = {
        get: vi.fn((key: string, options?: { values?: { requestId?: string } }) =>
            options?.values?.requestId ? `${key}:${options.values.requestId}` : key
        ),
    };
    const refreshComponent = vi.fn();
    const getImageAsset = vi.fn(({ subFolder }: { subFolder?: string }) => (subFolder ? 'small-default.svg' : 'default.svg'));

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n,
            refreshComponent,
            getImageAsset,
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

    test('renders translated title and messages with the request ID', () => {
        const view = renderWithInfo({
            title: 'common.errors.somethingWentWrong',
            messages: ['common.errors.errorCode', 'common.errors.retry'],
            requestId: 'REQUEST-1',
        });

        const children = view().children as VNode[];
        const title = children[1]!;
        const message = children[2]!;

        expect((title.children as { default: () => string }).default()).toBe('common.errors.somethingWentWrong');
        expect((message.children as { default: () => (VNode | string)[] }).default()).toEqual(
            expect.arrayContaining(['common.errors.errorCode:REQUEST-1', 'common.errors.retry:REQUEST-1'])
        );
    });

    test('uses explicit responsive images and falls back to SDK assets', () => {
        const view = renderWithInfo(
            { messages: [] },
            {
                imageDesktop: 'desktop.svg',
                withImage: true,
            }
        );

        const illustration = (view().children as VNode[])[0]!;
        const picture = (illustration.children as VNode[])[0]!;
        const [desktopSource, mobileSource, image] = picture.children as VNode[];

        expect(desktopSource!.props?.srcset).toBe('desktop.svg');
        expect(mobileSource!.props?.srcset).toBe('small-default.svg');
        expect(image!.props).toMatchObject({ src: 'desktop.svg', alt: '' });
        expect(getImageAsset).toHaveBeenCalledWith({ name: 'wrong-environment', subFolder: 'images/small' });
    });

    test('renders dismiss and support actions, with support taking precedence over refresh', () => {
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

        const buttonsContainer = (view().children as VNode[])[3]!;
        const [dismissButton, supportButton] = buttonsContainer.children as VNode[];

        expect((dismissButton!.children as { default: () => string }).default()).toBe('common.actions.close');
        expect((supportButton!.children as { default: () => string }).default()).toBe('common.actions.contactSupport.labels.reachOut');

        dismissButton!.props?.onClick();
        supportButton!.props?.onClick();

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

        const buttonsContainer = (view().children as VNode[])[3]!;
        const [refreshButton] = buttonsContainer.children as VNode[];
        refreshButton!.props?.onClick();

        expect(onRefresh).toHaveBeenCalledOnce();
        expect(refreshComponent).not.toHaveBeenCalled();
    });
});
