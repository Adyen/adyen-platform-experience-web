export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'action' | 'filter' | 'link';

export interface ButtonProps {
    status?: string;
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
    onClick?: (e, callbacks) => void;
}

export interface ButtonState {
    completed?: boolean;
}
