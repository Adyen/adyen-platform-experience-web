import { useState, useEffect } from 'preact/hooks';
import { renderFormField } from '../FormFields';
import useCoreContext from '../../../core/Context/useCoreContext';
import { HTMLAttributes } from 'preact/compat';

/**
 * "Store details" generic checkbox
 */
function StoreDetails({ storeDetails = false, ...props }: { storeDetails: boolean; onChange: (value: boolean) => void }) {
    const { i18n } = useCoreContext();
    const [value, setValue] = useState(storeDetails);

    const onChange: HTMLAttributes<HTMLInputElement>['onChange'] = e => {
        setValue((e.target as HTMLInputElement)?.checked);
    };

    useEffect(() => {
        props.onChange(value);
    }, [value]);

    return (
        <div className="adyen-fp-store-details">
            {renderFormField('boolean', {
                onChange,
                label: i18n.get('storeDetails'),
                value: `${value}`,
                name: 'storeDetails',
            })}
        </div>
    );
}

export default StoreDetails;
