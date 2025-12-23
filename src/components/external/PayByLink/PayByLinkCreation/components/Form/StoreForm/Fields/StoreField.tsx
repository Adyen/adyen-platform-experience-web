import { PBLFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';

import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';

interface StoreFieldProps {
    items: { id: string; name: string }[];
}

const StoreField = ({ items }: StoreFieldProps) => {
    const { i18n } = useCoreContext();

    return (
        <FormSelect<PBLFormValues>
            fieldName={'store'}
            label={i18n.get('payByLink.linkCreation.fields.store.label')}
            items={items}
            preventInvalidState
        />
    );
};

export default StoreField;
