/**
 * @vitest-environment jsdom
 */
import { ButtonVariant } from '../Button/types';
import { PopoverContainerPosition, PopoverContainerVariant } from './types';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { createRef } from 'preact';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Popover from './Popover';

interface PopoverContext {
    dismiss: () => any;
    applyAction: () => any;
}

describe('Popover component', () => {
    beforeEach<PopoverContext>(context => {
        window.IntersectionObserver = vi.fn(function (this: IntersectionObserver) {
            this.observe = vi.fn();
            this.unobserve = vi.fn();
            this.disconnect = vi.fn();
        }) as unknown as typeof IntersectionObserver;

        context.dismiss = vi.fn();
        context.applyAction = vi.fn();

        const buttonEl = createRef();

        render(
            <div>
                <button ref={buttonEl}>{'Popover Controller'}</button>
                {buttonEl && (
                    <Popover
                        targetElement={buttonEl}
                        title={'Test Popover'}
                        open={true}
                        disableFocusTrap={true}
                        dismiss={context.dismiss}
                        dismissible={true}
                        variant={PopoverContainerVariant.TOOLTIP}
                        position={PopoverContainerPosition.BOTTOM}
                        actions={[
                            {
                                title: 'apply',
                                variant: ButtonVariant.PRIMARY,
                                event: context.applyAction,
                                disabled: false,
                            },
                        ]}
                    >
                        <input data-testid="mock-textbox" type="text" />
                    </Popover>
                )}
            </div>
        );
    });

    test('should automatically focus', async () => {
        const inputEl = screen.getByTestId('mock-textbox');
        await waitFor(() => {
            expect(inputEl).toHaveFocus();
        });
    });

    test<PopoverContext>('should call dismiss on click outside', async ({ dismiss }) => {
        const titleEl = screen.getByText(/Test Popover/i);
        const buttonEl = screen.getByRole('button', { name: 'Popover Controller' });
        const inputEl = screen.getByTestId('mock-textbox');

        await waitFor(() => {
            expect(inputEl).toHaveFocus();
        });

        await userEvent.click(inputEl);
        expect(titleEl).toBeInTheDocument();
        expect(dismiss).toBeCalledTimes(0);

        await userEvent.click(buttonEl);
        expect(dismiss).toBeCalledTimes(1);
    });

    test<PopoverContext>('should call dismiss on esc keyboard action', async ({ dismiss }) => {
        await userEvent.keyboard('[Escape]');
        const buttonEl = screen.getByRole('button', { name: 'Popover Controller' });
        const popoverEl = screen.getByTestId('mock-textbox');
        expect(dismiss).toBeCalledTimes(1);
        expect(buttonEl).toHaveFocus();
        expect(popoverEl).not.toHaveFocus();
    });

    test<PopoverContext>('should have dismiss icon', async ({ dismiss }) => {
        const closeButton = screen.getByLabelText(/close/i);
        expect(closeButton).toBeInTheDocument();

        await userEvent.click(closeButton);
        expect(dismiss).toBeCalledTimes(1);
    });

    test<PopoverContext>('should have action button and call function on click', async ({ applyAction }) => {
        const applyButton = screen.getByLabelText(/apply/i);
        expect(applyButton).toBeInTheDocument();

        await userEvent.click(applyButton);
        expect(applyAction).toBeCalledTimes(1);
    });

    //TODO: remove skip
    test.skip('should add tooltip class', async () => {
        await waitFor(
            () => {
                expect(screen.getByRole('dialog')).toHaveClass('adyen-pe-tooltip');
            },
            { timeout: 5000 }
        );
    });
});

describe('Popover component close', () => {
    beforeEach(() => {
        window.IntersectionObserver = vi.fn(function (this: IntersectionObserver) {
            this.observe = vi.fn();
            this.unobserve = vi.fn();
            this.disconnect = vi.fn();
        }) as unknown as typeof IntersectionObserver;

        const buttonEl = createRef();

        render(
            <div>
                <button ref={buttonEl}>{'Popover Controller'}</button>
                <Popover targetElement={buttonEl}>
                    <input data-testid="mock-textbox" type="text" />
                </Popover>
            </div>
        );
    });

    test('should not appear', () => {
        const inputEl = screen.queryByRole('textbox');
        expect(inputEl).not.toBeInTheDocument();
    });
});
