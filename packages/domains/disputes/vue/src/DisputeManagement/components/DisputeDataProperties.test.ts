// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, type App } from 'vue';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import DisputeDataProperties from './DisputeDataProperties.vue';

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
        BentoAlert: passthrough('div'),
        BentoButton: passthrough('button'),
        BentoLink: passthrough('a'),
        BentoStructuredList: passthrough('dl'),
        BentoStructuredListItem: passthrough('div'),
        BentoTag: passthrough('span'),
        BentoTooltipDirective: {},
        BentoTypography: passthrough('span'),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
    useConfigContext: vi.fn(),
    getSafeDomainTranslationKey: (domain: string, key: string) => `${domain}.${key}`,
}));

vi.mock('@integration-components/composables-vue/useTimezoneAwareDateFormatting', () => ({
    default: () => ({ dateFormat: (date: string) => date }),
}));

vi.mock('../composables/useDisputeFlow', () => ({
    useDisputeFlow: () => ({ defenseDocumentConfig: {} }),
}));

const COPYABLE_ITEMS = [
    { id: 'disputeId', label: 'disputes.management.details.fields.disputeReference', kind: 'text', value: 'DR-1' },
    { id: 'paymentPspReference', label: 'disputes.management.details.fields.paymentReference', kind: 'text', value: 'PSP-2' },
    { id: 'paymentMerchantReference', label: 'disputes.management.details.fields.merchantReference', kind: 'text', value: 'MR-3' },
] as const;

vi.mock('@integration-components/disputes/domain', () => ({
    DISPUTE_DETAILS_FIELDS_REMAPS: {},
    DISPUTE_DETAILS_RESERVED_FIELDS_SET: new Set(),
    getDefenseDocumentContent: () => undefined,
    getDisputeDetailItems: () => COPYABLE_ITEMS.map(item => ({ ...item })),
}));

const DISPUTE = {
    dispute: { pspReference: 'PSP-2' },
    payment: { balanceAccount: { timeZone: 'UTC' } },
} as never;

describe('DisputeDataProperties copy buttons', () => {
    let app: App | undefined;
    let target: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key, locale: 'en-US' },
            translationDomain: 'disputes',
        } as unknown as ReturnType<typeof useCoreContext>);
        vi.mocked(useConfigContext).mockReturnValue({ endpoints: {} } as unknown as ReturnType<typeof useConfigContext>);
        target = document.createElement('div');
        document.body.appendChild(target);
    });

    afterEach(() => {
        app?.unmount();
        target.remove();
    });

    const mount = () => {
        app = createApp(() => h(DisputeDataProperties, { dispute: DISPUTE, defenseReasonConfig: {} }));
        app.mount(target);
    };

    const copyButtons = () => [...target.querySelectorAll('button')].filter(button => button.getAttribute('aria-label'));

    // jsdom defines no clipboard at all, so the property has to be installed rather than spied on.
    const setClipboard = (clipboard: Partial<Clipboard> | undefined) => {
        Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true });
    };

    const clickCopyAndSettle = async () => {
        copyButtons()[0]?.click();
        await nextTick();
        await nextTick();
    };

    test('should give each copy button its own accessible name', () => {
        mount();

        const names = copyButtons().map(button => button.getAttribute('aria-label'));

        expect(names).toHaveLength(COPYABLE_ITEMS.length);
        expect(new Set(names).size).toBe(COPYABLE_ITEMS.length);
    });

    test('should not announce success when the clipboard is unavailable', async () => {
        setClipboard(undefined);
        mount();

        await clickCopyAndSettle();

        expect(target.textContent).not.toContain('copy.labels.done');
    });

    test('should not announce success when the clipboard write is rejected', async () => {
        setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });
        mount();

        await clickCopyAndSettle();

        expect(target.textContent).not.toContain('copy.labels.done');
    });
});
