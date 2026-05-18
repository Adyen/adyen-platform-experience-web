/**
 * @vitest-environment jsdom
 */
import { ButtonVariant } from '../Button/types';
import { PopoverContainerPosition, PopoverContainerVariant } from './types';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { createRef } from 'preact';
import { describe, expect, test, vi } from 'vitest';
import Popover from './Popover';

describe('Popover component', () => {
    const renderPopover = (props?: { dismiss?: () => any; applyAction?: () => any }) => {
        const dismiss = props?.dismiss ?? vi.fn();
        const applyAction = props?.applyAction ?? vi.fn();
        const buttonEl = createRef();

        render(
            <div>
                <div>{'Outside of component'}</div>
                <button ref={buttonEl}>{'Popover Controller'}</button>
                {buttonEl && (
                    <Popover
                        targetElement={buttonEl}
                        title={'Test Popover'}
                        open={true}
                        disableFocusTrap={true}
                        dismiss={dismiss}
                        dismissible={true}
                        variant={PopoverContainerVariant.TOOLTIP}
                        position={PopoverContainerPosition.BOTTOM}
                        actions={[
                            {
                                title: 'apply',
                                variant: ButtonVariant.PRIMARY,
                                event: applyAction,
                                disabled: false,
                            },
                        ]}
                    >
                        <input data-testid="mock-textbox" type="text" />
                    </Popover>
                )}
            </div>
        );

        return { dismiss, applyAction };
    };

    test('should automatically focus', async () => {
        renderPopover();
        const inputEl = screen.getByTestId('mock-textbox');
        await waitFor(() => {
            expect(inputEl).toHaveFocus();
        });
    });

    test('should call dismiss on click outside', async () => {
        const dismiss = vi.fn();
        renderPopover({ dismiss });

        const titleEl = screen.getByText(/Test Popover/i);
        const outsideEl = screen.getByText('Outside of component');
        const inputEl = screen.getByTestId('mock-textbox');

        await waitFor(() => {
            expect(inputEl).toHaveFocus();
        });

        await userEvent.click(inputEl);
        expect(titleEl).toBeInTheDocument();
        expect(dismiss).toBeCalledTimes(0);

        await userEvent.click(outsideEl);
        expect(dismiss).toBeCalledTimes(1);
    });

    test('should call dismiss on esc keyboard action', async () => {
        const dismiss = vi.fn();
        renderPopover({ dismiss });

        await userEvent.keyboard('[Escape]');
        const buttonEl = screen.getByRole('button', { name: 'Popover Controller' });
        const popoverEl = screen.getByTestId('mock-textbox');
        expect(dismiss).toBeCalledTimes(1);
        expect(buttonEl).toHaveFocus();
        expect(popoverEl).not.toHaveFocus();
    });

    test('should have dismiss icon', async () => {
        const dismiss = vi.fn();
        renderPopover({ dismiss });

        const closeButton = screen.getByLabelText(/close/i);
        expect(closeButton).toBeInTheDocument();

        await userEvent.click(closeButton);
        expect(dismiss).toBeCalledTimes(1);
    });

    test('should have action button and call function on click', async () => {
        const applyAction = vi.fn();
        renderPopover({ applyAction });

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
    test('should not appear', () => {
        const buttonEl = createRef();

        render(
            <div>
                <button ref={buttonEl}>{'Popover Controller'}</button>
                <Popover targetElement={buttonEl}>
                    <input data-testid="mock-textbox" type="text" />
                </Popover>
            </div>
        );

        const inputEl = screen.queryByRole('textbox');
        expect(inputEl).not.toBeInTheDocument();
    });
});
