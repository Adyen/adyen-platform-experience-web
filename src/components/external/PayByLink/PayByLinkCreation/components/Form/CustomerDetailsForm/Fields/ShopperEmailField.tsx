import { Controller } from '../../../../../../../../hooks/form';
import { FormValues } from '../../../types';
import FormField from '../../FormField';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback, useMemo } from 'preact/hooks';
import InputBase from '../../../../../../../internal/FormFields/InputBase';

export const ShopperEmailField = () => {
    const { i18n } = useCoreContext();
    const { control, fieldsConfig } = useWizardFormContext<FormValues>();

    const isRequired = useMemo(() => fieldsConfig['emailAddress']?.required, [fieldsConfig]);

    const invalidEMailObject = useMemo(
        () => ({
            valid: false,
            message: i18n.get('payByLink.linkCreation.fields.shopperEmail.error.validEmail'),
        }),
        [i18n]
    );
    const validateEmail = useCallback(
        (email: string) => {
            email = String(email).toLowerCase().trim();

            // Check for basic structure
            const parts = email.split('@');
            if (parts.length !== 2) {
                return invalidEMailObject;
            }

            const [localPart, domain] = parts;

            if (!localPart || !domain) return invalidEMailObject;

            // Validate local part (before @)
            if (localPart.length === 0 || localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
                return invalidEMailObject;
            }

            // Validate domain part
            if (domain.length === 0 || domain.startsWith('.') || domain.endsWith('.') || domain.includes('..') || !domain.includes('.')) {
                return invalidEMailObject;
            }

            // Final regex check
            const emailRegex =
                // eslint-disable-next-line max-len
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

            if (!emailRegex.test(email)) {
                return invalidEMailObject;
            }

            return { valid: true };
        },
        [invalidEMailObject]
    );

    return (
        <FormField label={i18n.get('payByLink.linkCreation.fields.shopperEmail.label')} optional={!isRequired}>
            <Controller<FormValues>
                name="emailAddress"
                control={control}
                rules={{
                    required: isRequired,
                    validate: validateEmail,
                }}
                render={({ field, fieldState }) => {
                    return (
                        <InputBase {...field} type="email" isValid={false} isInvalid={!!fieldState.error} errorMessage={fieldState.error?.message} />
                    );
                }}
            />
        </FormField>
    );
};
