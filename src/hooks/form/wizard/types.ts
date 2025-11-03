import { FieldError, UseFormReturn } from '../types';

export interface WizardStep<TFieldValues = Record<string, any>> {
    id: string;
    title: string;
    description?: string;
    fields: (keyof TFieldValues | string)[]; // Fields that belong to this step
    validate?: (values: Partial<TFieldValues>) => boolean | Promise<boolean>;
    isOptional?: boolean;
}

export interface WizardState {
    currentStep: number;
    completedSteps: Set<number>;
    visitedSteps: Set<number>;
    stepValidation: Map<number, boolean>;
    isTransitioning: boolean;
}

export type WizardAction =
    | { type: 'SET_STEP'; payload: { step: number } }
    | { type: 'NEXT_STEP' }
    | { type: 'PREVIOUS_STEP' }
    | { type: 'MARK_STEP_COMPLETED'; payload: { step: number } }
    | { type: 'MARK_STEP_VISITED'; payload: { step: number } }
    | { type: 'SET_STEP_VALIDATION'; payload: { step: number; isValid: boolean } }
    | { type: 'SET_TRANSITIONING'; payload: boolean }
    | { type: 'RESET_WIZARD' };

export interface UseWizardFormOptions<TFieldValues = Record<string, any>> {
    steps: WizardStep<TFieldValues>[];
    defaultValues?: Partial<TFieldValues>;
    mode?: 'onBlur' | 'onInput' | 'all';
    onStepChange?: (newStep: number, previousStep: number) => void;
    validateBeforeNext?: boolean; // Default true
}

export interface UseWizardFormReturn<TFieldValues = Record<string, any>> extends UseFormReturn<TFieldValues> {
    // Wizard-specific methods
    currentStep: number;
    totalSteps: number;
    currentStepConfig: WizardStep<TFieldValues>;
    isFirstStep: boolean;
    isLastStep: boolean;
    canGoNext: boolean;
    canGoPrevious: boolean;
    completedSteps: Set<number>;
    visitedSteps: Set<number>;

    // Navigation methods
    goToStep: (step: number, options?: { skipValidation?: boolean }) => Promise<boolean>;
    nextStep: () => Promise<boolean>;
    previousStep: () => void;

    // Validation methods
    validateCurrentStep: () => Promise<boolean>;
    validateStep: (step: number) => Promise<boolean>;
    getStepErrors: (step: number) => Record<string, FieldError>;
    isStepValid: (step: number) => boolean;
    isStepComplete: (step: number) => boolean;

    // Reset
    resetWizard: (values?: Partial<TFieldValues>) => void;
}

export type WizardFormContextValue<TFieldValues = Record<string, any>> = UseWizardFormReturn<TFieldValues>;

export interface WizardSummaryData {
    [stepId: string]: {
        title: string;
        fields: {
            label: string;
            value: any;
            displayValue?: string;
        }[];
    };
}
