import { JSXInternal } from 'preact/src/jsx';
import { ButtonVariant } from '../Button/types';

export interface AccordionProps extends JSXInternal.HTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    expanded?: boolean;
    onChange?: () => void;
    headerLeft?: JSXInternal.Element | string; //controller?
    headerRight?: JSXInternal.Element | string; //controller?
    chevronPosition?: 'left' | 'right' | 'middle';
    inline?: boolean;
    iconButton?: boolean;
}
