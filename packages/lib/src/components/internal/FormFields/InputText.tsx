import { h } from 'preact';
import InputBase from './InputBase';

export default function InputText(props) {
    return <InputBase classNameModifiers={props.classNameModifiers} {...props} aria-required={props.required} type="text" />;
}
