import Field from '../Field';
import Checkbox from '../Checkbox';
import { CheckboxProps } from '../Checkbox/Checkbox';

interface ConsentCheckboxProps extends CheckboxProps {
    errorMessage: string;
    data?: {
        consentCheckbox: string;
    };
}
export default function ConsentCheckbox({ errorMessage, label, onChange, ...props }: ConsentCheckboxProps) {
    return (
        <Field classNameModifiers={['consentCheckbox']} errorMessage={errorMessage}>
            <Checkbox
                name="consentCheckbox"
                classNameModifiers={[...(props.classNameModifiers ??= []), 'consentCheckbox']}
                onInput={onChange}
                value={props?.data?.consentCheckbox}
                label={label}
                checked={props.checked}
            />
        </Field>
    );
}
