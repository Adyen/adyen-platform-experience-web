import { FieldValues, UseFormReturn } from '../types';
import { TranslationKey } from '../../../translations';

export interface WizardStep<TFieldValues> {
    id: string;
    title?: string;
    description?: string;
    fields: Readonly<{ fieldName: FieldValues<TFieldValues>; required: boolean; visible?: boolean; label?: TranslationKey }[]>;
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

export interface UseWizardFormOptions<TFieldValues> {
    steps: Readonly<WizardStep<TFieldValues>[]>;
    defaultValues?: Partial<TFieldValues>;
    mode?: 'onBlur' | 'onInput' | 'all';
    onStepChange?: (newStep: number, previousStep: number) => void;
    validateBeforeNext?: boolean; // Default true
}

export interface UseWizardFormReturn<TFieldValues> extends UseFormReturn<TFieldValues> {
    // Wizard state
    currentStep: number;
    currentStepConfig: WizardStep<TFieldValues>;
    isFirstStep: boolean;
    isLastStep: boolean;
    canGoNext: boolean;
    canGoPrevious: boolean;
    fieldsConfig: Partial<Record<FieldValues<TFieldValues>, WizardStep<TFieldValues>['fields'][number]>>;

    // Navigation methods
    goToStep: (step: number, options?: { skipValidation?: boolean }) => Promise<boolean>;
    nextStep: () => Promise<boolean>;
    previousStep: () => void;
    resetWizard: () => void;

    // Validation methods
    validateStep: (step: number) => Promise<boolean>;
    isStepValid: (step: number) => boolean;
    isStepComplete: (step: number) => boolean;

    // Summary data
    getSummaryData: () => WizardSummaryData<TFieldValues>;
}

export type WizardFormContextValue<TFieldValues> = UseWizardFormReturn<TFieldValues>;

export interface WizardSummaryData<TFieldValues> {
    [stepId: string]: {
        title?: string;
        fields: {
            id: FieldValues<TFieldValues>;
            label?: TranslationKey;
            value: any;
            displayValue?: string;
        }[];
    };
}
