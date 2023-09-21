import { ComponentChildren } from 'preact';

export type ModalSize = 'fluid' | 'small' | 'large' | 'extra-large' | 'full-screen';

export interface ModalProps {
    title: string;
    children: ComponentChildren;
    classNameModifiers?: string[];
    isOpen: boolean;
    onClose(): void;
    isDismissible?: boolean;
    headerWithBorder?: boolean;
    size?: ModalSize;
    dismissible?: boolean;
}
