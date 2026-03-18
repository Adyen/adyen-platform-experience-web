import { FieldValues, UseFormReturn } from '../types';
import { TranslationKey } from '../../../translations';
import Localization from '../../../core/Localization';

export interface WizardStepField<TFieldValues> {
    fieldName: FieldValues<TFieldValues>;
    required: boolean;
    visible?: boolean;
    includeInApiPayload?: boolean;
    readOnly?: boolean;
    label?: TranslationKey;
    options?: any;
}

export interface WizardStep<TFieldValues> {
    id: string;
    title?: string;
    description?: string;
    fields: Readonly<WizardStepField<TFieldValues>[]>;
    validate?: (values: Partial<TFieldValues>) => boolean | Promise<boolean>;
    isOptional?: boolean;
}

export interface WizardState {
    currentStep: number;
    completedSteps: Set<number>;
    visitedSteps: Set<number>;
    stepValidation: Map<number, boolean>;
    isTransitioning: boolean;
    displayValues: Map<string, string>;
}

export type WizardAction =
    | { type: 'SET_STEP'; payload: { step: number } }
    | { type: 'NEXT_STEP' }
    | { type: 'PREVIOUS_STEP' }
    | { type: 'MARK_STEP_COMPLETED'; payload: { step: number } }
    | { type: 'MARK_STEP_VISITED'; payload: { step: number } }
    | { type: 'SET_STEP_VALIDATION'; payload: { step: number; isValid: boolean } }
    | { type: 'SET_TRANSITIONING'; payload: boolean }
    | { type: 'RESET_WIZARD' }
    | { type: 'SET_DISPLAY_VALUE'; payload: { field: string; displayValue?: string } }
    | { type: 'RESET_DISPLAY_VALUES' };

export interface UseWizardFormOptions<TFieldValues> {
    i18n: Localization['i18n'];
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
    getApiPayloadValues: () => Partial<TFieldValues>;

    // Display values
    getDisplayValue: (name: FieldValues<TFieldValues>) => string | undefined;
    setFieldDisplayValue: (name: FieldValues<TFieldValues>, displayValue?: string) => void;
    resetFieldDisplayValues: () => void;
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
