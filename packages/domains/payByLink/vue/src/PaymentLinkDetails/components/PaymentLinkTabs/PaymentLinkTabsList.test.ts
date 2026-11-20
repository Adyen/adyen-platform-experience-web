// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, type App } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import PaymentLinkTabsList from './PaymentLinkTabsList.vue';

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    const passthrough = (tag: string) =>
        defineComponent({
            setup:
                (_props, { slots, attrs }) =>
                () =>
                    h(tag, attrs, slots.default?.()),
        });
    return {
        BentoButton: passthrough('button'),
        BentoLink: passthrough('a'),
        BentoStructuredList: passthrough('dl'),
        BentoStructuredListItem: passthrough('div'),
        BentoTooltipDirective: {},
        BentoTypography: passthrough('span'),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
    getSafeDomainTranslationKey: (domain: string, key: string) => `${domain}.${key}`,
}));

vi.mock('@integration-components/payByLink/domain', () => ({
    BACKEND_REDACTED_DATA_MARKER: '*****',
    FRONTEND_REDACTED_DATA_MARKER: '-',
}));

const ITEMS = [
    {
        key: 'payByLink.details.shopper.email',
        value: 'shopper@example.com',
        isCopyable: true,
        copyAriaLabelKey: 'payByLink.details.copy.shopperEmail',
    },
    {
        key: 'payByLink.details.shopper.phone',
        value: '+31000000000',
        isCopyable: true,
        copyAriaLabelKey: 'payByLink.details.copy.shopperPhone',
    },
    {
        key: 'payByLink.details.shippingAddress.city',
        value: 'Amsterdam',
        isCopyable: true,
        copyAriaLabelKey: 'payByLink.details.copy.shippingAddressCity',
    },
] as never[];

describe('PaymentLinkTabsList copy buttons', () => {
    let app: App | undefined;
    let target: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key, locale: 'en-US' },
            translationDomain: 'payByLink',
        } as unknown as ReturnType<typeof useCoreContext>);
        target = document.createElement('div');
        document.body.appendChild(target);
    });

    afterEach(() => {
        app?.unmount();
        target.remove();
    });

    test('should give every copy button in the list its own accessible name', () => {
        app = createApp(() => h(PaymentLinkTabsList, { items: ITEMS }));
        app.mount(target);

        const names = [...target.querySelectorAll('button')].map(button => button.getAttribute('aria-label')).filter(Boolean);

        expect(names).toHaveLength(ITEMS.length);
        expect(new Set(names).size).toBe(ITEMS.length);
    });
});
