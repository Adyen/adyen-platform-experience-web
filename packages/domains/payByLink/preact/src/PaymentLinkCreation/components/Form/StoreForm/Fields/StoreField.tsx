import { PaymentLinkCreationFormValues, PaymentLinkStoreSelectItem } from '../../../../types';
import { useCoreContext } from '@integration-components/core/preact';

import { FormSelect } from '@integration-components/ui-components-preact/FormWrappers/FormSelect';
import { SelectChangeEvent } from '@integration-components/ui-components-preact/FormFields/Select/types';
import { StoreSelectorButtonContent, StoreSelectorItem } from '@integration-components/ui-components-preact/StoreSelector';
import { useWizardFormContext } from '@integration-components/hooks-preact/form/wizard/WizardFormContext';
import { useCallback } from 'preact/hooks';

interface StoreFieldProps {
    items: PaymentLinkStoreSelectItem[];
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
        <FormSelect<PaymentLinkCreationFormValues, PaymentLinkStoreSelectItem>
            fieldName={'store'}
            label={i18n.get('payByLink.creation.fields.store.label')}
            items={items}
            onChange={handleChange}
            preventInvalidState
            renderButtonContent={({ item }) => (
                <StoreSelectorButtonContent name={item?.name ?? i18n.get('common.inputs.select.placeholder')} description={item?.description} />
            )}
            renderListItem={data => <StoreSelectorItem name={data.item.name} description={data.item.description} />}
            withoutCollapseIndicator
        />
    );
};

export default StoreField;
