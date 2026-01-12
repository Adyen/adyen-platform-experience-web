import { PaymentLinkCreationFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';

import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { SelectChangeEvent } from '../../../../../../../internal/FormFields/Select/types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';
import { useCallback } from 'preact/hooks';

interface StoreFieldProps {
    items: { id: string; name: string }[];
}

const StoreField = ({ items }: StoreFieldProps) => {
    const { i18n } = useCoreContext();
    const { setFieldDisplayValue } = useWizardFormContext<PaymentLinkCreationFormValues>();

    const handleChange = useCallback(
        (event: SelectChangeEvent) => {
            const displayValue = items.find(item => item.id === event.target.value)?.name;
            setFieldDisplayValue('store', displayValue);
        },
        [items]
    );

    return (
        <FormSelect<PaymentLinkCreationFormValues>
            fieldName={'store'}
            label={i18n.get('payByLink.creation.fields.store.label')}
            items={items}
            onChange={handleChange}
            preventInvalidState
        />
    );
};

export default StoreField;
