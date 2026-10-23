/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { computed, createApp, h, nextTick, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useShouldHideTitles } from '@integration-components/composables-vue';
import type { ICashOutEligibility } from '@integration-components/types';
import CashOutRequestModal from './CashOutRequestModal.vue';

const TITLE = 'cashOut.request.title';
const ELIGIBILITY = { isCashoutAvailable: true } as unknown as ICashOutEligibility;

const requestProps: { current?: Record<string, unknown> } = {};

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');

    return {
        BentoModal: defineComponent({
            props: { isOpen: Boolean },
            emits: ['close-modal'],
            setup(props, { emit, slots }) {
                return () =>
                    props.isOpen
                        ? h('div', [
                              h('div', { 'data-testid': 'header' }, [
                                  slots.default?.(),
                                  h('button', { 'data-testid': 'close', onClick: () => emit('close-modal') }),
                              ]),
                              slots.content?.(),
                          ])
                        : null;
            },
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('@integration-components/composables-vue', () => ({
    useShouldHideTitles: vi.fn(),
}));

vi.mock('../../../CashOutRequest/components/CashOutRequest/CashOutRequest.vue', async () => {
    const { defineComponent, h } = await import('vue');

    return {
        default: defineComponent({
            props: {
                balanceAccountId: { type: String, default: undefined },
                eligibility: { type: Object, default: undefined },
                hideTitle: Boolean,
                onCashOutInstructed: { type: Function, default: undefined },
                onCashOutResult: { type: Function, default: undefined },
                onDismiss: { type: Function, default: undefined },
                onContactSupport: { type: Function, default: undefined },
            },
            setup(props) {
                return () => {
                    requestProps.current = { ...props };
                    return h('div', 'request');
                };
            },
        }),
    };
});

type ModalProps = { onCashOutInstructed?: () => void; onClose?: () => void; onContactSupport?: () => void };

const renderModal = ({ onCashOutInstructed = vi.fn(), onClose = vi.fn(), onContactSupport }: ModalProps = {}) => {
    const isOpen = ref(true);
    const target = document.createElement('div');
    const app = createApp({
        setup: () => () =>
            h(CashOutRequestModal, {
                balanceAccountId: 'BA1',
                eligibility: ELIGIBILITY,
                isOpen: isOpen.value,
                onCashOutInstructed,
                onClose,
                onContactSupport,
            }),
    });
    app.mount(target);

    const headerTitle = () => target.querySelector('[data-testid="header"]')?.textContent;
    const reportResult = (result: unknown) => (requestProps.current?.onCashOutResult as (result: unknown) => void)(result);

    return { headerTitle, isOpen, reportResult, target, unmount: () => app.unmount() };
};

describe('CashOutRequestModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        requestProps.current = undefined;
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key },
        } as unknown as ReturnType<typeof useCoreContext>);
        vi.mocked(useShouldHideTitles).mockReturnValue(computed(() => false));
    });

    test('should show the request of the selected balance account', () => {
        const onCashOutInstructed = vi.fn();
        const onContactSupport = vi.fn();
        const { unmount } = renderModal({ onCashOutInstructed, onContactSupport });

        expect(requestProps.current).toMatchObject({ balanceAccountId: 'BA1', eligibility: ELIGIBILITY, onCashOutInstructed, onContactSupport });

        unmount();
    });

    // In the modal header, the title is on the same line as the close button.
    test('should show the title in the modal header instead of in the request', () => {
        const { headerTitle, unmount } = renderModal();

        expect(headerTitle()).toBe(TITLE);
        expect(requestProps.current?.hideTitle).toBe(true);

        unmount();
    });

    test('should not show the title when titles are hidden', () => {
        vi.mocked(useShouldHideTitles).mockReturnValue(computed(() => true));
        const { headerTitle, unmount } = renderModal();

        expect(headerTitle()).toBe('');

        unmount();
    });

    test('should remove the title once the request shows its result, and show it again when reopened', async () => {
        const { headerTitle, isOpen, reportResult, unmount } = renderModal();

        reportResult({ status: 'error' });
        await nextTick();
        expect(headerTitle()).toBe('');

        isOpen.value = false;
        await nextTick();
        isOpen.value = true;
        await nextTick();
        expect(headerTitle()).toBe(TITLE);

        unmount();
    });

    test('should leave closing to the close button of the modal, without a cancel button in the request', () => {
        const onClose = vi.fn();
        const { target, unmount } = renderModal({ onClose });

        expect(requestProps.current?.onDismiss).toBeUndefined();

        target.querySelector<HTMLButtonElement>('[data-testid="close"]')?.click();
        expect(onClose).toHaveBeenCalledTimes(1);

        unmount();
    });
});
