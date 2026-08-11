/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/preact';
import { userEvent } from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { CurrencyInput } from './CurrencyInput';

const CURRENCY_NOK = 'NOK';
const CURRENCY_USD = 'USD';
const CURRENCY_ITEMS = [CURRENCY_NOK, 'EUR', CURRENCY_USD].map(currency => ({ id: currency, name: currency }));

test('should filter currencies case-insensitively and select a filtered result with the keyboard', async () => {
    const user = userEvent.setup();
    const onCurrencyChange = vi.fn();

    render(
        <CurrencyInput
            currency={CURRENCY_NOK}
            currencyItems={CURRENCY_ITEMS}
            onAmountChange={vi.fn()}
            onCurrencyChange={onCurrencyChange}
            selectedCurrencyCode={CURRENCY_NOK}
        />
    );

    await user.click(screen.getByTitle(CURRENCY_NOK));
    const currencySearch = screen.getByRole('combobox', { name: 'Select option' });
    await user.type(currencySearch, CURRENCY_USD.toLowerCase());

    expect(screen.getByRole('option', { name: CURRENCY_USD })).toBeVisible();
    expect(screen.queryByRole('option', { name: CURRENCY_NOK })).not.toBeInTheDocument();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onCurrencyChange).toHaveBeenCalledWith(CURRENCY_USD);
});
