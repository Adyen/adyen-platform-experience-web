import { ComponentChildren } from 'preact';

export interface ModalProps {
    title: string;
    children: ComponentChildren;
    classNameModifiers?: string[];
    isOpen: boolean;
    onClose(): void;
    isDismissible?: boolean;
}
