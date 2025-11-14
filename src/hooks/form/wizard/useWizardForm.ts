import { useReducer, useCallback, useMemo } from 'preact/hooks';
import { getNestedValue, useForm } from '../useForm';
import { UseWizardFormOptions, UseWizardFormReturn, WizardState, WizardAction, WizardStep, WizardSummaryData } from './types';
import { FieldValues } from '../types';

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
    switch (action.type) {
        case 'SET_STEP':
            return {
                ...state,
                currentStep: action.payload.step,
                visitedSteps: new Set([...state.visitedSteps, action.payload.step]),
            };

        case 'NEXT_STEP': {
            const nextStep = state.currentStep + 1;
            return {
                ...state,
                currentStep: nextStep,
                visitedSteps: new Set([...state.visitedSteps, nextStep]),
                completedSteps: new Set([...state.completedSteps, state.currentStep]),
            };
        }

        case 'PREVIOUS_STEP':
            return {
                ...state,
                currentStep: Math.max(0, state.currentStep - 1),
            };

        case 'MARK_STEP_COMPLETED':
            return {
                ...state,
                completedSteps: new Set([...state.completedSteps, action.payload.step]),
            };

        case 'MARK_STEP_VISITED':
            return {
                ...state,
                visitedSteps: new Set([...state.visitedSteps, action.payload.step]),
            };

        case 'SET_STEP_VALIDATION': {
            const newValidation = new Map(state.stepValidation);
            newValidation.set(action.payload.step, action.payload.isValid);
            return {
                ...state,
                stepValidation: newValidation,
            };
        }

        case 'SET_TRANSITIONING':
            return {
                ...state,
                isTransitioning: action.payload,
            };

        case 'RESET_WIZARD':
            return {
                currentStep: 0,
                completedSteps: new Set(),
                visitedSteps: new Set([0]),
                stepValidation: new Map(),
                isTransitioning: false,
                displayValues: new Map(),
            };

        case 'SET_DISPLAY_VALUE': {
            const next = new Map(state.displayValues);
            const { field, displayValue } = action.payload;
            if (displayValue === undefined) {
                next.delete(field);
            } else {
                next.set(field, displayValue);
            }
            return { ...state, displayValues: next };
        }

        case 'RESET_DISPLAY_VALUES':
            return { ...state, displayValues: new Map() };

        default:
            return state;
    }
}

