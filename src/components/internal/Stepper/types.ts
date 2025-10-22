import { ComponentChildren } from 'preact';

export type StepperVariant = 'vertical' | 'horizontal';

export interface StepperProps {
    index: number;
    onChange: (index: number) => void;
    variant?: StepperVariant;
    children: ComponentChildren;
    nextStepDisabled?: boolean;
    ariaLabel: string;
}

export interface StepProps {
    index: number;
    active: boolean;
    completed: boolean;
    disabled: boolean;
    onClick: () => void;
    children: any;
    totalSteps: number;
}
