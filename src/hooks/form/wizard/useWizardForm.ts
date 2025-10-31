import { useReducer, useCallback } from 'preact/hooks';
import { useForm } from '../useForm';
import { UseWizardFormOptions, UseWizardFormReturn, WizardState, WizardAction, WizardStep } from './types';

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
    switch (action.type) {
        case 'SET_STEP':
            return {
                ...state,
                currentStep: action.payload.step,
                visitedSteps: new Set([...state.visitedSteps, action.payload.step]),
            };

        case 'NEXT_STEP': {
            const nextStep = Math.min(state.currentStep + 1, Number.MAX_SAFE_INTEGER);
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
            };

        default:
            return state;
    }
}

export function useWizardForm<TFieldValues = Record<string, any>>(options: UseWizardFormOptions<TFieldValues>): UseWizardFormReturn<TFieldValues> {
    const { steps, defaultValues, mode = 'onBlur', onStepChange, validateBeforeNext = true } = options;

    const [wizardState, dispatch] = useReducer(wizardReducer, {
        currentStep: 0,
        completedSteps: new Set<number>(),
        visitedSteps: new Set<number>([0]),
        stepValidation: new Map<number, boolean>(),
        isTransitioning: false,
    });

    const form = useForm<TFieldValues>({
        defaultValues,
        mode,
    });

    const { formState, trigger, getValues, reset: formReset } = form;

    const totalSteps = steps.length;
    const currentStepConfig = steps[wizardState.currentStep] || (steps[0] as WizardStep<TFieldValues>);
    const isFirstStep = wizardState.currentStep === 0;
    const isLastStep = wizardState.currentStep === totalSteps - 1;
    const canGoPrevious = !isFirstStep && !wizardState.isTransitioning;
    const canGoNext = !isLastStep && !wizardState.isTransitioning;

    const validateStep = useCallback(
        async (stepIndex: number): Promise<boolean> => {
            const step = steps[stepIndex];
            if (!step) return false;

            // Skip validation for optional steps if no fields are filled
            if (step.isOptional) {
                const values = getValues();
                const hasValues = step.fields.some(field => {
                    const value = values[field as keyof TFieldValues];
                    return value !== undefined && value !== '' && value !== null;
                });
                if (!hasValues) return true;
            }

            // Mark all fields in this step as touched
            step.fields.forEach(field => {
                const fieldName = field as string;
                form.control._touched.set(fieldName, true);
            });

            // Trigger validation for all fields in this step
            const validationResults = await Promise.all(step.fields.map(field => trigger(field as string)));
            const fieldsValid = validationResults.every(result => result);

            form.control.notify();

            // Run custom step validation if provided
            if (fieldsValid && step.validate) {
                try {
                    const values = getValues();
                    const customValid = await step.validate(values);
                    return customValid;
                } catch (error) {
                    console.error('Step validation error:', error);
                    return false;
                }
            }

            return fieldsValid;
        },
        [steps, form.control, trigger, getValues]
    );

    const validateCurrentStep = useCallback(async (): Promise<boolean> => {
        const isValid = await validateStep(wizardState.currentStep);
        dispatch({
            type: 'SET_STEP_VALIDATION',
            payload: { step: wizardState.currentStep, isValid },
        });
        return isValid;
    }, [wizardState.currentStep, validateStep]);

    const getStepErrors = useCallback(
        (stepIndex: number): Record<string, any> => {
            const step = steps[stepIndex];
            if (!step) return {};

            const errors: Record<string, any> = {};
            step.fields.forEach(field => {
                const fieldName = field as string;
                if (formState.errors[fieldName]) {
                    errors[fieldName] = formState.errors[fieldName];
                }
            });
            return errors;
        },
        [steps, formState.errors]
    );

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
                console.warn(`Invalid step index: ${stepIndex}`);
                return false;
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
                    return false;
                }
            }

            const previousStep = wizardState.currentStep;
            dispatch({ type: 'SET_STEP', payload: { step: stepIndex, skipValidation: options?.skipValidation } });
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
            const isValid = await validateCurrentStep();
            if (!isValid) {
                dispatch({ type: 'SET_TRANSITIONING', payload: false });
                return false;
            }
        }

        const previousStep = wizardState.currentStep;
        dispatch({ type: 'NEXT_STEP' });
        dispatch({ type: 'SET_TRANSITIONING', payload: false });

        if (onStepChange) {
            onStepChange(wizardState.currentStep + 1, previousStep);
        }

        return true;
    }, [canGoNext, validateBeforeNext, validateCurrentStep, wizardState.currentStep, onStepChange]);

    const previousStep = useCallback((): void => {
        if (!canGoPrevious) return;

        const previousStepIndex = wizardState.currentStep;
        dispatch({ type: 'PREVIOUS_STEP' });

        if (onStepChange) {
            onStepChange(wizardState.currentStep - 1, previousStepIndex);
        }
    }, [canGoPrevious, wizardState.currentStep, onStepChange]);

    const resetWizard = useCallback(
        (values?: Partial<TFieldValues>): void => {
            dispatch({ type: 'RESET_WIZARD' });
            formReset(values || defaultValues);
        },
        [formReset, defaultValues]
    );

    return {
        ...form,
        // Wizard state
        currentStep: wizardState.currentStep,
        totalSteps,
        currentStepConfig,
        isFirstStep,
        isLastStep,
        canGoNext,
        canGoPrevious,
        completedSteps: wizardState.completedSteps,
        visitedSteps: wizardState.visitedSteps,

        // Navigation methods
        goToStep,
        nextStep,
        previousStep,

        // Validation methods
        validateCurrentStep,
        validateStep,
        getStepErrors,
        isStepValid,
        isStepComplete,

        // Reset
        resetWizard,
    };
}
