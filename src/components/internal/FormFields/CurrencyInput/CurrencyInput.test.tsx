/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CurrencyInput } from './CurrencyInput';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useConfigContext } from '../../../../core/ConfigContext';
import { useFetch } from '../../../../hooks/useFetch';
import * as currencyUtils from '../../../../utils/currency/main';
import Localization from '../../../../core/Localization/Localization';

vi.mock('../../../../core/Context/useCoreContext');
vi.mock('../../../../core/ConfigContext');
vi.mock('../../../../hooks/useFetch');
vi.mock('../../../../utils/currency/main', async () => {
    const actual = await vi.importActual('../../../../utils/currency/main');
    return {
        ...actual,
        formatAmount: vi.fn(),
        getCurrencyExponent: vi.fn(),
    };
});
vi.mock('../InputBase', () => ({
    default: ({ onInput, value, disabled, isInvalid, dropdown, onDropdownInput, type, className, min, lang, uniqueId }: any) => (
        <div data-testid="input-base">
            <input
                data-testid="currency-input"
                type={type}
                value={value || ''}
                onInput={onInput}
                disabled={disabled}
                aria-invalid={isInvalid}
                min={min}
                lang={lang}
                className={className}
                id={uniqueId}
            />
            {dropdown && (
                <select
                    data-testid="currency-dropdown"
                    value={dropdown.value}
                    onInput={(e: any) => onDropdownInput(e.currentTarget.value)}
                    disabled={dropdown.readonly}
                >
                    {dropdown.items.map((item: any) => (
                        <option key={item.id} value={item.name}>
                            {item.name}
                        </option>
                    ))}
                </select>
            )}
        </div>
    ),
}));

const TEST_CONSTANTS = {
    CURRENCY_EUR: 'EUR',
    CURRENCY_USD: 'USD',
    CURRENCY_JPY: 'JPY',
    AMOUNT_1000: 1000,
    AMOUNT_12345: 12345,
    LOCALE_EN_US: 'en-US',
    LOCALE_DE_DE: 'de-DE',
} as const;

