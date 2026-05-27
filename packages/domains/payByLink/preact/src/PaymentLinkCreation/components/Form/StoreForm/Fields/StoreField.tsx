import { PaymentLinkCreationFormValues } from '../../../types';
import { useCoreContext } from '@integration-components/core/preact';

import { FormSelect } from '@integration-components/ui-components-preact/FormWrappers/FormSelect';
import { SelectChangeEvent } from '@integration-components/ui-components-preact/FormFields/Select/types';
import { useWizardFormContext } from '@integration-components/hooks-preact/form/wizard/WizardFormContext';
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
        [items, setFieldDisplayValue]
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
