/**
 * @vitest-environment jsdom
 */
import { createApp } from 'vue';
import { expect, test, vi } from 'vitest';
import { useCoreContext } from '@integration-components/core/vue';
import { DataOverviewError } from './DataOverviewError';
import { ErrorMessageDisplay } from './ErrorMessageDisplay';

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    return {
        BentoButton: 'button',
        BentoTypography: 'div',
        BentoEmptyState: (props: { image?: string }) => h('div', { 'data-image': props.image }),
    };
});
vi.mock('@integration-components/core/vue', () => ({ useCoreContext: vi.fn() }));

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
