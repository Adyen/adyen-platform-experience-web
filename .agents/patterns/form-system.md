# Form System

The form system provides state management, validation, and controlled components for forms.

## Location

```
src/hooks/form/
├── useForm.ts          # Base form hook
├── Controller.tsx      # Controlled field wrapper
├── FormContext.tsx     # Form context provider
├── useWatch.ts         # Watch field values
├── types.ts            # Form types
└── wizard/
    ├── useWizardForm.ts      # Multi-step form hook
    └── WizardFormProvider.tsx # Wizard context
```

## Simple Forms with `useForm`

### Basic Setup

```typescript
import { useForm, Controller, FormProvider } from '../../hooks/form';

interface MyFormData {
    email: string;
    amount: number;
    description?: string;
}

const MyForm = () => {
    const form = useForm<MyFormData>({
        defaultValues: {
            email: '',
            amount: 0,
            description: '',
        },
    });

    const handleSubmit = async (data: MyFormData) => {
        // Submit logic
        console.log(data);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                {/* Fields */}
            </form>
        </FormProvider>
    );
};
```

### Controller Pattern

Use `Controller` to connect form state to input components:

```typescript
<Controller
    name="email"
    control={form.control}
    rules={{
        required: i18n.get('form.error.required'),
        pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: i18n.get('form.email.error.invalid'),
        },
    }}
    render={({ field, fieldState }) => (
        <InputText
            {...field}
            label={i18n.get('form.email.label')}
            error={fieldState.error?.message}
        />
    )}
/>
```

### Field Props from Controller

The `render` function receives:

```typescript
render={({ field, fieldState }) => {
    // field contains:
    field.name      // Field name
    field.value     // Current value
    field.onChange  // Change handler
    field.onBlur    // Blur handler
    field.ref       // Ref for focus management

    // fieldState contains:
    fieldState.error    // Validation error { message, type }
    fieldState.isDirty  // Has been modified
    fieldState.isTouched // Has been blurred
}}
```

### Validation Rules

```typescript
<Controller
    name="amount"
    rules={{
        required: 'Amount is required',
        min: { value: 1, message: 'Minimum amount is 1' },
        max: { value: 10000, message: 'Maximum amount is 10,000' },
        validate: (value) => {
            if (value % 100 !== 0) {
                return 'Amount must be in whole euros';
            }
            return true;
        },
    }}
    // ...
/>
```

### Watching Values

```typescript
import { useWatch } from '../../hooks/form';

const WatchedComponent = () => {
    const amount = useWatch({ name: 'amount' });

    return <div>Current amount: {amount}</div>;
};
```

### Form State

```typescript
const {
    formState: {
        isValid, // All fields valid
        isDirty, // Any field modified
        isSubmitting, // Submit in progress
        errors, // All errors object
    },
    reset, // Reset to default values
    setValue, // Set single field value
    getValues, // Get all current values
    trigger, // Trigger validation
} = form;
```

## Multi-Step Forms with `useWizardForm`

### Setup

```typescript
import { useWizardForm, WizardFormProvider } from '../../hooks/form/wizard';

interface WizardFormData {
    // Step 1
    email: string;
    name: string;
    // Step 2
    amount: number;
    currency: string;
    // Step 3
    terms: boolean;
}

const steps = [
    { id: 'personal', fields: ['email', 'name'] },
    { id: 'payment', fields: ['amount', 'currency'] },
    { id: 'confirmation', fields: ['terms'] },
];

const MyWizardForm = () => {
    const wizard = useWizardForm<WizardFormData>({
        steps,
        defaultValues: {
            email: '',
            name: '',
            amount: 0,
            currency: 'EUR',
            terms: false,
        },
    });

    const handleSubmit = async (data: WizardFormData) => {
        // Final submit
    };

    return (
        <WizardFormProvider {...wizard}>
            <WizardContent onSubmit={handleSubmit} />
        </WizardFormProvider>
    );
};
```

### Wizard Navigation

```typescript
const WizardContent = ({ onSubmit }) => {
    const {
        currentStep,      // Current step index
        currentStepId,    // Current step ID
        totalSteps,       // Total number of steps
        isFirstStep,      // Is first step
        isLastStep,       // Is last step
        nextStep,         // Go to next (validates current)
        previousStep,     // Go to previous
        goToStep,         // Go to specific step
        form,             // Underlying useForm instance
    } = useWizardContext();

    const handleNext = async () => {
        const valid = await nextStep();
        if (valid && isLastStep) {
            onSubmit(form.getValues());
        }
    };

    return (
        <div>
            <StepIndicator current={currentStep} total={totalSteps} />

            {currentStepId === 'personal' && <PersonalStep />}
            {currentStepId === 'payment' && <PaymentStep />}
            {currentStepId === 'confirmation' && <ConfirmationStep />}

            <div>
                {!isFirstStep && (
                    <Button onClick={previousStep}>
                        {i18n.get('wizard.back')}
                    </Button>
                )}
                <Button onClick={handleNext}>
                    {isLastStep ? i18n.get('wizard.submit') : i18n.get('wizard.next')}
                </Button>
            </div>
        </div>
    );
};
```

### Step Validation

Each step validates only its own fields before allowing navigation:

```typescript
const steps = [
    {
        id: 'personal',
        fields: ['email', 'name'],
        // Optional: custom validation for entire step
        validate: async values => {
            // Return true if valid, or error message
            return true;
        },
    },
];
```

## Common Form Components

### InputText

```typescript
<Controller
    name="name"
    render={({ field, fieldState }) => (
        <InputText
            {...field}
            label={i18n.get('form.name.label')}
            placeholder={i18n.get('form.name.placeholder')}
            error={fieldState.error?.message}
            required
        />
    )}
/>
```

### Select

```typescript
<Controller
    name="country"
    render={({ field, fieldState }) => (
        <Select
            {...field}
            label={i18n.get('form.country.label')}
            options={countries.map(c => ({ value: c.code, label: c.name }))}
            error={fieldState.error?.message}
        />
    )}
/>
```

### CurrencyInput

```typescript
<Controller
    name="amount"
    render={({ field, fieldState }) => (
        <CurrencyInput
            {...field}
            label={i18n.get('form.amount.label')}
            currency={currency}
            error={fieldState.error?.message}
        />
    )}
/>
```

### Checkbox

```typescript
<Controller
    name="terms"
    render={({ field }) => (
        <Checkbox
            {...field}
            checked={field.value}
            label={i18n.get('form.terms.label')}
        />
    )}
/>
```

## Checklist

- [ ] Form wrapped in `FormProvider` or `WizardFormProvider`
- [ ] All fields use `Controller` pattern
- [ ] Validation rules use i18n for error messages
- [ ] Submit button disabled when `!isValid` or `isSubmitting`
- [ ] Loading state shown during `isSubmitting`
- [ ] Error messages displayed via `fieldState.error?.message`
