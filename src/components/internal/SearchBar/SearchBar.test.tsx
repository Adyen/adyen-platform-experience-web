/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, vi, test } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/preact';
import { SearchBar, SearchBarRef } from './SearchBar';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../translations';

vi.mock('../../../core/Context/useCoreContext', () => ({
    default: vi.fn(),
}));

const mockedUseCoreContext = vi.mocked(useCoreContext);

describe('SearchBar', () => {
    const TRANSLATIONS = {
        'common.inputs.search.clearSearch': 'Clear search',
        'common.inputs.search.searchLabel': 'Search',
    } as const;

    const getMockedContext = (overrides: Partial<ReturnType<typeof useCoreContext>> = {}) => ({
        i18n: {
            get: vi.fn((key: TranslationKey | string) => TRANSLATIONS[key as keyof typeof TRANSLATIONS] ?? (key as string)),
        },
        ...overrides,
    });

    beforeEach(() => {
        vi.useFakeTimers();
        mockedUseCoreContext.mockReturnValue(getMockedContext() as ReturnType<typeof useCoreContext>);
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.runAllTimers();
        vi.useRealTimers();
    });

    test('renders with default icon and input attributes', () => {
        render(<SearchBar placeholder="Search" />);

        expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Search');
        expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    });

    test('shows clear button when value is present and clears input on click', async () => {
        const handleClear = vi.fn();
        const handleInput = vi.fn();

        render(<SearchBar value="Test" onClear={handleClear} onInput={handleInput} debounceTime={0} />);

        const button = screen.getByRole('button', { name: 'Clear search', hidden: true });
        expect(screen.getByRole('searchbox')).toHaveValue('Test');

        fireEvent.click(button);

        expect(handleClear).toHaveBeenCalled();
        expect(handleInput).toHaveBeenCalledWith('');
        expect(screen.getByRole('searchbox')).toHaveValue('');
    });

    test('emits debounced input event when typing', async () => {
        const handleInput = vi.fn();
        render(<SearchBar onInput={handleInput} debounceTime={300} />);

        fireEvent.input(screen.getByRole('searchbox'), { target: { value: 'Test' } });
        fireEvent.input(screen.getByRole('searchbox'), { target: { value: 'Test Input' } });

        expect(handleInput).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(handleInput).toHaveBeenCalledTimes(1);
        expect(handleInput).toHaveBeenCalledWith('Test Input');
    });

    test('updates when value changes', async () => {
        const { rerender } = render(<SearchBar value="Test 1" />);

        expect(screen.getByRole('searchbox')).toHaveValue('Test 1');

        rerender(<SearchBar value="Test 2" />);

        expect(screen.getByRole('searchbox')).toHaveValue('Test 2');
    });

    test('auto focuses the input when requested', () => {
        render(<SearchBar autoFocus />);

        expect(screen.getByRole('searchbox')).toHaveFocus();
    });

    test('calls onBlur when input loses focus', () => {
        const handleBlur = vi.fn();
        render(<SearchBar onBlur={handleBlur} />);

        const input = screen.getByRole('searchbox');
        fireEvent.focus(input);
        fireEvent.blur(input);

        expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    test('cancels debounced input when clear button is clicked', async () => {
        const handleInput = vi.fn();
        render(<SearchBar debounceTime={300} onInput={handleInput} />);

        const input = screen.getByRole('searchbox');

        // Type something
        fireEvent.input(input, { target: { value: 'Test' } });

        // Click clear before debounce completes
        const clearButton = screen.getByRole('button', { name: 'Clear search', hidden: true });
        fireEvent.click(clearButton);

        // Advance time
        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        // Should only be called once with empty string from clear, not with 'Test'
        expect(handleInput).toHaveBeenCalledTimes(1);
        expect(handleInput).toHaveBeenCalledWith('');
    });

    test('shows clear button after typing into empty input', async () => {
        render(<SearchBar />);

        expect(screen.queryByRole('button', { name: 'Clear search', hidden: true })).not.toBeInTheDocument();

        fireEvent.input(screen.getByRole('searchbox'), { target: { value: 'New text' } });

        const button = screen.getByRole('button', { name: 'Clear search', hidden: true });
        expect(button).toBeInTheDocument();
    });
});
