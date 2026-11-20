// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, type App } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { CopyText } from './CopyText';

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        BentoButton: defineComponent({
            setup:
                (_props, { slots, attrs }) =>
                () =>
                    h('button', attrs, slots.iconRight?.()),
        }),
        BentoTooltipDirective: {},
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
    getSafeDomainTranslationKey: (domain: string, key: string) => `${domain}.${key}`,
}));

const TEXT = 'copy-me';
const DONE_KEY = 'transactions.common.copy.done';

describe('CopyText', () => {
    let app: App | undefined;
    let target: HTMLDivElement;

    const setClipboard = (clipboard: Partial<Clipboard> | undefined) => {
        Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true });
    };

    const mount = (props: Record<string, unknown> = {}) => {
        app = createApp(() => h(CopyText, { textToCopy: TEXT, ...props }));
        app.mount(target);
    };

    const clickCopyAndSettle = async () => {
        target.querySelector('button')?.click();
        await nextTick();
        await nextTick();
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key, locale: 'en-US' },
            translationDomain: 'transactions',
        } as unknown as ReturnType<typeof useCoreContext>);
        target = document.createElement('div');
        document.body.appendChild(target);
    });

    afterEach(() => {
        app?.unmount();
        target.remove();
    });

    describe('Accessible name', () => {
        test('should fall back to the domain copy label when no key is given', () => {
            mount();

            expect(target.querySelector('button')?.getAttribute('aria-label')).toBe('transactions.common.copy.label');
        });

        test('should prefer the given key over the domain fallback', () => {
            mount({ copyButtonAriaLabelKey: 'transactions.details.copy.pspReference' });

            expect(target.querySelector('button')?.getAttribute('aria-label')).toBe('transactions.details.copy.pspReference');
        });

        test('should give sibling instances distinct names when each is given its own key', () => {
            app = createApp(() =>
                h('div', [
                    h(CopyText, { textToCopy: 'a', copyButtonAriaLabelKey: 'transactions.details.copy.pspReference' }),
                    h(CopyText, { textToCopy: 'b', copyButtonAriaLabelKey: 'transactions.details.copy.merchantReference' }),
                ])
            );
            app.mount(target);

            const names = [...target.querySelectorAll('button')].map(button => button.getAttribute('aria-label'));

            expect(new Set(names).size).toBe(2);
        });
    });

    describe('Copy feedback', () => {
        test('should announce success once the text is copied', async () => {
            const writeText = vi.fn().mockResolvedValue(undefined);
            setClipboard({ writeText });
            mount();

            await clickCopyAndSettle();

            expect(writeText).toHaveBeenCalledWith(TEXT);
            expect(target.textContent).toContain(DONE_KEY);
        });

        test('should not announce success when the clipboard is unavailable', async () => {
            setClipboard(undefined);
            mount();

            await clickCopyAndSettle();

            expect(target.textContent).not.toContain(DONE_KEY);
        });

        test('should not announce success when the clipboard write is rejected', async () => {
            setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });
            mount();

            await clickCopyAndSettle();

            expect(target.textContent).not.toContain(DONE_KEY);
        });

        test('should not run the copy callback when the clipboard write is rejected', async () => {
            const onCopyText = vi.fn();
            setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });
            mount({ onCopyText });

            await clickCopyAndSettle();

            expect(onCopyText).not.toHaveBeenCalled();
        });
    });
});