export function useWizardForm<TFieldValues>(options: UseWizardFormOptions<TFieldValues>): UseWizardFormReturn<TFieldValues> {
    const { steps, defaultValues, mode = 'onBlur', onStepChange, validateBeforeNext = true } = options;

    const [wizardState, dispatch] = useReducer(wizardReducer, {
        currentStep: 0,
        completedSteps: new Set<number>(),
        visitedSteps: new Set<number>([0]),
        stepValidation: new Map<number, boolean>(),
        isTransitioning: false,
        displayValues: new Map<string, string>(),
    });

    const form = useForm<TFieldValues>({
        defaultValues,
        mode,
    });

    const { trigger, getValues } = form;

    const totalSteps = steps.length;
    const currentStepConfig = steps[wizardState.currentStep]!;
    const isFirstStep = wizardState.currentStep === 0;
    const isLastStep = wizardState.currentStep === totalSteps - 1;
    const canGoPrevious = !isFirstStep && !wizardState.isTransitioning;
    const canGoNext = !isLastStep && !wizardState.isTransitioning;
    const fieldsConfig: Record<FieldValues<TFieldValues>, WizardStep<TFieldValues>['fields'][number]> = useMemo(() => {
        return steps
            .flatMap(step => step.fields)
            .reduce(
                (prev, currentValue) => ({ ...prev, [currentValue.fieldName]: currentValue }),
                {} as Record<FieldValues<TFieldValues>, WizardStep<TFieldValues>['fields'][number]>
            );
    }, [steps]);

    const validateStep = useCallback(
        async (stepIndex: number): Promise<boolean> => {
            const step = steps[stepIndex];
            if (!step) return false;

            // Skip validation for optional steps if no fields are filled
            if (step.isOptional) {
                const values = getValues();
                const hasValues = step.fields.some(({ fieldName }) => {
                    const value = getNestedValue(values, fieldName as string);
                    return value !== undefined && value !== '' && value !== null;
                });
                if (!hasValues) return true;
            }

            // Trigger validation for all fields in this step
            const validationResults = await Promise.all(step.fields.map(({ fieldName }) => trigger(fieldName)));

            const fieldsValid = validationResults.every(result => result);

            // Run custom step validation if provided
            if (fieldsValid && step.validate) {
                const values = getValues();
                const customValid = await step.validate(values);
                return customValid;
            }

            return fieldsValid;
        },
        [steps, getValues, trigger]
    );

    const validateCurrentStep = useCallback(async (): Promise<boolean> => {
        const isValid = await validateStep(wizardState.currentStep);
        dispatch({
            type: 'SET_STEP_VALIDATION',
            payload: { step: wizardState.currentStep, isValid },
        });
        return isValid;
    }, [wizardState.currentStep, validateStep]);

    const isStepValid = useCallback(
        (stepIndex: number): boolean => {
            return wizardState.stepValidation.get(stepIndex) ?? false;
        },
        [wizardState.stepValidation]
    );

    const isStepComplete = useCallback(
        (stepIndex: number): boolean => {
            return wizardState.completedSteps.has(stepIndex);
        },
        [wizardState.completedSteps]
    );

    const goToStep = useCallback(
        async (stepIndex: number, options?: { skipValidation?: boolean }): Promise<boolean> => {
            if (stepIndex < 0 || stepIndex >= totalSteps) {
                throw new Error(`Invalid step index: ${stepIndex}`);
            }

            if (!options?.skipValidation && validateBeforeNext && stepIndex > wizardState.currentStep) {
                dispatch({ type: 'SET_TRANSITIONING', payload: true });

                try {
                    const isValid = await validateCurrentStep();
                    if (!isValid) {
                        dispatch({ type: 'SET_TRANSITIONING', payload: false });
                        return false;
                    }

                    dispatch({ type: 'MARK_STEP_COMPLETED', payload: { step: wizardState.currentStep } });
                } catch (error) {
                    dispatch({ type: 'SET_TRANSITIONING', payload: false });
                    console.error('Wizard step validation failed:', error);
                    return false;
                }
            }

            const previousStep = wizardState.currentStep;
            dispatch({ type: 'SET_STEP', payload: { step: stepIndex } });
            dispatch({ type: 'SET_TRANSITIONING', payload: false });

            if (onStepChange) {
                onStepChange(stepIndex, previousStep);
            }

            return true;
        },
        [totalSteps, validateBeforeNext, wizardState.currentStep, validateCurrentStep, onStepChange]
    );

    const nextStep = useCallback(async (): Promise<boolean> => {
        if (!canGoNext) return false;

        dispatch({ type: 'SET_TRANSITIONING', payload: true });

        if (validateBeforeNext) {
            try {
                const isValid = await validateCurrentStep();
                if (!isValid) {
                    dispatch({ type: 'SET_TRANSITIONING', payload: false });
                    return false;
                }
            } catch (error) {
                console.error('Wizard step validation failed on nextStep:', error);
                dispatch({ type: 'SET_TRANSITIONING', payload: false });
                return false;
            }
        }

        const previousStep = wizardState.currentStep;
        dispatch({ type: 'NEXT_STEP' });
        dispatch({ type: 'SET_TRANSITIONING', payload: false });

        if (onStepChange) {
            onStepChange(previousStep + 1, previousStep);
        }

        return true;
    }, [canGoNext, validateBeforeNext, validateCurrentStep, wizardState.currentStep, onStepChange]);

    const previousStep = useCallback((): void => {
        if (!canGoPrevious) return;

        const previousStepIndex = wizardState.currentStep;
        dispatch({ type: 'PREVIOUS_STEP' });

        if (onStepChange) {
            onStepChange(previousStepIndex - 1, previousStepIndex);
        }
    }, [canGoPrevious, wizardState.currentStep, onStepChange]);

    const resetWizard = useCallback((): void => {
        dispatch({ type: 'RESET_WIZARD' });
    }, []);

    const setFieldDisplayValue = useCallback((name: FieldValues<TFieldValues>, displayValue?: string): void => {
        dispatch({ type: 'SET_DISPLAY_VALUE', payload: { field: name, displayValue } });
    }, []);

    const resetFieldDisplayValues = useCallback((): void => {
        dispatch({ type: 'RESET_DISPLAY_VALUES' });
    }, []);

    const getSummaryData = useCallback((): WizardSummaryData<TFieldValues> => {
        const values = getValues();
        const summary: WizardSummaryData<TFieldValues> = {};

        steps.forEach(step => {
            const stepFields = step.fields
                .filter(field => field.visible !== false)
                .map(field => ({
                    label: field.label,
                    value: getNestedValue(values, field.fieldName as string),
                    id: field.fieldName,
                    displayValue: wizardState.displayValues.get(field.fieldName as string),
                }))
                .filter(field => field.value !== undefined && field.value !== null && field.value !== '');

            if (stepFields.length > 0) {
                summary[step.id] = {
                    title: step.title,
                    fields: stepFields,
                };
            }
        });

        return summary;
    }, [steps, getValues, wizardState.displayValues]);

    return {
        ...form,
        // Wizard state
        currentStep: wizardState.currentStep,
        currentStepConfig,
        isFirstStep,
        isLastStep,
        canGoNext,
        canGoPrevious,
        fieldsConfig,

        // Navigation methods
        goToStep,
        nextStep,
        previousStep,
        resetWizard,

        // Validation methods
        validateStep,
        isStepValid,
        isStepComplete,

        // Summary data
        getSummaryData,

        // Display values
        setFieldDisplayValue,
        resetFieldDisplayValues,
    };
}
