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

    const handleChange = ({ target: { value } }: SelectChangeEvent) => {
        setFieldDisplayValue('store', items.find(item => item.id === value)?.name);
    };

    return (
        <FormSelect<PBLFormValues>
            fieldName={'store'}
            onChange={handleChange}
            label={i18n.get('payByLink.linkCreation.fields.store.label')}
            items={items}
            preventInvalidState
        />
    );
};

export default StoreField;
