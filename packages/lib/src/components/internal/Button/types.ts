export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'action' | 'filter' | 'link';
export type ButtonStatus = 'loading' | 'redirect' | 'default';

export interface ButtonProps {
    status?: ButtonStatus;
    /**
     * Class name modifiers will be used as: `adyen-fp-image--${modifier}`
     */
    classNameModifiers?: string[];
    variant?: ButtonVariant;
    disabled?: boolean;
    label?: string;
    secondaryLabel?: string;
    icon?: string;
    inline?: boolean;
    href?: string;
    target?: string;
    rel?: string;
    onClick?: (e?: Event, callbacks?: { [k: string]: (...args: any) => void }) => void;
}

export interface ButtonState {
    completed?: boolean;
}
