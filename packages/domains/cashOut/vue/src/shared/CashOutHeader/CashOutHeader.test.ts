/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import CashOutHeader from './CashOutHeader.vue';

const TITLE = 'cashOut.request.title';
const OPTIONS = [
    { label: 'Main', value: 'BA1' },
    { label: 'Secondary', value: 'BA2' },
];

const selector: { options?: unknown; select?: (value: string) => void } = {};

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    return {
        BentoHeader: (props: { title: string }) => h('h2', props.title),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('../BalanceAccountSelector/BalanceAccountSelector.vue', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        default: defineComponent({
            props: { modelValue: { type: String, default: undefined }, options: { type: Array, required: true } },
            emits: ['update:modelValue'],
            setup(props, { emit }) {
                selector.select = value => emit('update:modelValue', value);
                return () => {
                    selector.options = props.options;
                    return h('div', { 'data-testid': 'selector' }, props.modelValue);
                };
            },
        }),
    };
});

const renderHeader = ({ hideTitle = false } = {}) => {
    const selected = ref<string | undefined>('BA1');
    const target = document.createElement('div');
    const app = createApp({
        setup: () => () =>
            h(CashOutHeader, {
                balanceAccountOptions: OPTIONS,
                hideTitle,
                titleKey: TITLE,
                selectedBalanceAccountId: selected.value,
                'onUpdate:selectedBalanceAccountId': (value: string | undefined) => (selected.value = value),
            }),
    });
    app.mount(target);
    return { selected, target, unmount: () => app.unmount() };
};

describe('CashOutHeader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        selector.options = undefined;
        vi.mocked(useCoreContext).mockReturnValue({ i18n: { get: (key: string) => key } } as unknown as ReturnType<typeof useCoreContext>);
    });

    test('should show the title and the balance account selector', () => {
        const { target, unmount } = renderHeader();

        expect(target.querySelector('h2')?.textContent).toBe(TITLE);
        expect(target.querySelector('[data-testid="selector"]')?.textContent).toBe('BA1');
        expect(selector.options).toEqual(OPTIONS);

        unmount();
    });

    test('should keep the balance account selector when the title is hidden', () => {
        const { target, unmount } = renderHeader({ hideTitle: true });

        expect(target.querySelector('h2')).toBeNull();
        expect(target.querySelector('[data-testid="selector"]')?.textContent).toBe('BA1');

        unmount();
    });

    test.each([
        ['with the title', false],
        ['without the title', true],
    ])('should select the balance account chosen in the selector %s', (_, hideTitle) => {
        const { selected, unmount } = renderHeader({ hideTitle });

        selector.select?.('BA2');

        expect(selected.value).toBe('BA2');

        unmount();
    });
});
