/**
 * @vitest-environment jsdom
 */
import { render, fireEvent, screen } from '@testing-library/preact';
import { describe, expect, vi, beforeEach, test } from 'vitest';
import { Stepper } from './Stepper';
import useCoreContext from '../../../core/Context/useCoreContext';

vi.mock('../../../core/Context/useCoreContext', () => ({
    default: vi.fn(),
}));

const DEFAULT_STEPS = ['Step 1', 'Step 2', 'Step 3'];

const ACTIVE_STEP_ITEM_CLASS = 'adyen-pe-step__item adyen-pe-step--active';
const COMPLETED_STEP_ITEM_CLASS = 'adyen-pe-step__item adyen-pe-step--completed';
const DISABLED_STEP_ITEM_CLASS = 'adyen-pe-step__item adyen-pe-step--disabled';

const TEST_ARIA_LABEL = 'Test Aria Label';

const renderStepper = (props: {
    activeIndex: number;
    onChange: (index: number) => void;
    variant?: 'vertical' | 'horizontal';
    ariaLabel?: string;
}) => {
    return render(
        <Stepper {...props} ariaLabel={props.ariaLabel || TEST_ARIA_LABEL} data-testid="stepper">
            {DEFAULT_STEPS.map(step => (
                <div key={step}>{step}</div>
            ))}
        </Stepper>
    );
};

const mockI18n = {
    get: vi.fn(() => 'step'),
};

describe('Stepper', () => {
    beforeEach(() => {
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: mockI18n,
        } as any);
    });

    test('renders correctly with three steps', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange });

        expect(screen.getByText('Step 1')).toBeInTheDocument();
        expect(screen.getByText('Step 2')).toBeInTheDocument();
        expect(screen.getByText('Step 3')).toBeInTheDocument();
        expect(screen.getByRole('toolbar')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    test('shows first step as active by default', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange });

        const step1Button = screen.getByRole('button', { name: 'Step 1' });

        // Check the button has aria-current for active state
        expect(step1Button).toHaveAttribute('aria-current', 'step');

        // Verify the li element has the active class using getAllByRole
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveClass(ACTIVE_STEP_ITEM_CLASS);
    });

    test('shows completed steps correctly', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 1, onChange: mockOnChange });

        // Check the second step is active
        const step2Button = screen.getByRole('button', { name: 'Step 2' });
        expect(step2Button).toHaveAttribute('aria-current', 'step');

        // Verify the list items have appropriate classes
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveClass(COMPLETED_STEP_ITEM_CLASS);
        expect(listItems[1]).toHaveClass(ACTIVE_STEP_ITEM_CLASS);
    });

    test('prevents activating future steps in linear behavior', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange });

        const step3Button = screen.getByRole('button', { name: 'Step 3' });

        // Check the button is disabled
        expect(step3Button).toHaveAttribute('aria-disabled', 'true');
        expect(step3Button).toBeDisabled();

        // Verify the list item has disabled class
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[2]).toHaveClass(DISABLED_STEP_ITEM_CLASS);
    });

    test('calls onChange when clicking on allowed steps', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange });

        const step2 = screen.getByRole('button', { name: 'Step 2' });
        fireEvent.click(step2);
        expect(mockOnChange).toHaveBeenCalledWith(1);
    });

    test('does not call onChange when clicking on disabled steps', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange });

        const step3 = screen.getByRole('button', { name: 'Step 3' });
        fireEvent.click(step3);
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('focuses on next step using arrow keys', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange, variant: 'vertical' });

        const list = screen.getByRole('toolbar');
        const step1 = screen.getByRole('button', { name: 'Step 1' });
        const step2 = screen.getByRole('button', { name: 'Step 2' });

        step1.focus();
        fireEvent.keyDown(list, {
            code: 'ArrowDown',
        });

        expect(step1).not.toHaveFocus();
        expect(step2).toHaveFocus();
    });

    test('focuses on previous step using arrow keys', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 1, onChange: mockOnChange, variant: 'vertical' });

        const list = screen.getByRole('toolbar');
        const step1 = screen.getByRole('button', { name: 'Step 1' });
        const step2 = screen.getByRole('button', { name: 'Step 2' });

        step2.focus();
        fireEvent.keyDown(list, { code: 'ArrowUp' });

        expect(step2).not.toHaveFocus();
        expect(step1).toHaveFocus();
    });

    test('activates focused step using Enter key', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange });

        const list = screen.getByRole('toolbar');
        const step2 = screen.getByRole('button', { name: 'Step 2' });

        step2.focus();
        fireEvent.keyDown(list, { code: 'Enter' });

        expect(mockOnChange).toHaveBeenCalledWith(1);
    });

    test('activates focused step using Space key', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange });

        const list = screen.getByRole('toolbar');
        const step2 = screen.getByRole('button', { name: 'Step 2' });

        step2.focus();
        fireEvent.keyDown(list, { code: 'Space' });

        expect(mockOnChange).toHaveBeenCalledWith(1);
    });

    test('does not activate disabled step using Enter key', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange });

        const list = screen.getByRole('toolbar');
        const step3 = screen.getByRole('button', { name: 'Step 3' });

        step3.focus();
        fireEvent.keyDown(list, { code: 'Enter' });

        expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('applies horizontal variant class', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange, variant: 'horizontal' });

        const list = screen.getByRole('toolbar');
        expect(list).toHaveClass('adyen-pe-stepper__list--horizontal');
    });

    test('uses horizontal arrow keys for horizontal variant', () => {
        const mockOnChange = vi.fn();
        renderStepper({ activeIndex: 0, onChange: mockOnChange, variant: 'horizontal' });

        const list = screen.getByRole('toolbar');
        const step1 = screen.getByRole('button', { name: 'Step 1' });
        const step2 = screen.getByRole('button', { name: 'Step 2' });

        step1.focus();
        fireEvent.keyDown(list, { code: 'ArrowRight' });

        expect(step1).not.toHaveFocus();
        expect(step2).toHaveFocus();
    });
});
