import { useState } from 'preact/hooks';
import { Controller, useForm, FormProvider, useFormContext } from '../index';
import InputBase from '../../../components/internal/FormFields/InputBase';

// Step 1: Personal Information
function StepPersonalInfo() {
    const { control, formState } = useFormContext<FormValues>();

    return (
        <div>
            <h3>Personal Information</h3>

            <Controller
                name="firstName"
                control={control}
                rules={{
                    required: 'First name is required',
                    minLength: { value: 2, message: 'First name must be at least 2 characters' },
                }}
                render={({ field, fieldState }) => (
                    <InputBase
                        {...field}
                        type="text"
                        uniqueId="firstName"
                        placeholder="Enter your first name"
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                    />
                )}
            />

            <Controller
                name="lastName"
                control={control}
                rules={{
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                }}
                render={({ field, fieldState }) => (
                    <InputBase
                        {...field}
                        type="text"
                        uniqueId="lastName"
                        placeholder="Enter your last name"
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                    />
                )}
            />

            <Controller
                name="email"
                control={control}
                rules={{
                    required: 'Email is required',
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                    },
                    validate: async value => {
                        // Simulate async email check
                        return new Promise(resolve => {
                            setTimeout(() => {
                                if (value === 'test@example.com') {
                                    resolve('This email is already registered');
                                } else {
                                    resolve(true);
                                }
                            }, 500);
                        });
                    },
                }}
                render={({ field, fieldState }) => (
                    <InputBase
                        {...field}
                        type="email"
                        uniqueId="email"
                        placeholder="Enter your email"
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                    />
                )}
            />
        </div>
    );
}

// Step 2: Address Information
function StepAddressInfo() {
    const { control, formState } = useFormContext<FormValues>();

    return (
        <div>
            <h3>Address Information</h3>

            <Controller
                name="street"
                control={control}
                rules={{
                    required: 'Street address is required',
                }}
                render={({ field, fieldState }) => (
                    <InputBase
                        {...field}
                        type="text"
                        uniqueId="street"
                        placeholder="Enter your street address"
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                    />
                )}
            />

            <Controller
                name="city"
                control={control}
                rules={{
                    required: 'City is required',
                }}
                render={({ field, fieldState }) => (
                    <InputBase
                        {...field}
                        type="text"
                        uniqueId="city"
                        placeholder="Enter your city"
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                    />
                )}
            />

            <Controller
                name="zipCode"
                control={control}
                rules={{
                    required: 'ZIP code is required',
                    pattern: {
                        value: /^\d{5}(-\d{4})?$/,
                        message: 'Invalid ZIP code format',
                    },
                }}
                render={({ field, fieldState }) => (
                    <InputBase
                        {...field}
                        type="text"
                        uniqueId="zipCode"
                        placeholder="Enter your ZIP code"
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                    />
                )}
            />
        </div>
    );
}

// Step 3: Additional Information
function StepAdditionalInfo() {
    const { control, formState } = useFormContext<FormValues>();

    return (
        <div>
            <h3>Additional Information</h3>

            <Controller
                name="phone"
                control={control}
                rules={{
                    required: 'Phone number is required',
                    pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: 'Invalid phone number format',
                    },
                }}
                render={({ field, fieldState }) => (
                    <InputBase
                        {...field}
                        type="tel"
                        uniqueId="phone"
                        placeholder="Enter your phone number"
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                    />
                )}
            />

            <Controller
                name="comments"
                control={control}
                rules={{
                    maxLength: {
                        value: 500,
                        message: 'Comments cannot exceed 500 characters',
                    },
                }}
                render={({ field, fieldState }) => (
                    <InputBase
                        {...field}
                        type="text"
                        uniqueId="comments"
                        placeholder="Enter any additional comments (optional)"
                        isInvalid={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                    />
                )}
            />
        </div>
    );
}

// Form values type
interface FormValues {
    firstName: string;
    lastName: string;
    email: string;
    street: string;
    city: string;
    zipCode: string;
    phone: string;
    comments?: string;
}

// Main multistep form component
export default function MultistepFormExample() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isValidating, setIsValidating] = useState(false);
    const totalSteps = 3;

    const form = useForm<FormValues>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            street: '',
            city: '',
            zipCode: '',
            phone: '',
            comments: '',
        },
        mode: 'all', // Validate on both input and blur
    });

    const handleNext = async () => {
        setIsValidating(true);

        try {
            // Determine which fields to validate for current step
            let fieldsToValidate: (keyof FormValues)[] = [];

            if (currentStep === 1) {
                fieldsToValidate = ['firstName', 'lastName', 'email'];
            } else if (currentStep === 2) {
                fieldsToValidate = ['street', 'city', 'zipCode'];
            } else if (currentStep === 3) {
                fieldsToValidate = ['phone'];
            }

            // Mark fields as touched to show validation errors
            fieldsToValidate.forEach(field => {
                form.control._touched.set(field, true);
            });

            // Trigger validation for current step fields
            const validationResults = await Promise.all(fieldsToValidate.map(field => form.trigger(field)));
            const isStepValid = validationResults.every(result => result);

            // Notify to update UI with validation errors
            form.control.notify();

            // Only move to next step if validation passes
            if (isStepValid && currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
            } else if (!isStepValid) {
                console.log('Validation failed for step', currentStep);
            }
        } finally {
            setIsValidating(false);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onSubmit = async (data: FormValues) => {
        console.log('Form submitted successfully:', data);
        alert('Form submitted successfully! Check console for data.');
    };

    const onError = (errors: any) => {
        console.error('Form has errors:', errors);
        alert('Please fix the form errors before submitting.');
    };

    return (
        <FormProvider {...form}>
            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                <h2>Multistep Form Example</h2>
                <p>
                    Step {currentStep} of {totalSteps}
                </p>

                <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                    {currentStep === 1 && <StepPersonalInfo />}
                    {currentStep === 2 && <StepAddressInfo />}
                    {currentStep === 3 && <StepAdditionalInfo />}

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                        {currentStep > 1 && (
                            <button type="button" onClick={handlePrevious}>
                                Previous
                            </button>
                        )}

                        {currentStep < totalSteps && (
                            <button type="button" onClick={handleNext} disabled={isValidating}>
                                {isValidating ? 'Validating...' : 'Next'}
                            </button>
                        )}

                        {currentStep === totalSteps && (
                            <button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        )}
                    </div>

                    {/* Debug info - remove in production */}
                    <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                        <details>
                            <summary>Debug: Form State</summary>
                            <pre>{JSON.stringify(form.formState, null, 2)}</pre>
                        </details>
                        <details>
                            <summary>Debug: Form Values</summary>
                            <pre>{JSON.stringify(form.getValues(), null, 2)}</pre>
                        </details>
                    </div>
                </form>
            </div>
        </FormProvider>
    );
}
