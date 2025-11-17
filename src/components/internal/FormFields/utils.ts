import { JSX } from 'preact/jsx-runtime';
import { InteractionKeyCode } from '../../types';

interface FilterDisallowedCharactersProps {
    event: JSX.TargetedKeyboardEvent<HTMLInputElement>;
    inputType?: string;
    onValidInput: (event: JSX.TargetedKeyboardEvent<HTMLInputElement>) => void;
}

const filterDisallowedCharacters = ({ event, inputType, onValidInput }: FilterDisallowedCharactersProps) => {
    const input = event.currentTarget as HTMLInputElement;
    const { key } = event;

    // Allow navigation and editing keys
    const allowedKeys = [
        InteractionKeyCode.BACKSPACE,
        InteractionKeyCode.DELETE,
        InteractionKeyCode.ARROW_LEFT,
        InteractionKeyCode.ARROW_RIGHT,
        InteractionKeyCode.ARROW_UP,
        InteractionKeyCode.ARROW_DOWN,
        InteractionKeyCode.TAB,
    ];

    // Allow digits, period, comma, and minus
    const isAllowedChar = /^[0-9.,-]$/.test(key);
    const hasDecimal = /[.,]/.test(input.value);
    const isDecimalKey = key === '.' || key === ',';

    const isNavigationKey = allowedKeys.includes(key as InteractionKeyCode);
    const isDuplicateDecimal = hasDecimal && isDecimalKey;
    const isNumberInput = inputType === 'number';

    const shouldBlockInput = isNumberInput && !isNavigationKey && (!isAllowedChar || isDuplicateDecimal);

    if (shouldBlockInput) {
        event.preventDefault();
        return;
    }

    onValidInput(event);
};

export { filterDisallowedCharacters };
