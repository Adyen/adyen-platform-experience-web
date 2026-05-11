import { ComponentChildren, HTMLAttributes } from 'preact';
import type { ModalSize } from '@integration-components/types';

export type { ModalSize };

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

export type ModalProps = ModalBaseProps & Pick<HTMLAttributes<HTMLElement>, 'aria-label'>;
