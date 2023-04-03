import InputBase from './InputBase';
import { InputBaseProps } from './types';

export default function InputTelephone(props: InputBaseProps) {
    return <InputBase {...props} type="tel" />;
}
