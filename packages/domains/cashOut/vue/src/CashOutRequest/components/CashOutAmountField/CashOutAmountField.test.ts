/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import CashOutAmountField from './CashOutAmountField.vue';

const MAX_AMOUNT = { value: 22000, currency: 'USD' };

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h, ref } = await import('vue');

    return {
        BentoInputField: defineComponent({
            props: { disabled: Boolean, errorMessage: { type: String, default: undefined }, modelValue: { type: String, default: '' } },
            emits: ['blur', 'update:model-value'],
            setup(props, { emit, expose, slots }) {
                const inputFieldElement = ref<HTMLInputElement>();
                expose({ inputFieldElement });

                return () =>
                    h('div', [
                        h('input', {
                            ref: inputFieldElement,
                            disabled: props.disabled,
                            value: props.modelValue,
                            onBlur: () => emit('blur'),
                            onInput: (event: Event) => emit('update:model-value', (event.target as HTMLInputElement).value),
                        }),
                        h('span', { 'data-testid': 'static-value' }, slots.staticValue?.() as never),
                        props.errorMessage ? h('span', { 'data-testid': 'error' }, props.errorMessage) : null,
                    ]);
            },
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

const renderAmountField = ({ amount, disabled = false }: { amount: number | undefined; disabled?: boolean }) => {
    const model = ref(amount);
    const target = document.createElement('div');
    const app = createApp(
        defineComponent({
            setup: () => () =>
                h(CashOutAmountField, {
                    disabled,
                    maxAmount: MAX_AMOUNT,
                    modelValue: model.value,
                    'onUpdate:modelValue': (value: number | undefined) => (model.value = value),
                }),
        })
    );
    app.mount(target);

    const input = target.querySelector('input')!;
    const type = async (value: string) => {
        input.value = value;
        input.dispatchEvent(new Event('input'));
        await nextTick();
    };
    // A number input reports an unfinished number, like "434." or "-", as an empty value with `validity.badInput`.
    const typeIncompleteNumber = async () => {
        Object.defineProperty(input, 'validity', { configurable: true, value: { badInput: true } });
        await type('');
    };
    const blur = async () => {
        input.dispatchEvent(new Event('blur'));
        await nextTick();
    };
    const error = () => target.querySelector('[data-testid="error"]')?.textContent;

    return { blur, error, input, model, target, type, typeIncompleteNumber, unmount: () => app.unmount() };
};

describe('CashOutAmountField', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: {
                amount: (value: number, currency: string) => `${value} ${currency}`,
                get: (key: string, options?: { values?: Record<string, string> }) => (options?.values ? `${key} ${options.values.amount}` : key),
                locale: 'en-US',
            },
        } as unknown as ReturnType<typeof useCoreContext>);
    });

    test('should show the amount in major units with its currency', () => {
        const { input, target, unmount } = renderAmountField({ amount: MAX_AMOUNT.value });

        expect(input.value).toBe('220.00');
        expect(target.querySelector('[data-testid="static-value"]')?.textContent).toBe('USD');

        unmount();
    });

    test('should update the amount in minor units', async () => {
        const { error, model, type, unmount } = renderAmountField({ amount: MAX_AMOUNT.value });

        await type('12.34');

        expect(model.value).toBe(1234);
        expect(error()).toBeUndefined();

        unmount();
    });

    test('should accept the whole available amount', async () => {
        const { error, model, type, unmount } = renderAmountField({ amount: 100 });

        await type('220');

        expect(model.value).toBe(MAX_AMOUNT.value);
        expect(error()).toBeUndefined();

        unmount();
    });

    test('should clear the amount and show an error when the amount is above the available amount', async () => {
        const { error, model, type, unmount } = renderAmountField({ amount: MAX_AMOUNT.value });

        await type('220.01');

        expect(model.value).toBeUndefined();
        expect(error()).toBe('cashOut.request.fields.amount.errors.excess 22000 USD USD');

        unmount();
    });

    test('should clear the amount and show an error when the amount is 0', async () => {
        const { error, model, type, unmount } = renderAmountField({ amount: MAX_AMOUNT.value });

        await type('0');

        expect(model.value).toBeUndefined();
        expect(error()).toBe('cashOut.request.fields.amount.errors.positive');

        unmount();
    });

    test('should clear the amount and show an error when the amount is empty', async () => {
        const { error, model, type, unmount } = renderAmountField({ amount: MAX_AMOUNT.value });

        await type('');

        expect(model.value).toBeUndefined();
        expect(error()).toBe('cashOut.request.fields.amount.errors.required');

        unmount();
    });

    test('should drop digits beyond the currency decimals', async () => {
        const { error, input, model, type, unmount } = renderAmountField({ amount: MAX_AMOUNT.value });

        await type('12.34');
        await type('12.345');

        expect(input.value).toBe('12.34');
        expect(model.value).toBe(1234);
        expect(error()).toBeUndefined();

        unmount();
    });

    test('should keep the amount without an error while a number is incomplete', async () => {
        const { error, model, type, typeIncompleteNumber, unmount } = renderAmountField({ amount: MAX_AMOUNT.value });

        await type('43');
        await typeIncompleteNumber();

        expect(model.value).toBe(4300);
        expect(error()).toBeUndefined();

        unmount();
    });

    test('should clear the amount and show an error when leaving an incomplete number', async () => {
        const { blur, error, model, typeIncompleteNumber, unmount } = renderAmountField({ amount: MAX_AMOUNT.value });

        await typeIncompleteNumber();
        await blur();

        expect(model.value).toBeUndefined();
        expect(error()).toBe('cashOut.request.fields.amount.errors.required');

        unmount();
    });

    test('should not show an error when leaving a valid amount', async () => {
        const { blur, error, model, type, unmount } = renderAmountField({ amount: MAX_AMOUNT.value });

        await type('12.34');
        await blur();

        expect(model.value).toBe(1234);
        expect(error()).toBeUndefined();

        unmount();
    });

    test('should be empty and disabled without an amount to cash out', () => {
        const { error, input, unmount } = renderAmountField({ amount: undefined, disabled: true });

        expect(input.value).toBe('');
        expect(input.disabled).toBe(true);
        expect(error()).toBeUndefined();

        unmount();
    });
});
