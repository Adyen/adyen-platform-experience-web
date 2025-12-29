import { PBLFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';

import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';
import { SelectChangeEvent } from '../../../../../../../internal/FormFields/Select/types';
import { useWizardFormContext } from '../../../../../../../../hooks/form/wizard/WizardFormContext';

interface StoreFieldProps {
    items: { id: string; name: string }[];
}

const StoreField = ({ items }: StoreFieldProps) => {
    const { i18n } = useCoreContext();
    const { setFieldDisplayValue } = useWizardFormContext<PBLFormValues>();

    const handleChange = (event: SelectChangeEvent) => {
        const displayValue = items.find(item => item.id === event.target.value)?.name;
        setFieldDisplayValue('store', displayValue);
    };

    return (
        <FormSelect<PBLFormValues>
            fieldName={'store'}
            label={i18n.get('payByLink.linkCreation.fields.store.label')}
            items={items}
            preventInvalidState
            onChange={handleChange}
        />
    );
};

export default StoreField;
