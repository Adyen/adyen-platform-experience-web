/**
 * @vitest-environment jsdom
 */
import { ButtonVariant } from '@src/components/internal/Button/types';
import { PopoverContainerPosition, PopoverContainerVariant } from '@src/components/internal/Popover/types';
import { render, screen } from '@testing-library/preact';
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
        const mockIntersectionObserver = vi.fn();
        mockIntersectionObserver.mockReturnValue({
            observe: () => null,
            unobserve: () => null,
            disconnect: () => null,
        });

        context.dismiss = vi.fn();
        context.applyAction = vi.fn();

        window.IntersectionObserver = mockIntersectionObserver;

        const buttonEl = createRef();

        render(
            <div>
                <button ref={buttonEl}>{'Popover Controller'}</button>
                <Popover
                    targetElement={buttonEl}
                    title={'Test Popover'}
                    aria-label={'popover-test'}
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
            </div>
        );
    });

    test('should automatically focus', () => {
        const inputEl = screen.getByTestId('mock-textbox');
        expect(inputEl).toHaveFocus();
    });

    test<PopoverContext>('should call dismiss on click outside', async ({ dismiss }) => {
        const titleEl = screen.getByText(/Test Popover/i);
        const buttonEl = screen.getByRole('button', { name: 'Popover Controller' });
        const inputEl = screen.getByTestId('mock-textbox');
        expect(inputEl).toHaveFocus();

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

    test('should add tooltip class', () => {
        const tooltip = screen.getByRole('dialog');
        expect(tooltip).toHaveClass('popover-content-container--tooltip-bottom');
    });
});

describe('Popover component close', () => {
    beforeEach(() => {
        const mockIntersectionObserver = vi.fn();
        mockIntersectionObserver.mockReturnValue({
            observe: () => null,
            unobserve: () => null,
            disconnect: () => null,
        });

        window.IntersectionObserver = mockIntersectionObserver;

        const buttonEl = createRef();

        render(
            <div>
                <button ref={buttonEl}>{'Popover Controller'}</button>
                <Popover targetElement={buttonEl} aria-label={'popover-test'}>
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
