import { PBLFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';

import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { useCallback } from 'preact/hooks';

interface StoreFieldProps {
    items: { id: string; name: string }[];
    termsAndConditionsProvisioned?: boolean;
    themeFullyProvisioned?: boolean;
}

const StoreField = ({ items, termsAndConditionsProvisioned, themeFullyProvisioned }: StoreFieldProps) => {
    const { i18n } = useCoreContext();

    const handleValidate = useCallback(() => {
        const isValid = termsAndConditionsProvisioned && themeFullyProvisioned;
        return { valid: isValid ?? false };
    }, [termsAndConditionsProvisioned, themeFullyProvisioned]);

    return (
        <FormSelect<PBLFormValues>
            validate={handleValidate}
            fieldName={'store'}
            label={i18n.get('payByLink.linkCreation.fields.store.label')}
            items={items}
            preventInvalidState
        />
    );
};

export default StoreField;
