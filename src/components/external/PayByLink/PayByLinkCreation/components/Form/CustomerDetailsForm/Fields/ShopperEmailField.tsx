import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useCallback, useMemo } from 'preact/hooks';
import { FormTextInput } from '../../../../../../../internal/FormWrappers/FormTextInput';
import { PBL_CREATION_FIELD_LENGTHS } from '../../../../constants';
import { PBLFormValues } from '../../../types';

export const ShopperEmailField = () => {
    const { i18n } = useCoreContext();

    const invalidEMailObject = useMemo(
        () => ({
            valid: false,
            message: i18n.get('payByLink.creation.fields.shopperEmail.error.validEmail'),
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
        <FormTextInput<PBLFormValues>
            fieldName="shopperEmail"
            label={i18n.get('payByLink.creation.fields.shopperEmail.label')}
            validate={validateEmail}
            maxLength={PBL_CREATION_FIELD_LENGTHS.emailAddress.max}
        />
    );
};
