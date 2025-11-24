/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
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

    test('should pass aria attributes to the input element', () => {
        render(<ToggleSwitch aria-label="My Toggle" />);
        const input = screen.getByLabelText('My Toggle');
        expect(input).toBeInTheDocument();
    });

    test('should update the checked state when the prop changes', () => {
        const { rerender } = render(<ToggleSwitch checked={false} />);
        const input = screen.getByRole('checkbox');
        expect(input).not.toBeChecked();

        rerender(<ToggleSwitch checked={true} />);
        expect(input).toBeChecked();
    });

    test('should call the onChange handler when clicked', async () => {
        const onChange = vi.fn();
        render(<ToggleSwitch onChange={onChange} />);

        const input = screen.getByRole('checkbox');
        const label = screen.getByTestId('toggle-switch');

        await userEvent.click(input);
        expect(onChange).toHaveBeenCalledTimes(1);

        await userEvent.click(label);
        expect(onChange).toHaveBeenCalledTimes(2);
    });

    test('should not call the onChange handler when disabled', async () => {
        const onChange = vi.fn();
        render(<ToggleSwitch onChange={onChange} disabled />);

        const input = screen.getByRole('checkbox');
        const label = screen.getByTestId('toggle-switch');
        expect(input).toBeDisabled();

        await userEvent.click(input);
        expect(onChange).not.toHaveBeenCalled();

        await userEvent.click(label);
        expect(onChange).not.toHaveBeenCalled();
    });

    test('should not call the onChange handler when readonly', async () => {
        const onChange = vi.fn();
        render(<ToggleSwitch onChange={onChange} readOnly />);

        const input = screen.getByRole('checkbox');
        const label = screen.getByTestId('toggle-switch');
        expect(input).toHaveAttribute('aria-readonly', 'true');

        await userEvent.click(input);
        expect(onChange).not.toHaveBeenCalled();

        await userEvent.click(label);
        expect(onChange).not.toHaveBeenCalled();
    });

    test('should render the label content after the switch by default', () => {
        render(<ToggleSwitch>My Label</ToggleSwitch>);

        const label = screen.getByText('My Label');
        expect(label).toBeInTheDocument();

        const switchEl = screen.getByTestId('toggle-switch-control');
        expect(switchEl.nextElementSibling).toBe(label);
    });

    test('should render the label content before the switch when labelBeforeSwitch is true', () => {
        render(<ToggleSwitch labelBeforeSwitch>My Label</ToggleSwitch>);

        const label = screen.getByText('My Label');
        expect(label).toBeInTheDocument();

        const switchEl = screen.getByTestId('toggle-switch-control');
        expect(switchEl.previousElementSibling).toBe(label);
    });

    test('should render JSX content as the label', () => {
        render(
            <ToggleSwitch>
                <span>My custom label</span>
            </ToggleSwitch>
        );
        const label = screen.getByText('My custom label');
        expect(label).toBeInTheDocument();
        expect(label.tagName).toBe('SPAN');
    });
});
