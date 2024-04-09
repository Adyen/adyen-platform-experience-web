import InputText from './InputText';
import Select from './Select';
import './FormFields.scss';

const formFieldTypes = {
    select: Select,
    // All the following use InputBase
    text: InputText,
    default: InputText,
} as const;

type FormField = typeof formFieldTypes;

export const renderFormField = <T extends keyof FormField>(type: T, ...props: Parameters<FormField[typeof type]>) => {
    const FormInputElement = formFieldTypes[type] || formFieldTypes.default;

    return <FormInputElement {...(props[0] as any)} />;
};

export default renderFormField;
