import InputBase from './InputBase';
import { InputBaseProps } from './types';
export default function InputEmail(props: InputBaseProps) {
    return <InputBase {...props} type="email" autoCapitalize="off" />;
}
