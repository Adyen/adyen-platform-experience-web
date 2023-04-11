import InputBase from './InputBase';
import { InputBaseProps } from './types';

export default function InputText(props: InputBaseProps) {
    return <InputBase classNameModifiers={props.classNameModifiers} {...props} aria-required={props.required} type="text" />;
}
