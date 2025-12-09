import { PBLFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';

import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { useCallback } from 'preact/hooks';

interface StoreFieldProps {
    items: { id: string; name: string }[];
    termsAndConditionsProvisioned?: boolean;
}

const StoreField = ({ items, termsAndConditionsProvisioned }: StoreFieldProps) => {
    const { i18n } = useCoreContext();

    const handleValidate = useCallback(() => {
        const isValid = termsAndConditionsProvisioned;
        return { valid: isValid ?? false };
    }, [termsAndConditionsProvisioned]);

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
