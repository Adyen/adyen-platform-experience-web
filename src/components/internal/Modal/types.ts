import { ComponentChildren } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

export type ModalSize = 'fluid' | 'small' | 'large' | 'extra-large' | 'full-screen';

interface ModalBaseProps {
    title?: string;
    children: ComponentChildren;
    classNameModifiers?: string[];
    isOpen: boolean;
    onClose(): void;
    isDismissible?: boolean;
    headerWithBorder?: boolean;
    size?: ModalSize;
    dismissible?: boolean;
}

export type ModalProps = ModalBaseProps & Pick<JSXInternal.HTMLAttributes<HTMLElement>, 'aria-label'>;
