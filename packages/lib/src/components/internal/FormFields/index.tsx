import InputText from './InputText';
import InputDate from './InputDate';
import InputTelephone from './InputTelephone';
import InputEmail from './InputEmail';
import RadioGroup from './RadioGroup';
import Checkbox from './Checkbox';
import Select from './Select';
import './FormFields.scss';

const formFieldTypes = {
    boolean: Checkbox,
    radio: RadioGroup,
    select: Select,
    // All the following use InputBase
    date: InputDate,
    emailAddress: InputEmail,
    tel: InputTelephone,
    text: InputText,
    default: InputText,
} as const;

type FormField = typeof formFieldTypes;

export const renderFormField = <T extends keyof FormField>(type: T, ...props: Parameters<FormField[typeof type]>) => {
    const FormInputElement = formFieldTypes[type] || formFieldTypes.default;

    return <FormInputElement {...(props[0] as any)} />;
};

export default renderFormField;
