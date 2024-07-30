import InputBase from './InputBase';
import { InputBaseProps } from './types';
import { ForwardedRef, forwardRef } from 'preact/compat';

export default forwardRef(function InputText(props: InputBaseProps, ref: ForwardedRef<HTMLInputElement | null>) {
    return <InputBase classNameModifiers={props.classNameModifiers} {...props} ref={ref} aria-required={props.required} type="text" />;
});
