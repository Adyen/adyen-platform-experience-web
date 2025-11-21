/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/preact';
import ToggleSwitch from './ToggleSwitch';

describe('ToggleSwitch', () => {
    test('should render the toggle switch in the unchecked state', () => {
        render(<ToggleSwitch />);
        const input = screen.getByRole('checkbox');
        expect(input).not.toBeChecked();
    });

    test('should render the toggle switch in the checked state', () => {
        render(<ToggleSwitch checked />);
        const input = screen.getByRole('checkbox');
        expect(input).toBeChecked();
    });

    test('should pass the id to the input element', () => {
        render(<ToggleSwitch id="my-toggle" />);
        const input = screen.getByRole('checkbox');
        expect(input).toHaveAttribute('id', 'my-toggle');
    });

    test('should pass other props to the input element', () => {
        render(<ToggleSwitch data-testid="my-toggle" />);
        const input = screen.getByTestId('my-toggle');
        expect(input).toBeInTheDocument();
    });

    test('should call the onChange handler when clicked', () => {
        const onChange = vi.fn();
        render(<ToggleSwitch onChange={onChange} />);
        const input = screen.getByRole('checkbox');
        fireEvent.click(input);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    test('should update the checked state when the prop changes', () => {
        const { rerender } = render(<ToggleSwitch checked={false} />);
        const input = screen.getByRole('checkbox');
        expect(input).not.toBeChecked();

        rerender(<ToggleSwitch checked={true} />);
        expect(input).toBeChecked();
    });
});
