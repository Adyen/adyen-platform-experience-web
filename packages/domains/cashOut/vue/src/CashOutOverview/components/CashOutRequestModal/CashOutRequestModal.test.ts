/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutEligibility } from '@integration-components/types';
import CashOutRequestModal from './CashOutRequestModal.vue';

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
                    props.isOpen ? h('div', [h('button', { 'data-testid': 'close', onClick: () => emit('close-modal') }), slots.content?.()]) : null;
            },
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

vi.mock('../../../CashOutRequest/components/CashOutRequest/CashOutRequest.vue', async () => {
    const { defineComponent, h } = await import('vue');

    return {
        default: defineComponent({
            props: {
                balanceAccountId: { type: String, default: undefined },
                eligibility: { type: Object, default: undefined },
                hideTitle: Boolean,
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

const renderModal = ({ onClose = vi.fn(), onContactSupport }: { onClose?: () => void; onContactSupport?: () => void } = {}) => {
    const target = document.createElement('div');
    const app = createApp(CashOutRequestModal, { balanceAccountId: 'BA1', eligibility: ELIGIBILITY, isOpen: true, onClose, onContactSupport });
    app.mount(target);
    return { target, unmount: () => app.unmount() };
};

describe('CashOutRequestModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        requestProps.current = undefined;
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key },
        } as unknown as ReturnType<typeof useCoreContext>);
    });

    test('should show the request of the selected balance account without its title', () => {
        const onContactSupport = vi.fn();
        const { unmount } = renderModal({ onContactSupport });

        expect(requestProps.current).toMatchObject({ balanceAccountId: 'BA1', eligibility: ELIGIBILITY, hideTitle: true, onContactSupport });

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
