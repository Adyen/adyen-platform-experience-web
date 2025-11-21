import { AriaAttributes } from 'preact/compat';
import { h } from 'preact';

export interface ToggleSwitchProps extends AriaAttributes {
    id?: string;
    name?: string;
    value?: string;
    checked?: boolean;
    onChange?: (evt: h.JSX.TargetedEvent<HTMLInputElement>) => any;
}
