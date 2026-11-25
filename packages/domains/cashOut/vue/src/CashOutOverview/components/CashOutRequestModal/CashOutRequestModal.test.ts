/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { computed, createApp, h, nextTick, ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import { useShouldHideTitles } from '@integration-components/composables-vue';
import type { ICashOutEligibility } from '@integration-components/types';
import CashOutRequestModal from './CashOutRequestModal.vue';

const { addEvent } = vi.hoisted(() => ({ addEvent: vi.fn() }));

const TITLE = 'cashOut.request.title';
const ELIGIBILITY = { isCashoutAvailable: true } as unknown as ICashOutEligibility;

const requestProps: { current?: Record<string, unknown> } = {};
const modal: { dismiss?: () => void; emitClose?: () => void } = {};

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');

    return {
        BentoModal: defineComponent({
            props: { isOpen: Boolean, isDismissible: { type: Boolean, default: true }, hideCloseButton: Boolean },
            emits: ['close-modal'],
            setup(props, { emit, slots }) {
                // Like the escape key or a click outside, which Bento only reports when the modal is dismissible
                modal.dismiss = () => {
                    if (props.isDismissible) emit('close-modal');
                };
                modal.emitClose = () => emit('close-modal');
                return () =>
                    props.isOpen
                        ? h(
                              'div',
                              {
                                  'data-testid': 'modal',
                                  'data-dismissible': String(props.isDismissible),
                                  'data-hide-close-button': String(props.hideCloseButton),
                              },
                              [
                                  h('div', { 'data-testid': 'header' }, [
                                      slots.default?.(),
                                      props.hideCloseButton ? null : h('button', { 'data-testid': 'close', onClick: () => emit('close-modal') }),
                                  ]),
                                  slots.content?.(),
                              ]
                          )
                        : null;
            },
        }),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useEventDispatcherContext: () => ({ addEvent }),
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
                initialBalanceAccountId: { type: String, default: undefined },
                eligibility: { type: Object, default: undefined },
                isLoadingEligibility: Boolean,
                hideTitle: Boolean,
                referenceForBeneficiary: { type: String, default: undefined },
                transferDescription: { type: String, default: undefined },
                onSubmit: { type: Function, default: undefined },
                onResultShown: { type: Function, default: undefined },
                onTryAgain: { type: Function, default: undefined },
                onContactSupport: { type: Function, default: undefined },
                onInstructingChange: { type: Function, default: undefined },
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

type ModalProps = {
    referenceForBeneficiary?: string;
    transferDescription?: string;
    onSubmit?: () => void;
    onClose?: () => void;
    onContactSupport?: () => void;
    onTryAgain?: () => void;
    isLoadingEligibility?: boolean;
};

const renderModal = ({ onSubmit = vi.fn(), onClose = vi.fn(), ...props }: ModalProps = {}) => {
    const isOpen = ref(true);
    const target = document.createElement('div');
    const app = createApp({
        setup: () => () =>
            h(CashOutRequestModal, {
                initialBalanceAccountId: 'BA1',
                eligibility: ELIGIBILITY,
                isOpen: isOpen.value,
                onSubmit,
                onClose,
                ...props,
            }),
    });
    app.mount(target);

    const headerTitle = () => target.querySelector('[data-testid="header"]')?.textContent;
    const showResult = () => (requestProps.current?.onResultShown as () => void)();

    return { headerTitle, isOpen, showResult, target, unmount: () => app.unmount() };
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
        const onSubmit = vi.fn();
        const onContactSupport = vi.fn();
        const { unmount } = renderModal({ onSubmit, onContactSupport });

        expect(requestProps.current).toMatchObject({
            initialBalanceAccountId: 'BA1',
            eligibility: ELIGIBILITY,
            onSubmit,
            onContactSupport,
        });

        unmount();
    });

    test('should tell the request when the overview loads the eligibility again', () => {
        const { unmount } = renderModal({ isLoadingEligibility: true });

        expect(requestProps.current?.isLoadingEligibility).toBe(true);

        unmount();
    });

    test('should pass on the reference and the description given by the integration', () => {
        const { unmount } = renderModal({ referenceForBeneficiary: 'REF123', transferDescription: 'Weekly cashOut' });

        expect(requestProps.current).toMatchObject({
            referenceForBeneficiary: 'REF123',
            transferDescription: 'Weekly cashOut',
        });

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
        const { headerTitle, isOpen, showResult, unmount } = renderModal();

        showResult();
        await nextTick();
        expect(headerTitle()).toBe('');

        isOpen.value = false;
        await nextTick();
        isOpen.value = true;
        await nextTick();
        expect(headerTitle()).toBe(TITLE);

        unmount();
    });

    test('should close with the close button of the modal', () => {
        const onClose = vi.fn();
        const { target, unmount } = renderModal({ onClose });

        target.querySelector<HTMLButtonElement>('[data-testid="close"]')?.click();
        expect(onClose).toHaveBeenCalledTimes(1);

        unmount();
    });

    // Closing it would unmount the request, cancelling the cashOut in the browser while the server may still make it, and no
    // result would be shown
    describe('While the cashOut is sent', () => {
        const setInstructing = async (isInstructing: boolean) => {
            (requestProps.current?.onInstructingChange as (value: boolean) => void)(isInstructing);
            await nextTick();
        };

        // Bento's modal also hides its close button when it isn't dismissible; each covers for the other.
        test('should not offer to close the modal, neither with its close button nor by dismissing it', async () => {
            const { target, unmount } = renderModal();
            const modalElement = () => target.querySelector('[data-testid="modal"]');
            expect(modalElement()?.getAttribute('data-dismissible')).toBe('true');
            expect(modalElement()?.getAttribute('data-hide-close-button')).toBe('false');

            await setInstructing(true);

            expect(target.querySelector('[data-testid="close"]')).toBeNull();
            expect(modalElement()?.getAttribute('data-dismissible')).toBe('false');
            expect(modalElement()?.getAttribute('data-hide-close-button')).toBe('true');

            unmount();
        });

        test('should not close when dismissed, nor when asked to close', async () => {
            const onClose = vi.fn();
            const { unmount } = renderModal({ onClose });

            await setInstructing(true);
            modal.dismiss?.();
            modal.emitClose?.();

            expect(onClose).not.toHaveBeenCalled();

            unmount();
        });

        test('should close again once the cashOut is sent', async () => {
            const onClose = vi.fn();
            const { target, unmount } = renderModal({ onClose });

            await setInstructing(true);
            await setInstructing(false);
            target.querySelector<HTMLButtonElement>('[data-testid="close"]')?.click();
            modal.dismiss?.();

            expect(onClose).toHaveBeenCalledTimes(2);

            unmount();
        });
    });

    describe('Analytics', () => {
        const CLOSED = { category: 'CashOut request component', subCategory: 'Request', label: 'Close' };

        test('should tell the request was closed from its form', () => {
            const { target, unmount } = renderModal();

            target.querySelector<HTMLElement>('[data-testid="close"]')?.click();

            expect(addEvent).toHaveBeenCalledWith('Clicked button', { ...CLOSED, step: 'form' });

            unmount();
        });

        test('should tell the request was closed from its result', async () => {
            const { showResult, target, unmount } = renderModal();
            showResult();
            await nextTick();

            target.querySelector<HTMLElement>('[data-testid="close"]')?.click();

            expect(addEvent).toHaveBeenCalledWith('Clicked button', { ...CLOSED, step: 'result' });

            unmount();
        });

        test('should not tell a close while the cashOut is sent, as it does not close', async () => {
            const { unmount } = renderModal();
            (requestProps.current?.onInstructingChange as (value: boolean) => void)(true);
            await nextTick();

            modal.emitClose?.();

            expect(addEvent).not.toHaveBeenCalled();

            unmount();
        });
    });

    // The form is shown again, with the title of the modal, and the overview loads its eligibility again
    test('should show its title again and tell the overview when the cashOut is tried again after what is available changed', async () => {
        const onTryAgain = vi.fn();
        const { headerTitle, showResult, unmount } = renderModal({ onTryAgain });
        showResult();
        await nextTick();
        expect(headerTitle()).toBe('');

        (requestProps.current?.onTryAgain as () => void)();
        await nextTick();

        expect(headerTitle()).toBe(TITLE);
        expect(onTryAgain).toHaveBeenCalledTimes(1);

        unmount();
    });
});
