import { JSX } from 'preact/jsx-runtime';

const convertFullToHalf = (str: string) => str.replace(/[！-～]/g, r => String.fromCharCode(r.charCodeAt(0) - 0xfee0));

const filterDisallowedCharacters = (e: JSX.TargetedKeyboardEvent<HTMLInputElement>, inputType?: string) => {
    if (inputType !== 'number') {
        return;
    }
    const input = e.currentTarget as HTMLInputElement;
    const { key } = e;

    // Allow navigation and editing keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'];
    if (allowedKeys.includes(key)) {
        return;
    }

    // Allow digits, period, comma, and minus
    const isAllowedChar = /^[0-9.,-]$/.test(key);
    const hasDecimal = /[.,]/.test(input.value);
    const isDecimalKey = key === '.' || key === ',';
    if (!isAllowedChar || (hasDecimal && isDecimalKey)) {
        e.preventDefault();
    }
};

export { convertFullToHalf, filterDisallowedCharacters };
