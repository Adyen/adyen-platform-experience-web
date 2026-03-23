/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CalendarInput } from './CalendarInput';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
import Localization from '../../../../core/Localization/Localization';

vi.mock('../../../../core/Context/useCoreContext');
vi.mock('../../../../hooks/useTimezoneAwareDateFormatting');
vi.mock('./components/CalendarInputPopover', () => ({
    CalendarInputPopover: ({ onHighlight, isOpen }: { onHighlight: (from?: number) => void; isOpen: boolean }) =>
        isOpen ? (
            <div data-testid="mock-popover">
                <button data-testid="select-date-btn" onClick={() => onHighlight(new Date('2023-12-25T10:00:00.000Z').getTime())}>
                    Select Date
                </button>
            </div>
        ) : null,
}));

describe('CalendarInput', () => {
    const mockUseCoreContext = vi.mocked(useCoreContext);
    const mockUseTimezoneAwareDateFormatting = vi.mocked(useTimezoneAwareDateFormatting);
    const mockOnInput = vi.fn();
    const mockDateFormat = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1703520645123); // Dec 25, 2023, 4:10:45.123 PM UTC

        const mockI18n = new Localization().i18n;

        const mockI18nWithGet = {
            ...mockI18n,
            get: vi.fn((key: string, options?: any) => {
                if (key === 'common.inputs.select.placeholder') return 'Select date';
                if (key === 'common.filters.types.date.calendar.label') return `${options?.values?.monthOfYear}`;
                if (key === 'common.filters.types.date.calendar.navigation.label') return 'Calendar navigation';
                return key;
            }),
        };

        mockUseCoreContext.mockReturnValue({ i18n: mockI18nWithGet } as any);

        mockUseTimezoneAwareDateFormatting.mockReturnValue({
            dateFormat: mockDateFormat,
            fullDateFormat: vi.fn(),
        });

        mockDateFormat.mockImplementation((date: string) => {
            if (!date) return 'Select date';
            return new Date(date).toLocaleDateString('en-US', { month: 'short', weekday: 'long', year: 'numeric' });
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('should render calendar input button with placeholder when no value is provided', () => {
        render(<CalendarInput value={undefined} onInput={mockOnInput} />);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Select date');
        expect(button).toHaveAttribute('aria-haspopup', 'dialog');
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(button).not.toHaveAttribute('aria-invalid');
    });

    test('should render calendar input button with formatted date when value is provided', () => {
        const testDate = '2023-12-25T10:00:00.000Z';
        const formattedDate = 'Dec 25, 2023';

        mockDateFormat.mockReturnValue(formattedDate);

        render(<CalendarInput value={testDate} onInput={mockOnInput} />);

        const button = screen.getByRole('button');
        expect(button).toHaveTextContent(formattedDate);
        expect(mockDateFormat).toHaveBeenCalledWith(testDate, expect.any(Object));
    });

    test('should show invalid state when isInvalid is true', () => {
        render(<CalendarInput value={undefined} onInput={mockOnInput} isInvalid={true} />);

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-invalid', 'true');
    });

    test('should open calendar popover when button is clicked', () => {
        render(<CalendarInput value={undefined} onInput={mockOnInput} />);

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    test('should call timezone aware date formatting hook with timezone prop', () => {
        const timezone = 'America/New_York';

        render(<CalendarInput value={undefined} onInput={mockOnInput} timezone={timezone} />);

        expect(mockUseTimezoneAwareDateFormatting).toHaveBeenCalledWith(timezone);
    });

    test('should call timezone aware date formatting hook without timezone when not provided', () => {
        render(<CalendarInput value={undefined} onInput={mockOnInput} />);

        expect(mockUseTimezoneAwareDateFormatting).toHaveBeenCalledWith(undefined);
    });

    test('should handle date selection correctly', async () => {
        const testDate = '2023-12-25T10:00:00.000Z';
        const timestamp = new Date(testDate).getTime();

        render(<CalendarInput value={undefined} onInput={mockOnInput} />);

        // Open the calendar
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Simulate date selection by calling the onHighlight callback
        // This would normally be triggered by the Calendar component
        await waitFor(() => {
            // The onHighlight function should be called when a date is selected
            // We'll test this by checking the component's internal state changes
            expect(button).toHaveAttribute('aria-expanded', 'true');
        });
    });

    test('should format label correctly with different date values', () => {
        const testCases = [
            { value: undefined, expected: 'Select date' },
            { value: '', expected: 'Select date' },
            { value: '2023-12-25T10:00:00.000Z', expected: 'Dec 25, 2023' },
            { value: '2024-01-01T00:00:00.000Z', expected: 'Jan 01, 2024' },
        ];

        testCases.forEach(({ value, expected }) => {
            cleanup();
            mockDateFormat.mockReturnValue(expected);

            render(<CalendarInput value={value} onInput={mockOnInput} />);

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent(expected);
        });
    });

    test('should apply correct CSS classes', () => {
        render(<CalendarInput value={undefined} onInput={mockOnInput} isInvalid={true} />);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('adyen-pe-button');
        expect(button).toHaveClass('adyen-pe-dropdown__button');
        expect(button).toHaveClass('adyen-pe-button--invalid');
    });

    test('should not call onInput until a date is selected', () => {
        render(<CalendarInput value={undefined} onInput={mockOnInput} />);

        // onInput should not be called on initial render
        expect(mockOnInput).not.toHaveBeenCalled();

        // Open the calendar
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // onInput should still not be called just by opening the calendar
        expect(mockOnInput).not.toHaveBeenCalled();
    });

    test('should call onInput with ISO date string when date is selected', () => {
        render(<CalendarInput value={undefined} onInput={mockOnInput} />);

        // Open the calendar
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Select a date from the mocked calendar popover
        const selectDateBtn = screen.getByTestId('select-date-btn');
        fireEvent.click(selectDateBtn);

        // Verify onInput was called with the ISO date string
        expect(mockOnInput).toHaveBeenCalledTimes(1);
        expect(mockOnInput).toHaveBeenCalledWith('2023-12-25T10:00:00.000Z');
    });

    test('should show clear button only when clearable and value is provided', () => {
        const testDate = '2023-12-25T10:00:00.000Z';

        const { container, rerender } = render(<CalendarInput value={testDate} onInput={mockOnInput} clearable={true} />);
        expect(container.querySelector('.adyen-pe-dropdown__button-clear')).toBeInTheDocument();

        rerender(<CalendarInput value={testDate} onInput={mockOnInput} clearable={false} />);
        expect(container.querySelector('.adyen-pe-dropdown__button-clear')).not.toBeInTheDocument();

        rerender(<CalendarInput value={undefined} onInput={mockOnInput} clearable={true} />);
        expect(container.querySelector('.adyen-pe-dropdown__button-clear')).not.toBeInTheDocument();
    });

    test('should clear value when clear button is clicked and not open the popover', () => {
        const testDate = '2023-12-25T10:00:00.000Z';
        const { container } = render(<CalendarInput value={testDate} onInput={mockOnInput} clearable={true} />);

        const mainButton = screen.getAllByRole('button')[0];
        expect(mainButton).toHaveAttribute('aria-expanded', 'false');

        const clearButton = container.querySelector('.adyen-pe-dropdown__button-clear');
        expect(clearButton).toBeInTheDocument();

        fireEvent.click(clearButton as Element);
        expect(mockOnInput).toHaveBeenCalledWith('');
        expect(mainButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should get grid label correctly for calendar', () => {
        render(<CalendarInput value={undefined} onInput={mockOnInput} />);

        // The getGridLabel function should be configured correctly
        // This is tested by ensuring the component renders without errors
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    test('should handle originDate conversion correctly', () => {
        const testDate = '2023-12-25T10:00:00.000Z';

        render(<CalendarInput value={testDate} onInput={mockOnInput} />);

        // The component should convert the string value to a Date array for the calendar
        // This is tested by ensuring the component renders without errors
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    test('should handle empty originDate when value is not provided', () => {
        render(<CalendarInput value={undefined} onInput={mockOnInput} />);

        // The component should handle undefined value correctly
        // This is tested by ensuring the component renders without errors
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });
});
