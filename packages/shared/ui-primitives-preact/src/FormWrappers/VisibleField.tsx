import { ComponentChildren } from 'preact';
import { FieldValues } from '@integration-components/hooks-preact/form/types';
import { useWizardFormContext } from '@integration-components/hooks-preact/form/wizard/WizardFormContext';

interface VisibleFieldProps<TFieldValues> {
    name: FieldValues<TFieldValues>;
    children: ComponentChildren;
}

export function VisibleField<TFieldValues>({ name, children }: VisibleFieldProps<TFieldValues>) {
    const { fieldsConfig } = useWizardFormContext<TFieldValues>();
    return fieldsConfig[name]?.visible ? <>{children}</> : null;
}