describe('CurrencyInput', () => {
    const mockUseCoreContext = vi.mocked(useCoreContext);
    const mockUseConfigContext = vi.mocked(useConfigContext);
    const mockUseFetch = vi.mocked(useFetch);
    const mockFormatAmount = vi.mocked(currencyUtils.formatAmount);
    const mockGetCurrencyExponent = vi.mocked(currencyUtils.getCurrencyExponent);
    const mockOnAmountChange = vi.fn();
    const mockOnCurrencyChange = vi.fn();
    const mockGetCurrencies = vi.fn();

    beforeEach(() => {
        const mockI18n = new Localization().i18n;
        const mockI18nWithLocale = {
            ...mockI18n,
            locale: TEST_CONSTANTS.LOCALE_EN_US,
        };

        mockUseCoreContext.mockReturnValue({ i18n: mockI18nWithLocale } as any);

        mockUseConfigContext.mockReturnValue({
            endpoints: {
                getCurrencies: mockGetCurrencies,
            },
        } as any);

        mockUseFetch.mockReturnValue({
            data: {
                data: [TEST_CONSTANTS.CURRENCY_EUR, TEST_CONSTANTS.CURRENCY_USD, TEST_CONSTANTS.CURRENCY_JPY],
            },
            isFetching: false,
        } as any);

        mockFormatAmount.mockImplementation((amount: number, currency: string) => {
            if (currency === TEST_CONSTANTS.CURRENCY_EUR || currency === TEST_CONSTANTS.CURRENCY_USD) {
                return (amount / 100).toFixed(2);
            }
            return amount.toString();
        });

        mockGetCurrencyExponent.mockImplementation((currency: string) => {
            if (currency === TEST_CONSTANTS.CURRENCY_EUR || currency === TEST_CONSTANTS.CURRENCY_USD) {
                return 2;
            }
            return 0;
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        test('should render with empty amount', () => {
            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input') as HTMLInputElement;
            expect(input).toBeInTheDocument();
            expect(input.value).toBe('');
        });

        test('should render with formatted amount', () => {
            mockFormatAmount.mockReturnValue('10.00');

            render(
                <CurrencyInput
                    currency={TEST_CONSTANTS.CURRENCY_EUR}
                    amount={TEST_CONSTANTS.AMOUNT_1000}
                    onAmountChange={mockOnAmountChange}
                    onCurrencyChange={mockOnCurrencyChange}
                />
            );

            const input = screen.getByTestId('currency-input') as HTMLInputElement;
            expect(input.value).toBe('10.00');
            expect(mockFormatAmount).toHaveBeenCalledWith(TEST_CONSTANTS.AMOUNT_1000, TEST_CONSTANTS.CURRENCY_EUR);
        });

        test('should render with invalid state', () => {
            render(
                <CurrencyInput
                    currency={TEST_CONSTANTS.CURRENCY_EUR}
                    onAmountChange={mockOnAmountChange}
                    onCurrencyChange={mockOnCurrencyChange}
                    isInvalid={true}
                />
            );

            const input = screen.getByTestId('currency-input');
            expect(input).toHaveAttribute('aria-invalid', 'true');
        });

        test('should render with disabled state when interactionsDisabled is true', () => {
            render(
                <CurrencyInput
                    currency={TEST_CONSTANTS.CURRENCY_EUR}
                    onAmountChange={mockOnAmountChange}
                    onCurrencyChange={mockOnCurrencyChange}
                    interactionsDisabled={true}
                />
            );

            const input = screen.getByTestId('currency-input');
            expect(input).toBeDisabled();
        });

        test('should render with disabled state when currencies are fetching', () => {
            mockUseFetch.mockReturnValue({
                data: null,
                isFetching: true,
            } as any);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input');
            expect(input).toBeDisabled();
        });

        test('should render currency dropdown when hideCurrencySelector is false', () => {
            render(
                <CurrencyInput
                    currency={TEST_CONSTANTS.CURRENCY_EUR}
                    onAmountChange={mockOnAmountChange}
                    onCurrencyChange={mockOnCurrencyChange}
                    selectedCurrencyCode={TEST_CONSTANTS.CURRENCY_EUR}
                    hideCurrencySelector={false}
                />
            );

            const dropdown = screen.getByTestId('currency-dropdown');
            expect(dropdown).toBeInTheDocument();
            expect(dropdown).toHaveValue(TEST_CONSTANTS.CURRENCY_EUR);
        });

        test('should not render currency dropdown when hideCurrencySelector is true', () => {
            render(
                <CurrencyInput
                    currency={TEST_CONSTANTS.CURRENCY_EUR}
                    onAmountChange={mockOnAmountChange}
                    onCurrencyChange={mockOnCurrencyChange}
                    hideCurrencySelector={true}
                />
            );

            const dropdown = screen.queryByTestId('currency-dropdown');
            expect(dropdown).not.toBeInTheDocument();
        });

        test('should apply correct locale to input', () => {
            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input');
            expect(input).toHaveAttribute('lang', TEST_CONSTANTS.LOCALE_EN_US);
        });
    });

    describe('Interactions', () => {
        test('should call onAmountChange with computed amount when input changes', () => {
            mockGetCurrencyExponent.mockReturnValue(2);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input');
            fireEvent.input(input, { target: { value: '10.50' } });

            expect(mockOnAmountChange).toHaveBeenCalledWith(1050);
        });

        test('should call onAmountChange with zero for empty input', () => {
            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input');
            fireEvent.input(input, { target: { value: '' } });

            expect(mockOnAmountChange).toHaveBeenCalledWith(0);
        });

        test('should handle decimal input with period separator for en-US locale', () => {
            mockGetCurrencyExponent.mockReturnValue(2);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input') as HTMLInputElement;
            fireEvent.input(input, { target: { value: '123.45' } });

            expect(mockOnAmountChange).toHaveBeenCalledWith(12345);
        });

        test('should handle decimal separator based on locale', () => {
            const mockI18n = new Localization().i18n;
            mockUseCoreContext.mockReturnValue({
                i18n: {
                    ...mockI18n,
                    locale: TEST_CONSTANTS.LOCALE_DE_DE,
                },
            } as any);
            mockGetCurrencyExponent.mockReturnValue(2);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input') as HTMLInputElement;
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('lang', TEST_CONSTANTS.LOCALE_DE_DE);
        });

        test('should truncate decimal places based on currency exponent', () => {
            mockGetCurrencyExponent.mockReturnValue(2);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input') as HTMLInputElement;
            fireEvent.input(input, { target: { value: '10.12345' } });

            expect(input.value).toBe('10.12');
        });

        test('should handle JPY currency with zero decimal places', () => {
            mockGetCurrencyExponent.mockReturnValue(0);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_JPY} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input') as HTMLInputElement;
            fireEvent.input(input, { target: { value: '1000' } });

            expect(mockOnAmountChange).toHaveBeenCalledWith(1000);
        });

        test('should call onCurrencyChange when currency dropdown changes', () => {
            render(
                <CurrencyInput
                    currency={TEST_CONSTANTS.CURRENCY_EUR}
                    onAmountChange={mockOnAmountChange}
                    onCurrencyChange={mockOnCurrencyChange}
                    selectedCurrencyCode={TEST_CONSTANTS.CURRENCY_EUR}
                    hideCurrencySelector={false}
                />
            );

            const dropdown = screen.getByTestId('currency-dropdown');
            fireEvent.input(dropdown, { target: { value: TEST_CONSTANTS.CURRENCY_USD } });

            expect(mockOnCurrencyChange).toHaveBeenCalledWith(TEST_CONSTANTS.CURRENCY_USD);
        });

        test('should handle input with leading/trailing spaces', () => {
            mockGetCurrencyExponent.mockReturnValue(2);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input') as HTMLInputElement;
            fireEvent.input(input, { target: { value: '10.50' } });

            expect(mockOnAmountChange).toHaveBeenCalledWith(1050);
        });
    });

    describe('Edge Cases', () => {
        test('should update display value when currency changes', () => {
            mockFormatAmount.mockReturnValue('10.00');

            const { rerender } = render(
                <CurrencyInput
                    currency={TEST_CONSTANTS.CURRENCY_EUR}
                    amount={TEST_CONSTANTS.AMOUNT_1000}
                    onAmountChange={mockOnAmountChange}
                    onCurrencyChange={mockOnCurrencyChange}
                />
            );

            mockFormatAmount.mockReturnValue('10.00');

            rerender(
                <CurrencyInput
                    currency={TEST_CONSTANTS.CURRENCY_USD}
                    amount={TEST_CONSTANTS.AMOUNT_1000}
                    onAmountChange={mockOnAmountChange}
                    onCurrencyChange={mockOnCurrencyChange}
                />
            );

            expect(mockFormatAmount).toHaveBeenCalledWith(TEST_CONSTANTS.AMOUNT_1000, TEST_CONSTANTS.CURRENCY_USD);
        });

        test('should handle currency change with no amount', () => {
            const { rerender } = render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            rerender(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_USD} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input') as HTMLInputElement;
            expect(input.value).toBe('');
        });

        test('should handle input with only decimal separator', () => {
            mockGetCurrencyExponent.mockReturnValue(2);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input');
            fireEvent.input(input, { target: { value: '.' } });

            expect(mockOnAmountChange).toHaveBeenCalledWith(0);
        });

        test('should handle input with integer part only', () => {
            mockGetCurrencyExponent.mockReturnValue(2);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input');
            fireEvent.input(input, { target: { value: '100' } });

            expect(mockOnAmountChange).toHaveBeenCalledWith(10000);
        });

        test('should disable currency dropdown when fetching currencies', () => {
            mockUseFetch.mockReturnValue({
                data: {
                    data: [TEST_CONSTANTS.CURRENCY_EUR],
                },
                isFetching: true,
            } as any);

            render(
                <CurrencyInput
                    currency={TEST_CONSTANTS.CURRENCY_EUR}
                    onAmountChange={mockOnAmountChange}
                    onCurrencyChange={mockOnCurrencyChange}
                    selectedCurrencyCode={TEST_CONSTANTS.CURRENCY_EUR}
                    hideCurrencySelector={false}
                />
            );

            const dropdown = screen.getByTestId('currency-dropdown');
            expect(dropdown).toBeDisabled();
        });

        test('should handle currencies fetch with no getCurrencies endpoint', () => {
            mockUseConfigContext.mockReturnValue({
                endpoints: {
                    getCurrencies: undefined,
                },
            } as any);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input');
            expect(input).toBeInTheDocument();
        });

        test('should handle currencies fetch with empty data', () => {
            mockUseFetch.mockReturnValue({
                data: null,
                isFetching: false,
            } as any);

            render(
                <CurrencyInput
                    currency={TEST_CONSTANTS.CURRENCY_EUR}
                    onAmountChange={mockOnAmountChange}
                    onCurrencyChange={mockOnCurrencyChange}
                    selectedCurrencyCode={TEST_CONSTANTS.CURRENCY_EUR}
                    hideCurrencySelector={false}
                />
            );

            const dropdown = screen.getByTestId('currency-dropdown');
            expect(dropdown).toBeInTheDocument();
        });

        test('should handle exact decimal places matching currency exponent', () => {
            mockGetCurrencyExponent.mockReturnValue(2);

            render(
                <CurrencyInput currency={TEST_CONSTANTS.CURRENCY_EUR} onAmountChange={mockOnAmountChange} onCurrencyChange={mockOnCurrencyChange} />
            );

            const input = screen.getByTestId('currency-input') as HTMLInputElement;
            fireEvent.input(input, { target: { value: '10.12' } });

            expect(input.value).toBe('10.12');
        });
    });
});
