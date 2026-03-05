/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { popoverUtil } from '../../components/internal/Popover/utils/popoverUtil';
import { ClickOutsideVariant, CONTROL_ELEMENT_PROPERTY, useClickOutside } from './useClickOutside';
import { useRef, useEffect } from 'preact/hooks';

describe('useClickOutside', () => {
    const callback = vi.fn();
    let outsideDiv: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();
        popoverUtil.closeAll();
        outsideDiv = document.createElement('div');
        outsideDiv.setAttribute('id', 'outside');
        document.body.appendChild(outsideDiv);
    });

    afterEach(() => {
        cleanup();
        if (outsideDiv && outsideDiv.parentNode) outsideDiv.parentNode.removeChild(outsideDiv);
        popoverUtil.closeAll();
        vi.restoreAllMocks();
    });

    const TestComponent = ({ cb = callback, disable = false, variant = ClickOutsideVariant.DEFAULT, id = 'target', children = null as any }) => {
        const ref = useClickOutside(null, cb, disable, variant);
        return (
            <div ref={ref} id={id}>
                {children}
            </div>
        );
    };

    test('should call callback when clicking outside the element', async () => {
        const user = userEvent.setup();
        render(<TestComponent />);

        await user.click(outsideDiv);

        expect(callback).toHaveBeenCalledWith(true);
    });

    test('should not call callback when clicking inside the element', async () => {
        const user = userEvent.setup();
        const { getByText } = render(<TestComponent>Inside</TestComponent>);
        const target = getByText('Inside');

        await user.click(target);

        expect(callback).not.toHaveBeenCalled();
    });

    test('should not call callback when dragging from inside to outside', async () => {
        const user = userEvent.setup();
        const { getByText } = render(<TestComponent>Inside</TestComponent>);
        const target = getByText('Inside');

        await user.pointer([{ keys: '[MouseLeft>]', target: target }, { target: outsideDiv }, { keys: '[/MouseLeft]' }]);

        expect(callback).not.toHaveBeenCalled();
    });

    test('should not call callback when disabled', async () => {
        const user = userEvent.setup();
        render(<TestComponent disable={true} />);

        await user.click(outsideDiv);

        expect(callback).not.toHaveBeenCalled();
    });

    test('should handle control elements', async () => {
        const user = userEvent.setup();
        const { getByTestId } = render(
            <>
                <TestComponent />
                <div data-testid="control">Control</div>
            </>
        );

        const target = document.getElementById('target');
        const control = getByTestId('control');
        (control as any)[CONTROL_ELEMENT_PROPERTY] = target;

        await user.click(control);

        expect(callback).not.toHaveBeenCalled();
    });

    test('should handle control elements linked to child of target', async () => {
        const user = userEvent.setup();
        const ComplexComponent = () => {
            const ref = useClickOutside(null, callback);
            const childRef = useRef<HTMLDivElement>(null);
            const controlRef = useRef<HTMLDivElement>(null);

            useEffect(() => {
                if (controlRef.current && childRef.current) {
                    (controlRef.current as any)[CONTROL_ELEMENT_PROPERTY] = childRef.current;
                }
            }, []);

            return (
                <>
                    <div ref={ref} id="target">
                        <div ref={childRef} id="child">
                            Child
                        </div>
                    </div>
                    <div ref={controlRef} data-testid="control">
                        Control
                    </div>
                </>
            );
        };

        const { getByTestId } = render(<ComplexComponent />);
        const control = getByTestId('control');

        await user.click(control);

        expect(callback).not.toHaveBeenCalled();
    });

    test('should not crash if callback is undefined', async () => {
        const user = userEvent.setup();
        render(<TestComponent cb={undefined} />);

        await user.click(outsideDiv);
    });

    describe('Shadow DOM', () => {
        test('should not call callback when clicking inside a shadow dom which is inside the target', async () => {
            const user = userEvent.setup();
            const { getByTestId } = render(
                <TestComponent>
                    <div data-testid="host"></div>
                </TestComponent>
            );

            const host = getByTestId('host');
            const shadowRoot = host.attachShadow({ mode: 'open' });
            const shadowDiv = document.createElement('div');
            shadowDiv.textContent = 'Shadow Content';
            shadowRoot.appendChild(shadowDiv);

            await user.click(shadowDiv);

            expect(callback).not.toHaveBeenCalled();
        });

        test('should not call callback when dragging from inside shadow dom to outside', async () => {
            const user = userEvent.setup();
            const { getByTestId } = render(
                <TestComponent>
                    <div data-testid="host"></div>
                </TestComponent>
            );

            const host = getByTestId('host');
            const shadowRoot = host.attachShadow({ mode: 'open' });
            const shadowDiv = document.createElement('div');
            shadowDiv.textContent = 'Shadow Content';
            shadowRoot.appendChild(shadowDiv);

            // Temporary mock the Range `setStart` and `setEnd` methods to skip selection behavior
            const setStart = vi.spyOn(Range.prototype, 'setStart').mockImplementation(() => {});
            const setEnd = vi.spyOn(Range.prototype, 'setEnd').mockImplementation(() => {});

            await user.pointer([{ keys: '[MouseLeft>]', target: shadowDiv }, { target: outsideDiv }, { keys: '[/MouseLeft]' }]);

            expect(callback).not.toHaveBeenCalled();

            // Clean up mocks
            setStart.mockRestore();
            setEnd.mockRestore();
        });
    });

    describe('Popover Variant', () => {
        test('should register with popoverUtil on mount', () => {
            const addSpy = vi.spyOn(popoverUtil, 'add');
            render(<TestComponent variant={ClickOutsideVariant.POPOVER} />);

            const target = document.getElementById('target');
            expect(addSpy).toHaveBeenCalledWith(target, callback);
        });

        test('should unregister from popoverUtil on unmount', () => {
            const removeSpy = vi.spyOn(popoverUtil, 'remove');
            const { unmount } = render(<TestComponent variant={ClickOutsideVariant.POPOVER} />);

            const target = document.getElementById('target');
            unmount();

            expect(removeSpy).toHaveBeenCalledWith(target);
        });

        test('should delegate to popoverUtil.closePopoversOutsideOfClick on click outside', async () => {
            const user = userEvent.setup();
            const closeSpy = vi.spyOn(popoverUtil, 'closePopoversOutsideOfClick');
            render(<TestComponent variant={ClickOutsideVariant.POPOVER} />);

            await user.click(outsideDiv);

            expect(closeSpy).toHaveBeenCalled();
        });
    });

    describe('Focusout Handling', () => {
        test('should stop propagation of focusout event', async () => {
            const user = userEvent.setup();
            const parentFocusOut = vi.fn();

            const { getByText } = render(
                <div onFocusOut={parentFocusOut} tabIndex={0}>
                    <TestComponent>Target</TestComponent>
                </div>
            );

            const target = getByText('Target');

            target.focus();
            await user.tab();
            expect(parentFocusOut).not.toHaveBeenCalled();
        });

        test('should remove focusout listener when disabled', async () => {
            const user = userEvent.setup();
            const parentFocusOut = vi.fn();

            const Wrapper = ({ disable }: { disable: boolean }) => (
                <div onFocusOut={parentFocusOut} tabIndex={0}>
                    <TestComponent disable={disable}>Target</TestComponent>
                </div>
            );

            const { getByText, rerender } = render(<Wrapper disable={false} />);
            const target = getByText('Target');

            target.focus();
            await user.tab();
            expect(parentFocusOut).not.toHaveBeenCalled();

            rerender(<Wrapper disable={true} />);

            target.focus();
            await user.tab();
            expect(parentFocusOut).toHaveBeenCalled();
        });
    });
});
